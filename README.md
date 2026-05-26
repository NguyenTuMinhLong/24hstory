# 24hStory

> A modern Instagram-style stories platform with real-time media sharing, user authentication, and seamless cloud integration.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## Overview

24hStory is a full-stack web application that enables users to share temporary media content with 24-hour expiration. Built with a React frontend and Express.js backend, it features secure JWT authentication, PostgreSQL database with Prisma ORM, and Cloudinary for media storage.

## Features

### Authentication & Security
- Email/password registration with email verification
- JWT-based authentication (access + refresh tokens)
- Account lockout after 5 failed login attempts
- Password validation (8+ chars, uppercase, number, special char)
- Multi-device session management

### Stories
- Upload images that expire after 24 hours
- View stories from all users in a unified feed
- Full-screen story viewer with progress indicators
- View tracking (see who viewed your stories)
- Automatic cleanup of expired content

### User Profile
- Custom avatar upload with automatic resizing
- Profile management

## Tech Stack

### Backend
| Component | Technology |
|-----------|------------|
| Runtime | Node.js (ES Modules) |
| Framework | Express.js |
| Database | PostgreSQL + Prisma ORM |
| Media Storage | Cloudinary |
| Authentication | JWT (jsonwebtoken) |
| Password Hashing | bcrypt (12 rounds) |
| Validation | Zod v4 |
| Security | Helmet, CORS, Rate Limiting |
| Scheduler | node-cron |
| File Upload | Multer |
| Testing | Jest + Supertest |

### Frontend
| Component | Technology |
|-----------|------------|
| Framework | React 18 |
| Build Tool | Vite |
| Routing | React Router DOM v6 |
| State Management | Zustand |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| UI Components | Radix UI |

## Project Structure

```
24hstory/
├── story-backend/           # Express.js REST API
│   ├── src/
│   │   ├── configs/        # App configurations
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── services/       # Business logic
│   │   ├── middlewares/     # Express middlewares
│   │   ├── validators/      # Zod schemas
│   │   └── utils/           # Utilities
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── tests/               # Test files
│
└── story-frontend/          # React SPA
    └── src/
        ├── components/      # React components
        ├── pages/           # Page components
        ├── stores/          # Zustand stores
        └── lib/             # Utilities
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL
- Cloudinary account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd 24hstory
```

2. **Install dependencies**
```bash
# Backend
cd story-backend
npm install

# Frontend
cd ../story-frontend
npm install
```

3. **Configure environment variables**

Create `.env` files in both `story-backend` and `story-frontend`:

**Backend (`story-backend/.env`)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/24hstory"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=5000
NODE_ENV="development"
ALLOWED_ORIGINS="http://localhost:5173"
```

**Frontend (`story-frontend/.env`)**
```env
VITE_API_URL="http://localhost:5000"
```

4. **Setup database**
```bash
cd story-backend
npx prisma generate
npx prisma db push
```

5. **Run the application**
```bash
# Backend (from story-backend)
npm run dev

# Frontend (from story-frontend, in another terminal)
npm run dev
```

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with credentials |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/verify-email` | Verify email address |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/me` | Get current user |
| PATCH | `/auth/avatar` | Update avatar |

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stories` | Create new story |
| GET | `/stories` | Get all active stories |
| GET | `/stories/me` | Get my stories |
| GET | `/stories/:id` | Get story by ID |
| DELETE | `/stories/:id` | Delete story |

### Story Views

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/story-view/seen/:storyId` | Mark as seen |
| GET | `/story-view/viewers/:storyId` | Get viewers |
| GET | `/story-view/my-views` | Get my views |

## Environment Variables

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `JWT_EXPIRES_IN` | No | Token expiration (default: 15m) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment mode |
| `ALLOWED_ORIGINS` | No | CORS origins |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |

## Database Schema

### User
- `id` - Unique identifier
- `email` - User email (unique)
- `password` - Hashed password
- `avatar` - Cloudinary URL
- `isEmailVerified` - Email verification status
- `isActive` - Account status
- `failedLogin` - Failed login attempts
- `lockedUntil` - Account lockout expiry

### Session
- `id` - Unique identifier
- `userId` - Owner reference
- `token` - JWT token
- `ipAddress` - Client IP
- `userAgent` - Browser info
- `expiresAt` - Session expiry

### Story
- `id` - Unique identifier
- `userId` - Owner reference
- `mediaUrl` - Cloudinary URL
- `expiresAt` - 24h expiration
- `createdAt` - Creation timestamp

### StoryView
- `id` - Unique identifier
- `storyId` - Story reference
- `userId` - Viewer reference
- `viewedAt` - View timestamp

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15 min expiry)
- JWT refresh tokens (7 days expiry)
- Account lockout after 5 failed attempts (15 min)
- Rate limiting on auth endpoints
- Helmet security headers
- Input validation with Zod
- SQL injection prevention via Prisma
- File type validation for uploads

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
