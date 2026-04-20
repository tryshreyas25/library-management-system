package com.library.controller;

import com.library.dto.BorrowRequest;
import com.library.model.BorrowRecord;
import com.library.service.BorrowService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {
    private final BorrowService borrowService;

    @PostMapping
    @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<BorrowRecord> borrowBook(@RequestBody BorrowRequest request, Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(borrowService.borrowBook(request.getBookId(), userEmail));
    }

    @PutMapping("/{recordId}/return")
    @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<BorrowRecord> returnBook(@PathVariable Long recordId) {
        return ResponseEntity.ok(borrowService.returnBook(recordId));
    }

    @GetMapping("/my-books")
    @PreAuthorize("hasRole('MEMBER') or hasRole('ADMIN')")
    public ResponseEntity<List<BorrowRecord>> getMyBorrowedBooks(Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(borrowService.getUserBorrowedBooks(userEmail));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BorrowRecord>> getAllBorrowRecords() {
        return ResponseEntity.ok(borrowService.getAllBorrowRecords());
    }
}