# Library Management System

A full-stack web application for managing library operations including book cataloging, user authentication, borrowing/returning workflows, and reporting.

## 🚀 Quick Start

### Prerequisites
- **JDK 21+** (Java Development Kit)
- **Maven 3.8+** (Build tool)
- **Node.js 18+** & **npm** (Frontend runtime)
- **MySQL 8.x** (Database)

### Setup & Run

#### 1. Database Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
```

Update `backend/src/main/resources/application.properties` with your MySQL credentials:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
```

#### 2. Backend (Spring Boot)
```bash
cd backend
mvn clean package -DskipTests
mvn spring-boot:run
```
Backend runs on **http://localhost:8080**

#### 3. Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend runs on **http://localhost:3000**

### Default Credentials
| Role   | Email                | Password   |
|--------|----------------------|------------|
| Admin  | admin@library.com    | password   |
| Member | john@example.com     | password   |
| Member | jane@example.com     | password   |

---

## 📋 Features

### Core Functionality
- **Authentication & Authorization**
  - JWT-based login and registration
  - Role-based access control (ADMIN, MEMBER)
  - Secure password storage with BCrypt

- **Book Management** (Admin Only)
  - Create, read, update, delete books
  - Auto-managed availability status
  - Search and filter books by title, author, category

- **Borrowing System** (Members)
  - Borrow available books
  - Return borrowed books
  - View personal borrowing history

- **Reporting & Analytics** (Admin)
  - Dashboard statistics
  - Borrow records tracking
  - User management

### Technical Highlights
- **Data Integrity**
  - Automatic FK repair on startup (handles legacy schema migrations)
  - Availability reconciliation (syncs book status with active borrows)
  - Idempotent database seeding (safe restarts)
  
- **Resilient Frontend**
  - Null-safe rendering (guards against unexpected API responses)
  - Handles 204 No Content and non-JSON responses
  - Prevents JSON recursion with Jackson annotations

- **Security**
  - CORS configuration for cross-origin requests
  - JWT token validation on protected routes
  - Global exception handling

---

## 🏗️ Architecture

### Tech Stack

**Backend**
- Java 21
- Spring Boot 3.2.0
- Spring Security (JWT)
- Spring Data JPA (Hibernate)
- MySQL 8
- Maven
- Lombok

**Frontend**
- React 18
- Tailwind CSS
- Fetch API
- React Router (implied by navigation)

**Database**
- MySQL 8.x
- Schema management via `schema.sql`
- Seed data via `data.sql` (idempotent)

### Project Structure

```
library-management-system/
├── backend/
│   ├── src/main/java/com/library/
│   │   ├── controller/          # REST endpoints
│   │   │   ├── AuthController.java
│   │   │   ├── BookController.java
│   │   │   ├── BorrowController.java
│   │   │   ├── ReportController.java
│   │   │   └── UserController.java
│   │   ├── service/             # Business logic
│   │   │   ├── AuthService.java
│   │   │   ├── BookService.java
│   │   │   ├── BorrowService.java
│   │   │   ├── JwtService.java
│   │   │   └── ReportService.java
│   │   ├── repository/          # Data access
│   │   │   ├── BookRepository.java
│   │   │   ├── BorrowRecordRepository.java
│   │   │   └── UserRepository.java
│   │   ├── model/               # JPA entities
│   │   │   ├── Book.java
│   │   │   ├── BorrowRecord.java
│   │   │   ├── User.java
│   │   │   └── Role.java (enum)
│   │   ├── dto/                 # Data transfer objects
│   │   ├── config/              # Spring configuration
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   ├── CorsConfig.java
│   │   │   └── StartupDataFix.java
│   │   └── exception/           # Error handling
│   └── src/main/resources/
│       ├── application.properties
│       ├── schema.sql
│       └── data.sql
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main application component
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

### Data Flow

```
User Login
  ↓
AuthController → AuthService → JwtService
  ↓
JWT Token returned
  ↓
Frontend stores token → Includes in Authorization header
  ↓
Protected API calls (Books, Borrow, etc.)
  ↓
