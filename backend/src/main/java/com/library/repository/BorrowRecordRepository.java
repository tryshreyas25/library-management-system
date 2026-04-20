package com.library.repository;

import com.library.model.BorrowRecord;
import com.library.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUserAndStatus(User user, BorrowRecord.BorrowStatus status);

    @Query("SELECT br FROM BorrowRecord br WHERE br.status = 'BORROWED' AND br.returnDate < :date")
    List<BorrowRecord> findOverdueBooks(LocalDate date);

    @Query("SELECT br.book.id, br.book.title, COUNT(br) as borrowCount FROM BorrowRecord br GROUP BY br.book.id, br.book.title ORDER BY borrowCount DESC")
    List<Object[]> findMostBorrowedBooks();

    long countByStatus(BorrowRecord.BorrowStatus status);
}