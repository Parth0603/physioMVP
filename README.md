# PHYSIO-SMART

> **"Right topic, right time, right method, for the right student."**

An AI-Powered Adaptive Learning & Clinical Reasoning Platform designed specifically for Physiotherapy (BPT) Education.

---

## 1. Project Overview

PHYSIO-SMART addresses the critical clinical reasoning gap in undergraduate physiotherapy education. The system assesses a student's existing knowledge, detects diagnostic weaknesses, dynamically schedules personalized learning plans, and continuously adapts based on clinical practice performance.

> **Implementation Phase Status**:  
> Currently completed: **Part 1: Foundation & System Architecture**  
> *(Parts 2, 3, and 4 will layer diagnostic testing, Gemini-grounded adaptive engines, and interactive clinical reasoning on top of this foundation.)*

---

## 2. Technology Stack

- **Frontend**:
  - React 18 & TypeScript
  - Vite
  - Tailwind CSS
  - React Router DOM v6
  - Lucide React Icons
  - Axios HTTP client with JWT interceptors
- **Backend**:
  - Python 3.14 / FastAPI
  - SQLAlchemy 2.0 ORM
  - Alembic database migrations
  - Pydantic v2 schemas and validation
  - Bcrypt secure password hashing & python-jose JWT token authentication
- **Database**:
  - PostgreSQL (with automatic zero-friction fallback to SQLite for local development)
- **AI Architecture**:
  - Pluggable `AIProvider` / `GeminiProvider` abstraction with token budgeting and retry interfaces. All AI workflows are grounded in verified database content, never hallucinating unverified syllabus facts.

---

## 3. Monorepo Directory Structure

```
physio-smart/
│
├── frontend/                     # React + Vite + TypeScript application
│   ├── src/
│   │   ├── components/common/    # ProtectedRoute, Navbars, RoleGuards
│   │   ├── context/              # AuthContext (JWT state & role checks)
│   │   ├── layouts/              # MainLayout with role-based navigation
│   │   ├── pages/                # Student, Admin & Faculty Pages
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   ├── SubjectsPage.tsx
│   │   │   ├── SubjectDetailPage.tsx
│   │   │   ├── TopicDetailPage.tsx
│   │   │   ├── ProgressPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminSubjectsPage.tsx
│   │   │   ├── AdminContentPage.tsx
│   │   │   └── FacultyDashboard.tsx
│   │   ├── services/             # API services (auth, academic, content, progress)
│   │   ├── types/                # TypeScript domain models
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                      # FastAPI Python REST backend
│   ├── app/
│   │   ├── ai/                   # AI service & provider abstractions (GeminiProvider)
│   │   ├── api/
│   │   │   ├── dependencies/     # JWT extraction & RBAC role guards
│   │   │   └── routes/           # Auth, Users, Subjects, Units, Topics, Content, Progress, AI
│   │   ├── core/                 # Config (Pydantic Settings), Security (Bcrypt/JWT), Exceptions
│   │   ├── db/                   # SQLAlchemy engine, session maker, base model
│   │   ├── models/               # Relational entities (User, Subject, Unit, Topic, Content, etc.)
│   │   ├── repositories/         # Generic and domain repository data access layer
│   │   ├── schemas/              # Pydantic request & response models
│   │   ├── services/             # Domain business logic layer
│   │   └── main.py               # FastAPI application entrypoint
│   ├── alembic/                  # Database migration scripts
│   ├── scripts/                  # Seed scripts with authentic BPT demo data
│   ├── tests/                    # Pytest smoke and RBAC tests
│   ├── requirements.txt
│   └── alembic.ini
│
├── .env.example                  # Environment configuration template
├── .gitignore
└── README.md
```

---

## 4. Database Schema

The relational database models a strict academic and knowledge hierarchy:

```
USERS
  ├── STUDENT_PROFILES (institution, course, academic_year, semester)
  ├── STUDENT_PROGRESS (topic_id, mastery_score, attempts, correct_attempts, next_review_at)
  ├── STUDY_PLANS (generated_reason, status, start_date, end_date)
  │     └── STUDY_PLAN_ITEMS (topic_id, priority, scheduled_date, status)
  └── ATTEMPTS (question_id, answer, is_correct, time_taken)

SUBJECTS (name, code, academic_year, semester)
  └── UNITS (name, order_index)
        └── TOPICS (name, difficulty_level, order_index)
              ├── CONTENT (title, content_type, content_body, difficulty_level, reference, is_verified)
              ├── QUESTIONS (question_text, question_type, correct_answer, explanation, is_verified)
              │     └── QUESTION_OPTIONS (option_text, is_correct)
              └── CLINICAL_CASES (title, case_description, difficulty_level, is_verified)
```

---

## 5. Getting Started & Running Locally

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### Setup Backend
1. Open a terminal in the root directory:
   ```bash
   cd backend
   python -m venv venv
   # Activate virtualenv:
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate
   pip install -r requirements.txt
   ```

2. Seed the database with high-yield demonstration BPT content:
   ```bash
   python scripts/seed_data.py
   ```

3. Run the backend development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   Interactive OpenAPI documentation will be live at `http://localhost:8000/docs`.

### Setup Frontend
1. In a separate terminal:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open `http://localhost:5173` in your browser.

---

## 6. Demo User Credentials

The seed script automatically provisions accounts representing all three roles with pre-populated academic context:

| Role | Email | Password | Academic / Role Context |
| :--- | :--- | :--- | :--- |
| **Student** | `student@physiosmart.edu` | `Password123!` | 1st Year BPT, Apex Institute of Physiotherapy |
| **Faculty** | `faculty@physiosmart.edu` | `FacultyPass123!` | Dr. Sunita Deshmukh, MPT (Content Verifier) |
| **Admin** | `admin@physiosmart.edu` | `AdminPass123!` | System Administrator (Full Curriculum & CMS Control) |

---

## 7. Role Permissions & Access Control

- **Student**:
  - Enrolled subjects and topic explorer
  - Knowledge base concepts, guidelines, and references
  - Topic mastery progress tracking
  - View "Personalized Plan" roadmap placeholder
- **Faculty**:
  - Review curriculum knowledge base entries
  - One-click verify / revoke approval for student study materials
- **Admin**:
  - Full CRUD control over Subjects, Units, and Topics
  - Full CRUD control over Knowledge Base Content
  - System metrics overview

---

## 8. Looking Ahead to Part 2

Part 1 establishes the rock-solid foundation. **Part 2** will build directly upon this architecture without requiring database restructuring:
1. **Diagnostic Assessment Engine**: Initial test evaluation of student baseline across subjects.
2. **Adaptive Knowledge Gap Analysis**: Evaluating student practice attempts against the `StudentProgress` model.
3. **Automated Study Plan Generation**: Dynamic population of `StudyPlan` and `StudyPlanItem` tailored to identified gaps.
4. **Active Gemini AI Integration**: Activating the `GeminiProvider` service to generate explanations grounded strictly in the verified database content.
