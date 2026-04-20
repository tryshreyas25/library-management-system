package com.library.dto;

import lombok.Data;

@Data
public class DashboardStats {
    private long totalBooks;
    private long totalMembers;
    private long borrowedBooks;
    private long overdueBooks;

    // No-args constructor required for serialization/deserialization frameworks
    // Fields default to 0; values are set via setters or the all-args constructor.
    public DashboardStats() {
        // intentionally empty
    }

    public DashboardStats(long totalBooks, long totalMembers, long borrowedBooks, long overdueBooks) {
        this.totalBooks = totalBooks;
        this.totalMembers = totalMembers;
        this.borrowedBooks = borrowedBooks;
        this.overdueBooks = overdueBooks;
    }
}