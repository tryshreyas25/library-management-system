package com.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SchemaFixService {
    private static final Logger log = LoggerFactory.getLogger(SchemaFixService.class);
    private final JdbcTemplate jdbcTemplate;

    public SchemaFixService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Run DDL outside of any ongoing transaction to avoid rollback-only effects
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public void ensureBorrowRecordsForeignKey() {
        try {
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
        } catch (Exception e) {
            log.error("Failed to verify/fix borrow_records.book_id foreign key: {}", e.getMessage());
        }
    }
}
