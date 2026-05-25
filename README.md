# CentreHub Morocco

A modern full-stack educational platform connecting students with educational centers, teachers, and courses across Morocco.

## Tech Stack

### Frontend
- React.js (JSX) + Vite
- React Router v7
- Redux Toolkit (state management)
- Tailwind CSS
- Framer Motion (animations)
- Axios (API requests)
- Socket.io Client (real-time)
- WebRTC (live classes)
- Google OAuth

### Backend
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT + Google Authentication
- Cloudinary (media storage)
- Socket.io (real-time messaging & WebRTC signaling)
- OpenAI API (AI features)
- Nodemailer (password reset)

## Project Structure

```
CenterHubApp/
├── backend/
│   ├── server.js
│   ├── .env.example
│   └── src/
│       ├── config/          # DB, Cloudinary config
│       ├── controllers/     # MVC Controllers
│       ├── middleware/      # Auth, roles, upload, errors
│       ├── models/          # Mongoose schemas
│       ├── routes/          # REST API routes
│       ├── socket/          # Socket.io handlers
│       └── utils/           # Helpers, email, tokens
├── frontend/
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── api/             # Axios API layer
│       ├── components/      # Reusable UI components
│       ├── pages/           # Route pages
│       ├── store/           # Redux slices
│       ├── routes/          # Protected routes
│       └── utils/           # Helpers, socket
└── ROADMAP.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account
- Google Cloud Console (OAuth + Maps)
- OpenAI API key

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| POST | /api/auth/google | Google OAuth |
| POST | /api/auth/forgot-password | Request password reset |
| GET | /api/centers | List centers (with filters) |
| GET | /api/centers/:id | Center profile |
| POST | /api/centers | Create center |
| GET | /api/courses | List courses |
| POST | /api/enrollments | Enroll in course |
| POST | /api/ai/smart-search | AI-powered search |
| POST | /api/ai/assistant | AI course assistant |
| POST | /api/ai/generate-quiz | Auto-generate quiz |
| GET | /api/admin/analytics | Admin analytics |

## User Roles

1. **Student** - Search, enroll, track progress
2. **Teacher** - Create courses, live sessions, join centers
3. **Center Owner** - Manage center, teachers, revenue
4. **Admin** - Verify accounts, manage reports, analytics

### Docker Deployment

```bash
# Copy and configure env
cp backend/.env.example backend/.env

# Start all services
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## Payment Setup

1. **Stripe**: Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to backend `.env`
2. **CMI**: Add `CMI_MERCHANT_ID`, `CMI_SECRET_KEY`, `CMI_GATEWAY_URL` for production
3. Dev mode uses `/payment/cmi-simulate` for CMI testing

## Google Maps

Add `VITE_GOOGLE_MAPS_API_KEY` to frontend `.env` — enable Maps JavaScript API in Google Cloud Console.

## License

MIT
