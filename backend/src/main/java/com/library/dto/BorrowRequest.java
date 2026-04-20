package com.library.dto;

import lombok.Data;

@Data
public class BorrowRequest {
    private Long bookId;

    public Long getBookId() { return bookId; }
    public void setBookId(Long bookId) { this.bookId = bookId; }
}