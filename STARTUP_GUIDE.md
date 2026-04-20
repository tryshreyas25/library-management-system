# 🚀 How to Start the Library Management System

## Prerequisites
- ✅ Java 17+ installed
- ✅ Maven installed
- ✅ Node.js and npm installed

## Step-by-Step Startup Guide

### 1️⃣ Start Backend (Spring Boot)

Open **CMD (Command Prompt)** and run:

```cmd
cd /d d:\Project\library-management-system-updated\library-management-system\backend
mvn spring-boot:run
```

**Wait for this message:**
```
Started LibraryManagementApplication in X.XXX seconds
```

✅ Backend will run on: **http://localhost:8081**

---

### 2️⃣ Start Frontend (React)

Open **ANOTHER CMD window** and run:

```cmd
cd /d d:\Project\library-management-system-updated\library-management-system\frontend
npm start
```

**Wait for this message:**
```
Compiled successfully!
```

✅ Frontend will run on: **http://localhost:3001**

---

## 🔐 Demo Login Credentials

### Admin Account
- **Email:** admin@library.com
- **Password:** admin123

### Member Account
- **Email:** john@example.com
- **Password:** member123

---

## 🎯 What You Should See

### Login Page
- Beautiful gradient background (purple to pink)
- White login card with rounded corners
- Email and password fields
- "Sign In" button
- Demo credentials displayed
- "Register" link

### After Login (Admin)
- Dashboard with statistics
- Books management
- Users management
- Borrow records
- Reports & Analytics

### After Login (Member)
- Dashboard
- Browse books
- My borrowed books
- Borrow/Return functionality

---

## ❌ Troubleshooting

### "Failed to fetch" error
1. **Check backend is running** on port 8081
2. **Check frontend is running** on port 3001
3. **Refresh browser** with Ctrl+Shift+R

### Backend won't start
- Make sure you're in the `/backend` directory
- Run: `mvn clean install` first
- Check if port 8081 is available

### Frontend won't start
- Make sure you're in the `/frontend` directory
- Run: `npm install` first
- Check if port 3001 is available

### No styling (plain HTML)
- Stop frontend server (Ctrl+C)
- Run: `npm install`
- Run: `npm start`
- Hard refresh browser (Ctrl+Shift+R)

---

## 🗄️ Database

The application uses **H2 in-memory database** for development:
- No MySQL installation needed
- Data is reset when backend restarts
- Demo users are auto-created on startup

**H2 Console:** http://localhost:8081/h2-console
- **JDBC URL:** jdbc:h2:mem:librarydb
- **Username:** sa
- **Password:** (leave empty)

---

## 🔥 Quick Start (One Command Per Terminal)

**Terminal 1 (Backend):**
```cmd
cd /d d:\Project\library-management-system-updated\library-management-system\backend && mvn spring-boot:run
```

**Terminal 2 (Frontend):**
```cmd
cd /d d:\Project\library-management-system-updated\library-management-system\frontend && npm start
```

---

## ✅ Success Checklist

- [ ] Backend running on http://localhost:8081
- [ ] Frontend running on http://localhost:3001
- [ ] Login page shows with gradient background
- [ ] Can login with demo credentials
- [ ] Dashboard loads after login
- [ ] No "Failed to fetch" errors

---

**Need Help?** Check the browser console (F12) for detailed error messages.
