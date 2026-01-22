# College Management System

A comprehensive full-stack web application for managing college operations including student, faculty, and administrative functions.

## Technology Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Spring Boot (REST API)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
college-management-system/
├── college-frontend/     # React frontend application
└── college-backend/      # Spring Boot backend application
```

## Features

### Authentication & Entry
- Three-role login system (Admin, Faculty, Student)
- Department selection for Faculty and Students
- JWT-based authentication
- Announcement panel on login page

### Admin Module
- **Dashboard**: Live counts of departments, students, faculty, pending fees, and unresolved reports
- **Departments**: View all departments with student and faculty counts
- **Students**: Add, edit, delete students; bulk upload via Excel
- **Faculty**: Manage faculty, assign departments/subjects, promote to HOD
- **Fees**: Define fee structures, view fee ledger, override fees
- **Admissions**: Record admissions, view department statistics
- **Announcements**: Create announcements for all, students, faculty, or departments
- **Reports**: View and manage student reports, assign to HOD, resolve issues

### Faculty Module
- **Dashboard**: View department info, HOD, assigned subjects, student counts
- **Students by Year**: View students by year (I-IV)
- **Attendance**: Mark attendance by subject and date (locked after submission)
- **Marks**: Enter CA, Model, and Practical marks (auto-calculates total and grade, locked after submission)

### Student Module
- **Dashboard**: View profile, fees summary, attendance percentage
- **Fees**: View semester-wise fees (read-only)
- **Attendance**: View subject-wise attendance percentage (read-only)
- **Marks**: View subject-wise marks and grades (read-only)
- **Announcements**: View all relevant announcements
- **Reports**: Create reports for fees, marks, attendance, or other issues

### AI Chatbot
- Fixed bottom-right position
- Provides navigation help and academic information
- Does not modify data or access admin APIs

## Setup Instructions

### Prerequisites
- Java 17+
- Node.js 18+
- MongoDB (running on localhost:27017)
- Maven 3.6+

### Backend Setup

1. Navigate to backend directory:
```bash
cd college-backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd college-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/select-department` - Select department

### Admin
- `GET /api/admin/dashboard/counts` - Get dashboard counts
- `GET /api/departments` - Get all departments
- `GET /api/departments/{id}` - Get department detail
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student
- `POST /api/students/bulk-upload` - Bulk upload students
- `GET /api/faculty` - Get all faculty
- `POST /api/faculty` - Create faculty
- `POST /api/faculty/{id}/promote-hod` - Promote to HOD
- `GET /api/fees` - Get all fees
- `POST /api/fees/structure` - Create fee structure
- `POST /api/fees/{feeId}/override` - Override fee
- `GET /api/admissions` - Get all admissions
- `POST /api/admissions` - Create admission
- `GET /api/announcements` - Get all announcements
- `POST /api/announcements` - Create announcement
- `GET /api/reports` - Get all reports
- `POST /api/reports/{reportId}/assign` - Assign report to HOD
- `POST /api/reports/{reportId}/resolve` - Resolve report

### Faculty
- `GET /api/faculty/dashboard` - Get faculty dashboard
- `GET /api/faculty/dashboard/students/{year}` - Get students by year
- `POST /api/attendance` - Mark attendance
- `POST /api/attendance/bulk` - Mark bulk attendance
- `POST /api/marks` - Create/update marks

### Student
- `GET /api/student/dashboard` - Get student dashboard
- `GET /api/fees/student/{studentId}` - Get student fees
- `GET /api/attendance/student/{studentId}` - Get student attendance
- `GET /api/marks/student/{studentId}` - Get student marks
- `GET /api/announcements/student` - Get student announcements
- `POST /api/reports` - Create report

## Security

- JWT authentication for all protected routes
- Role-based access control (RBAC)
- Department-based access restrictions
- Students cannot access faculty/admin APIs
- Faculty cannot access admin APIs
- No cross-department access

## Database Schema

The application uses MongoDB with the following collections:
- `users` - User accounts and authentication
- `departments` - Department information
- `students` - Student records
- `faculty` - Faculty records
- `fees` - Fee records
- `fee_structures` - Fee structure definitions
- `attendance` - Attendance records
- `marks` - Marks and grades
- `announcements` - Announcements
- `reports` - Student reports
- `admissions` - Admission records

## Test Credentials (Development Only)

The application automatically seeds test credentials on first startup. These are for development and testing purposes only.

### 🔴 ADMIN (Full Access)
- **Username:** `admin@sbc`
- **Password:** `Admin@123`
- **Role:** ADMIN
- **Department:** null (can access all departments)
- **Direct Login:** → AdminDashboard

### 🟠 FACULTY (Department-based)
- **Username:** `faculty_it@sbc`
- **Password:** `Faculty@123`
- **Role:** FACULTY
- **Department:** IT
- **Login Flow:** Login → DepartmentSelect → FacultyDashboard

**Optional Test Accounts:**
- `faculty_cse@sbc` / `Faculty@123` / CSE
- `faculty_ece@sbc` / `Faculty@123` / ECE

### 🟢 STUDENT (View Only)
- **Username:** `student_it_01@sbc`
- **Password:** `Student@123`
- **Role:** STUDENT
- **Department:** IT
- **Login Flow:** Login → DepartmentSelect → StudentDashboard

**Optional Test Account:**
- `student_cse_01@sbc` / `Student@123` / CSE

### 🔒 Security Rules
- All passwords are BCrypt hashed in the database
- Role mismatch → Access blocked
- Department mismatch → Redirected to NotAuthorized page
- Credentials are seeded automatically on first application startup
- To reset: Clear MongoDB database and restart application

## Notes

- Default faculty password: `password123` (should be changed in production)
- Attendance and marks are locked after submission (admin override only)
- Only one HOD per department
- Register numbers and Faculty IDs must be unique
- Test credentials are automatically created by `DataSeeder` component

## License

This project is for educational purposes.
