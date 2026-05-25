# CentreHub Morocco — Implementation Roadmap

## Phase 1: Foundation ✅ COMPLETE

- [x] Project scaffolding (backend + frontend)
- [x] MongoDB models with relationships
- [x] JWT + Google authentication
- [x] Email/password auth with forgot/reset password
- [x] MVC architecture with REST API
- [x] Error handling middleware
- [x] Role-based authorization
- [x] Redux Toolkit state management
- [x] React Router with protected routes
- [x] Tailwind CSS responsive design
- [x] Framer Motion animations

## Phase 2: Core Features ✅ COMPLETE

- [x] Home page with search bar
- [x] Center listing with filters (distance, rating, price, subject, popularity)
- [x] Center profile page (logo, cover, map, reviews, courses, teachers)
- [x] Course listing and detail pages
- [x] Teacher profile pages
- [x] Enrollment system with progress tracking
- [x] Review and rating system
- [x] Notification system
- [x] Real-time messaging (Socket.io)
- [x] Cloudinary upload integration (images, videos, PDFs)

## Phase 3: Dashboards ✅ COMPLETE (Base)

- [x] Student dashboard (enrollments, progress, recommendations)
- [x] Teacher dashboard (courses, join center, quick actions)
- [x] Center Owner dashboard (stats, invitation codes, management)
- [x] Admin dashboard (analytics, verification, reports)

## Phase 4: AI Features ✅ COMPLETE (API)

- [x] Smart search (natural language → filters)
- [x] Recommendation system
- [x] AI course assistant
- [x] Automatic quiz generation
- [x] AI study planner
- [x] AI chatbot support
- [x] PDF/content summarization

## Phase 5: Live Classes ✅ COMPLETE (Base)

- [x] Live session scheduling
- [x] WebRTC integration with Socket.io signaling
- [x] Room-based live classes
- [x] Session status management

---

## Phase 6: Enhancement ✅ IMPLEMENTED

- [x] Stripe + CMI payment integration
- [x] Google Maps interactive view (list/map toggle)
- [x] Multi-participant WebRTC with screen sharing + live chat
- [x] Interactive quiz/exam UI with countdown timers
- [x] Docker Compose + GitHub Actions CI/CD

### Remaining polish (optional)
- [ ] Center Owner: revenue charts (Chart.js/Recharts)
- [ ] Teacher: student analytics, grade book
- [ ] Admin: bulk actions, export reports
- [ ] Calendar view for live sessions

### 6.6 Mobile & PWA
- [ ] Progressive Web App setup
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Offline course content caching
- [ ] React Native mobile app (optional)

### 6.7 Security & Performance
- [ ] Rate limiting per user
- [ ] Input sanitization (express-mongo-sanitize)
- [ ] Redis caching for popular queries
- [ ] CDN for static assets
- [ ] Database indexing optimization
- [ ] API response compression

### 6.8 Testing
- [ ] Backend unit tests (Jest + Supertest)
- [ ] Frontend component tests (Vitest + Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Load testing (k6)

### 6.9 DevOps
- [x] Docker containerization
- [x] CI/CD pipeline (GitHub Actions)
- [ ] Staging/production environments
- [ ] MongoDB Atlas production cluster
- [ ] Monitoring (Sentry, LogRocket)

---

## Database Schema Relationships

```
User ──┬── Center (owner)
       ├── Teacher (user ref)
       ├── Enrollment (student)
       ├── Review (user)
       ├── Message (sender/receiver)
       └── Notification (user)

Center ──┬── Teacher[]
         ├── Course[]
         └── Student[] (User refs)

Teacher ──┬── Course[]
          ├── Center (ref)
          └── Student[] (User refs)

Course ──┬── Video[]
         ├── PDF[]
         ├── Quiz[]
         ├── Exam[]
         ├── LiveSession[]
         └── Enrollment[]

Enrollment ── progress tracking (videos, pdfs, quizzes, exams)
```

## API Route Summary

```
/api/auth/*           - Authentication
/api/centers/*        - Center CRUD + stats
/api/teachers/*       - Teacher profiles + join center
/api/courses/*        - Course CRUD + comments
/api/enrollments/*    - Enrollment + progress
/api/reviews/*        - Reviews
/api/messages/*       - Messaging
/api/notifications/*  - Notifications
/api/live-sessions/*  - Live classes
/api/admin/*          - Admin operations
/api/ai/*             - AI features
/api/upload/*         - File uploads
```

## Estimated Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1-5 | 4-6 weeks | Done |
| Phase 6 (core) | 2-3 weeks | Done |
| Phase 6 (polish) | 2-4 weeks | Planned |

---

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev

# Terminal 3 - MongoDB (if local)
mongod
```

Visit `http://localhost:5173` for the frontend and `http://localhost:5000/api/health` for API health check.

## Creating First Admin User

After registering, manually update the user role in MongoDB:

```javascript
db.users.updateOne(
  { email: "admin@centrehub.ma" },
  { $set: { role: "admin", isVerified: true } }
)
```
