package com.library.config;

import com.library.model.User;
import com.library.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

@Configuration
public class StartupDataFix {
    private static final Logger log = LoggerFactory.getLogger(StartupDataFix.class);

    @Bean
    CommandLineRunner ensureSeedPasswords(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            fixUserPassword(userRepository, passwordEncoder, "admin@library.com", "admin123");
            fixUserPassword(userRepository, passwordEncoder, "john@example.com", "member123");
        };
    }

    private void fixUserPassword(UserRepository userRepository, PasswordEncoder encoder, String email, String raw) {
        Optional<User> opt = userRepository.findByEmail(email);
        if (opt.isPresent()) {
            User u = opt.get();
            String encoded = u.getPassword();
            if (encoded == null || !encoder.matches(raw, encoded)) {
                u.setPassword(encoder.encode(raw));
                userRepository.save(u);
                log.info("Updated password for {} to match expected development credentials.", email);
            }
        }
    }

    @Bean
    CommandLineRunner ensureBorrowRecordsForeignKey(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // Check existing FK on borrow_records.book_id
                String checkSql = "SELECT constraint_name, referenced_table_name FROM information_schema.key_column_usage " +
                        "WHERE table_schema = DATABASE() AND table_name = 'borrow_records' AND column_name = 'book_id' " +
                        "AND referenced_table_name IS NOT NULL";

                var rows = jdbcTemplate.queryForList(checkSql);

                if (rows.isEmpty()) {
                    log.warn("No foreign key found on borrow_records.book_id. Adding FK to books(id)...");
                    jdbcTemplate.execute("ALTER TABLE borrow_records ADD CONSTRAINT fk_borrow_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE");
                    log.info("Added missing foreign key fk_borrow_book to borrow_records(book_id) -> books(id).");
                } else {
                    var row = rows.get(0);
                    String constraintName = String.valueOf(row.get("constraint_name"));
                    String referencedTable = String.valueOf(row.get("referenced_table_name"));
                    if (!"books".equalsIgnoreCase(referencedTable)) {
                        log.warn("Foreign key '{}' on borrow_records.book_id references '{}'. Fixing to reference 'books'...", constraintName, referencedTable);
                        jdbcTemplate.execute("ALTER TABLE borrow_records DROP FOREIGN KEY `" + constraintName + "`");
                        jdbcTemplate.execute("ALTER TABLE borrow_records ADD CONSTRAINT fk_borrow_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE");
                        log.info("Recreated foreign key fk_borrow_book to reference books(id).");
                    }
                }

                // Optional: detect legacy 'book' table and log guidance
                String legacyTableCheck = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'book'";
                Integer legacyTableCount = jdbcTemplate.queryForObject(legacyTableCheck, Integer.class);
                if (legacyTableCount != null && legacyTableCount > 0) {
                    log.warn("Detected legacy table 'book'. Consider dropping it if unused: DROP TABLE book;");
                }
            } catch (Exception e) {
                log.error("Failed to verify/fix borrow_records.book_id foreign key: {}", e.getMessage());
            }
        };
    }

    @Bean
    CommandLineRunner reconcileBookAvailability(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                // Sync books.availability with presence of active BORROWED records
                String sql = "UPDATE books b " +
                        "LEFT JOIN (SELECT book_id, COUNT(*) cnt FROM borrow_records WHERE status = 'BORROWED' GROUP BY book_id) br " +
                        "ON br.book_id = b.id " +
                        "SET b.availability = CASE WHEN br.cnt IS NULL OR br.cnt = 0 THEN 1 ELSE 0 END";
                int updated = jdbcTemplate.update(sql);
                log.info("Reconciled book availability flags. Rows affected: {}", updated);
            } catch (Exception e) {
                log.warn("Failed to reconcile book availability: {}", e.getMessage());
            }
        };
    }
}