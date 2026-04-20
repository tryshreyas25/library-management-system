package com.library.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class BookDTO {
    private Long id;
    private String title;
    private String author;
    private String category;
    private String isbn;
    private boolean availability;
    private LocalDate publishedDate;
}