JwtAuthenticationFilter validates token
  ↓
Controller → Service → Repository → Database
  ↓
Response (JSON) → Frontend renders
```

### Database Schema

**users**
- id (PK)
- name
- email (unique)
- password (BCrypt)
- role (ADMIN/MEMBER)

**books**
- id (PK)
- title
- author
- category
- isbn (unique)
- availability (boolean)
- published_date

**borrow_records**
- id (PK)
- user_id (FK → users)
- book_id (FK → books)
- borrow_date
- return_date
- status (BORROWED/RETURNED)

---

## 🔌 API Reference

### Authentication
| Method | Endpoint            | Description          | Auth Required |
|--------|---------------------|----------------------|---------------|
| POST   | `/api/auth/register`| Register new user    | No            |
| POST   | `/api/auth/login`   | Login & get JWT      | No            |

**Login Request:**
```json
{
  "email": "admin@library.com",
  "password": "password"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "admin@library.com",
  "name": "Admin User",
  "role": "ADMIN"
}
```

### Books
| Method | Endpoint           | Description          | Role Required |
|--------|--------------------|----------------------|---------------|
| GET    | `/api/books`       | List all books       | Any           |
| POST   | `/api/books`       | Create book          | ADMIN         |
| PUT    | `/api/books/{id}`  | Update book          | ADMIN         |
| DELETE | `/api/books/{id}`  | Delete book          | ADMIN         |

**Create Book Request:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Programming",
  "isbn": "978-0132350884",
  "publishedDate": "2008-08-01"
}
```

### Borrowing
| Method | Endpoint                  | Description              | Role Required |
|--------|---------------------------|--------------------------|---------------|
| POST   | `/api/borrow`             | Borrow a book            | MEMBER        |
| POST   | `/api/return/{recordId}`  | Return a borrowed book   | MEMBER        |
| GET    | `/api/my-books`           | My borrowed books        | MEMBER        |
| GET    | `/api/borrow-records`     | All borrow records       | ADMIN         |

**Borrow Request:**
```json
{
  "bookId": 1
}
```

### Reports
| Method | Endpoint                 | Description          | Role Required |
|--------|--------------------------|----------------------|---------------|
| GET    | `/api/reports/dashboard` | Dashboard stats      | ADMIN         |

### Headers
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## 🛠️ Configuration

### Backend (`application.properties`)

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/library_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# SQL Initialization
spring.sql.init.mode=always

# JWT
jwt.secret=your-256-bit-secret-key-here-change-in-production
jwt.expiration=86400000

# Server
server.port=8080
```

### Frontend
Update API base URL in `App.jsx` if needed:
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Backend (8080)
# Find and kill process on Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Frontend (3000) - npm will auto-prompt for alternate port
```

**Database Connection Failed**
- Verify MySQL service is running
- Check credentials in `application.properties`
- Ensure `library_db` exists

**JWT 401 Unauthorized**
- Token expired (default: 24 hours) → login again
- Missing Authorization header
- Invalid token format (should be `Bearer <token>`)

**CORS Errors**
- Verify `CorsConfig.java` includes your frontend origin
- Check browser console for exact error
- Ensure OPTIONS preflight is allowed

**Duplicate Entry on Startup**
- `data.sql` uses `INSERT IGNORE` (MySQL-specific)
- If migrating from old DB, drop and recreate:
  ```bash
  mysql -u root -p -e "DROP DATABASE library_db; CREATE DATABASE library_db;"
  ```

**Books Not Showing / Null Errors**
- Clear browser cache and refresh
- Check browser console for API errors
- Verify backend is running and accessible

**Build Failures**
```bash
# Clean and rebuild
cd backend
mvn clean install -DskipTests
```

---

## 🔒 Security Notes

### Production Checklist
- [ ] Change `jwt.secret` to a strong random key (256-bit minimum)
- [ ] Use HTTPS in production
- [ ] Update CORS allowed origins to production domain
- [ ] Set `spring.sql.init.mode=never` after initial setup
- [ ] Use environment variables for sensitive config
- [ ] Enable SQL injection protection (already handled by JPA)
- [ ] Rate limit authentication endpoints
- [ ] Implement password complexity requirements
- [ ] Add audit logging for sensitive operations

