package com.library.service;

import com.library.exception.ResourceNotFoundException;
import com.library.model.Book;
import com.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {
    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
    }

    public Book createBook(Book book) {
        book.setAvailability(true);
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book book = getBookById(id);
        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setCategory(bookDetails.getCategory());
        book.setIsbn(bookDetails.getIsbn());
        book.setPublishedDate(bookDetails.getPublishedDate());
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }

    public List<Book> searchBooks(String keyword) {
        String key = keyword == null ? "" : keyword.toLowerCase();
        return bookRepository.findAll().stream()
                .filter(b ->
                        (b.getTitle() != null && b.getTitle().toLowerCase().contains(key)) ||
                        (b.getAuthor() != null && b.getAuthor().toLowerCase().contains(key)) ||
                        (b.getCategory() != null && b.getCategory().toLowerCase().contains(key))
                )
                .toList();
    }

    public List<Book> searchByTitle(String title) {
        String t = title == null ? "" : title.toLowerCase();
        return bookRepository.findAll().stream()
                .filter(b -> b.getTitle() != null && b.getTitle().toLowerCase().contains(t))
                .toList();
    }

    public List<Book> searchByAuthor(String author) {
        String a = author == null ? "" : author.toLowerCase();
        return bookRepository.findAll().stream()
                .filter(b -> b.getAuthor() != null && b.getAuthor().toLowerCase().contains(a))
                .toList();
    }

    public List<Book> searchByCategory(String category) {
        String c = category == null ? "" : category.toLowerCase();
        return bookRepository.findAll().stream()
                .filter(b -> b.getCategory() != null && b.getCategory().toLowerCase().contains(c))
                .toList();
    }
}