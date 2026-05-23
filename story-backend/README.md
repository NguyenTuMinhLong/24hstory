# Story Backend API

Instagram-like Stories API với Express, Prisma, PostgreSQL và Cloudinary.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: Cloudinary (media uploads)
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Jest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Cloudinary account

### Installation

```bash
# Clone repository
cd story-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRES_IN` | Token expiration time | No (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `ALLOWED_ORIGINS` | CORS allowed origins | No |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| PATCH | `/auth/avatar` | Update user avatar |

### Stories

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stories` | Create new story |
| GET | `/stories` | Get all active stories |
| GET | `/stories/me` | Get my stories |
| GET | `/stories/:storyId` | Get story by ID |
| DELETE | `/stories/:storyId` | Delete story |

### Story Views

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/story-view/seen/:storyId` | Mark story as seen |
| GET | `/story-view/viewers/:storyId` | Get story viewers |
| GET | `/story-view/my-views` | Get stories I've seen |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## API Examples

### Register

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Login

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Create Story (requires auth)

```bash
curl -X POST http://localhost:5000/stories \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "media=@/path/to/image.jpg"
```

### Get Active Stories

```bash
curl http://localhost:5000/stories \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
story-backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── configs/            # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middlewares/        # Express middlewares
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Utilities
│   ├── validators/         # Zod schemas
│   ├── app.js              # Main app entry
│   └── prismaClient.js     # Prisma client
├── tests/                   # Test files
├── tmp/                     # Temporary upload files
├── .env.example             # Environment template
└── jest.config.js          # Jest configuration
```

## Features

- [x] User authentication (register, login)
- [x] JWT-based authorization
- [x] Avatar upload with Cloudinary
- [x] Story creation with media upload
- [x] 24-hour story expiration
- [x] Story viewing/seen tracking
- [x] View count per story
- [x] Rate limiting
- [x] Input validation
- [x] Error handling
- [x] Security headers (Helmet)
- [x] CORS configuration
- [x] Request logging (Morgan)
- [x] Unit tests

## License

MIT
