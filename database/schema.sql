DROP TABLE book;

SELECT id, title FROM book;

SELECT * FROM borrow_records;
SELECT * FROM book WHERE id NOT IN (SELECT book_id FROM borrow_records);
SELECT * FROM book;

SET @fk = (
SELECT constraint_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
AND table_name = 'borrow_records'
AND column_name = 'book_id'
AND referenced_table_name = 'book'
LIMIT 1
);

SET @drop = IF(@fk IS NULL, 'SELECT 1', CONCAT('ALTER TABLE borrow_records DROP FOREIGN KEY ', @fk, ''));
PREPARE s1 FROM @drop; EXECUTE s1; DEALLOCATE PREPARE s1;

SET @add = 'ALTER TABLE borrow_records ADD CONSTRAINT fk_borrow_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE';
PREPARE s2 FROM @add; EXECUTE s2; DEALLOCATE PREPARE s2;

SELECT constraint_name, referenced_table_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
AND table_name = 'borrow_records'
AND column_name = 'book_id';

DROP TABLE IF EXISTS book;


borrow_records.book_id (whatever their names)
SET @drop_all = (
SELECT GROUP_CONCAT(CONCAT('ALTER TABLE borrow_records DROP FOREIGN KEY ', constraint_name, '') SEPARATOR '; ')
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
AND table_name = 'borrow_records'
AND column_name = 'book_id'
AND referenced_table_name IS NOT NULL
);
SET @drop_all = IF(@drop_all IS NULL OR @drop_all = '', 'SELECT 1', @drop_all);
PREPARE s1 FROM @drop_all; EXECUTE s1; DEALLOCATE PREPARE s1;


SET @fk_name_exists = (
SELECT COUNT(*) FROM information_schema.table_constraints
WHERE table_schema = DATABASE()
AND table_name = 'borrow_records'
AND constraint_name = 'fk_borrow_book'
AND constraint_type = 'FOREIGN KEY'
);
SET @drop_named = IF(@fk_name_exists=1, 'ALTER TABLE borrow_records DROP FOREIGN KEY fk_borrow_book', 'SELECT 1');
PREPARE s2 FROM @drop_named; EXECUTE s2; DEALLOCATE PREPARE s2;

ALTER TABLE borrow_records
ADD CONSTRAINT fk_borrow_records_book_id_books
FOREIGN KEY (book_id) REFERENCES books(id)
ON DELETE CASCADE;

SELECT constraint_name, referenced_table_name
FROM information_schema.key_column_usage
WHERE table_schema = DATABASE()
AND table_name = 'borrow_records'
AND column_name = 'book_id';