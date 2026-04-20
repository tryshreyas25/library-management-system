package com.library.service;

import com.library.dto.DashboardStats;
import com.library.model.BorrowRecord;
import com.library.model.Role;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRecordRepository;
import com.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public List<BorrowRecord> getOverdueBooks() {
        return borrowRecordRepository.findOverdueBooks(LocalDate.now());
    }

    public List<Map<String, Object>> getMostBorrowedBooks() {
        List<Object[]> results = borrowRecordRepository.findMostBorrowedBooks();
        return results.stream()
                .map(row -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("bookId", row[0]);
                    map.put("title", row[1]);
                    map.put("borrowCount", row[2]);
                    return map;
                })
                .toList();
    }

    public DashboardStats getDashboardStats() {
        long totalBooks = bookRepository.count();
        long totalMembers = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.MEMBER)
                .count();
        long borrowedBooks = borrowRecordRepository.countByStatus(BorrowRecord.BorrowStatus.BORROWED);
        long overdueBooks = getOverdueBooks().size();

        return new DashboardStats(totalBooks, totalMembers, borrowedBooks, overdueBooks);
    }
}