### Password Policy
Current: BCrypt with strength 10
Recommend for production: Add validation for:
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Special characters

---

## 🧪 Testing

### Manual API Testing (curl)

**Login:**
```bash
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@library.com\",\"password\":\"password\"}"
```

**Get Books (with token):**
```bash
curl http://localhost:8080/api/books ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Borrow Book:**
```bash
curl -X POST http://localhost:8080/api/borrow ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE" ^
  -H "Content-Type: application/json" ^
  -d "{\"bookId\":1}"
```

### Testing Workflow
1. Login as admin → verify token received
2. Create a book → verify in database
3. Login as member → borrow book → verify availability changes
4. Return book → verify availability restored
5. Check "My Books" → verify borrow record appears

---

## 📦 Database Management

### Reset Database
```bash
# Drop and recreate
mysql -u root -p -e "DROP DATABASE IF EXISTS library_db; CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

# Restart backend to run schema.sql and data.sql
cd backend
mvn spring-boot:run
```

### Manual Schema Setup (if needed)
```bash
mysql -u root -p library_db < backend/src/main/resources/schema.sql
mysql -u root -p library_db < backend/src/main/resources/data.sql
```

### Backup Data
```bash
mysqldump -u root -p library_db > backup.sql
```

### Restore Data
```bash
mysql -u root -p library_db < backup.sql
```

---

## 🚧 Known Limitations

- Single-file React app (not componentized)
- No pagination on book/borrow lists
- No email verification for registration
- No password reset flow
- No file upload for book covers
- No real-time notifications
- Basic search (in-memory filtering)

---

## 🎯 Future Enhancements

- [ ] Microservices architecture (separate auth service)
- [ ] Redis caching for book catalog
- [ ] Elasticsearch for advanced search
- [ ] Book cover image upload (AWS S3)
- [ ] Email notifications (SendGrid/AWS SES)
- [ ] Admin dashboard analytics (charts)
- [ ] Export reports (PDF/Excel)
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Reservation system (hold books)
- [ ] Fine calculation for late returns
- [ ] Book recommendations (ML-based)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Developer Notes

### Key Design Decisions

**Idempotent Seeding**
- `data.sql` uses `INSERT IGNORE` to allow safe restarts
- Prevents duplicate key errors on application restart

**Startup Integrity Checks**
- `StartupDataFix.java` repairs legacy FK constraints
- Reconciles book availability with active borrow records
- Ensures data consistency across restarts

**JSON Serialization**
- `@JsonIgnore` on `User.password` and cyclic relationships
- `@JsonIgnoreProperties` on nested entities
- Prevents infinite loops and massive payloads

**Security Architecture**
- JWT stateless authentication
- Role-based method security (`@PreAuthorize`)
- CORS centralized in `CorsConfig`
- Password encoder bean for BCrypt

**Frontend Resilience**
- API client handles 204 No Content gracefully
- Components guard against null/undefined responses
- Defensive rendering prevents "map of null" errors

### Development Tips

**Hot Reload**
```bash
# Backend (Spring Boot DevTools - add dependency if needed)
mvn spring-boot:run

# Frontend
npm start
```

**Debug Mode**
- Backend: Add breakpoints in IntelliJ/Eclipse, run in debug mode
- Frontend: Use React DevTools browser extension
- Database: Use MySQL Workbench or DBeaver

**Logging**
- Backend logs: Check console output
- SQL queries: `spring.jpa.show-sql=true`
- HTTP requests: Add logging filter if needed

---

## 📞 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review [API Reference](#-api-reference)
3. Verify [Configuration](#-configuration)
4. Check application logs for detailed error messages

---

## 🙏 Acknowledgments

Built with:
- Spring Boot ecosystem
- React community
- MySQL
- Tailwind CSS
- Lombok project

---

**Made with ☕ and 💻**
