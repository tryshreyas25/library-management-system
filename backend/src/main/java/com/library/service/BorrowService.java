package com.library.service;

import com.library.exception.BookNotAvailableException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Book;
import com.library.model.BorrowRecord;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final JdbcTemplate jdbcTemplate;
    private final SchemaFixService schemaFixService;

    private static final Logger log = LoggerFactory.getLogger(BorrowService.class);

    @Transactional
    public BorrowRecord borrowBook(Long bookId, String userEmail) {
    // Preemptively ensure FK integrity (executed outside any transaction)
    schemaFixService.ensureBorrowRecordsForeignKey();

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (!book.isAvailability()) {
            throw new BookNotAvailableException("Book is not available for borrowing");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        book.setAvailability(false);
        bookRepository.save(book);

        BorrowRecord record = new BorrowRecord();
        record.setBook(book);
        record.setUser(user);
        record.setBorrowDate(LocalDate.now());
        record.setReturnDate(LocalDate.now().plusDays(14)); // 2 weeks borrowing period
        record.setStatus(BorrowRecord.BorrowStatus.BORROWED);

        // Save normally now that FK is ensured
        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord returnBook(Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found"));

        Book book = record.getBook();
        book.setAvailability(true);
        bookRepository.save(book);

        record.setStatus(BorrowRecord.BorrowStatus.RETURNED);
        return borrowRecordRepository.save(record);
    }

    public List<BorrowRecord> getUserBorrowedBooks(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return borrowRecordRepository.findByUserAndStatus(user, BorrowRecord.BorrowStatus.BORROWED);
    }

    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAll();
    }

}