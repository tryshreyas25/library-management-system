
-- Idempotent inserts (safe to run on every startup)

-- Insert Admin User (password: password)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin User', 'admin@library.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- Insert Member Users (password: password)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MEMBER');
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Jane Smith', 'jane@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'MEMBER');

-- Insert Sample Books
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Clean Code', 'Robert C. Martin', 'Programming', '978-0132350884', TRUE, '2008-08-01');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('The Pragmatic Programmer', 'Andrew Hunt', 'Programming', '978-0201616224', TRUE, '1999-10-30');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Design Patterns', 'Erich Gamma', 'Programming', '978-0201633610', TRUE, '1994-10-31');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', 'Computer Science', '978-0262033848', TRUE, '2009-07-31');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Artificial Intelligence', 'Stuart Russell', 'AI', '978-0136042594', TRUE, '2009-12-11');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Database System Concepts', 'Abraham Silberschatz', 'Database', '978-0073523323', TRUE, '2010-04-12');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('The Art of Computer Programming', 'Donald Knuth', 'Computer Science', '978-0201896831', TRUE, '1997-11-14');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Cracking the Coding Interview', 'Gayle Laakmann McDowell', 'Programming', '978-0984782857', TRUE, '2015-07-01');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Head First Java', 'Kathy Sierra', 'Programming', '978-0596009205', TRUE, '2005-02-09');
INSERT IGNORE INTO books (title, author, category, isbn, availability, published_date) VALUES
('Effective Java', 'Joshua Bloch', 'Programming', '978-0134685991', TRUE, '2017-12-27');
