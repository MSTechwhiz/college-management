# Test Credentials for College Management System

## 🔴 ADMIN (Full Access)

**Username:** `admin@sbc`  
**Password:** `Admin@123`  
**Role:** ADMIN  
**Department:** null (can access all departments)

**Login Flow:**
- Direct login → AdminDashboard
- Can access all departments
- Full CRUD access to all modules

---

## 🟠 FACULTY (Department-based)

### Primary Test Account
**Username:** `faculty_it@sbc`  
**Password:** `Faculty@123`  
**Role:** FACULTY  
**Department:** IT

**Login Flow:**
- Login → DepartmentSelect (IT auto-selected) → FacultyDashboard
- Can enter attendance & marks ONLY
- Limited to IT department

### Optional Test Accounts
- **CSE Faculty:** `faculty_cse@sbc` / `Faculty@123` / CSE
- **ECE Faculty:** `faculty_ece@sbc` / `Faculty@123` / ECE

---

## 🟢 STUDENT (View Only)

### Primary Test Account
**Username:** `student_it_01@sbc`  
**Password:** `Student@123`  
**Role:** STUDENT  
**Department:** IT

**Login Flow:**
- Login → DepartmentSelect → StudentDashboard
- View-only access to:
  - Fees
  - Attendance
  - Marks
  - Announcements
- Can create reports

### Optional Test Account
- **CSE Student:** `student_cse_01@sbc` / `Student@123` / CSE

---

## 🔒 Important Security Rules

1. **Passwords are BCrypt hashed** in the database
2. **Role mismatch** → Access blocked (redirected to NotAuthorized)
3. **Department mismatch** → Redirected to NotAuthorized page
4. **Credentials are seeded automatically** on first application startup
5. **To reset credentials:** Clear MongoDB database and restart application

---

## Seeded Departments

The following departments are automatically created:
- IT
- CSE
- ECE
- AI&DS
- MBA
- MCA

---

## How to Use

1. Start the backend application
2. On first startup, `DataSeeder` will automatically create:
   - All departments
   - Admin user
   - Faculty users (IT, CSE, ECE)
   - Student users (IT, CSE)
3. Use the credentials above to log in
4. Test different roles and department access

---

## Removing Test Credentials

To remove test credentials in production:

1. Delete the `DataSeeder.java` file or comment out the `@Component` annotation
2. Manually remove test users from MongoDB:
   ```javascript
   db.users.deleteMany({username: /@sbc/})
   db.faculty.deleteMany({facultyId: /FAC/})
   db.students.deleteMany({registerNumber: /IT001|CSE001/})
   ```

---

**⚠️ WARNING:** These credentials are for DEVELOPMENT and TESTING only. Never use these in production!
