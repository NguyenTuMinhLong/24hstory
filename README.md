# 24hStory

> Ứng dụng chia sẻ story giống Instagram - story tự xóa sau 24h, có xác thực người dùng, lưu trữ ảnh/video trên đám mây.

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## Tính năng chính

### Đăng nhập & Bảo mật
- Đăng ký / đăng nhập bằng email + password
- Xác thực email
- Quên mật khẩu / đặt lại mật khẩu
- Đổi mật khẩu
- Khóa tài khoản tạm thời khi nhập sai 5 lần
- Đăng xuất khỏi tất cả thiết bị

### Story
- Đăng ảnh/video - tự động xóa sau 24h
- Xem story của người khác
- Xem danh sách ai đã xem story của mình
- Xóa story của mình
- Upload avatar cá nhân

## Cách chạy

### 1. Chuẩn bị

Cần có:
- Node.js >= 18.0.0
- PostgreSQL
- Tài khoản Cloudinary (miễn phí)

### 2. Cài đặt

```bash
# Clone code
git clone <repo-url>
cd 24hstory

# Cài backend
cd story-backend
npm install

# Cài frontend  
cd ../story-frontend
npm install
```

### 3. Cấu hình

Tạo file `.env` trong `story-backend/`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/24hstory"
JWT_SECRET="secret-key-ban-tu-tao"
JWT_REFRESH_SECRET="refresh-secret-ban-tu-tao"
CLOUDINARY_CLOUD_NAME="ten-cloud-cua-ban"
CLOUDINARY_API_KEY="api-key-cua-ban"
CLOUDINARY_API_SECRET="api-secret-cua-ban"
PORT=5000
```

Tạo file `.env` trong `story-frontend/`:

```env
VITE_API_URL="http://localhost:5000"
```

### 4. Khởi tạo database

```bash
cd story-backend
npx prisma generate
npx prisma db push
```

### 5. Chạy ứng dụng

```bash
# Terminal 1 - Backend
cd story-backend
npm run dev

# Terminal 2 - Frontend
cd story-frontend
npm run dev
```

Mở trình duyệt: http://localhost:5173

## Cấu trúc thư mục

```
24hstory/
├── story-backend/           # API server (Express)
│   └── src/
│       ├── configs/        # Cấu hình (Cloudinary, CORS, Security...)
│       ├── controllers/     # Xử lý request
│       ├── routes/          # Định nghĩa API routes
│       ├── services/        # Logic nghiệp vụ
│       ├── middlewares/     # Auth, validate, error handler
│       ├── validators/      # Zod schemas
│       └── utils/           # Helpers, cleanup job
│
└── story-frontend/          # React app (Vite)
    └── src/
        ├── components/      # UI components
        ├── pages/           # Trang chính
        ├── stores/          # Zustand state
        └── lib/             # API client, utils
```

## API Endpoints

### Auth

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/auth/register` | Đăng ký tài khoản mới |
| POST | `/auth/login` | Đăng nhập |
| POST | `/auth/refresh` | Làm mới token |
| POST | `/auth/logout` | Đăng xuất |
| GET | `/auth/verify-email` | Xác thực email |
| POST | `/auth/forgot-password` | Quên mật khẩu |
| POST | `/auth/reset-password` | Đặt lại mật khẩu |
| GET | `/auth/me` | Lấy thông tin user hiện tại |
| PATCH | `/auth/avatar` | Cập nhật avatar |

### Story

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/stories` | Tạo story mới |
| GET | `/stories` | Lấy tất cả story đang hoạt động |
| GET | `/stories/me` | Lấy story của mình |
| GET | `/stories/:id` | Lấy story theo ID |
| DELETE | `/stories/:id` | Xóa story |

### Story Views

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/story-view/seen/:storyId` | Đánh dấu đã xem |
| GET | `/story-view/viewers/:storyId` | Xem danh sách người xem |
| GET | `/story-view/my-views` | Xem story đã xem |

## Công nghệ sử dụng

**Backend:**
- Node.js + Express
- PostgreSQL + Prisma ORM
- Cloudinary (lưu ảnh)
- JWT (xác thực)
- bcrypt (mã hóa mật khẩu)
- Zod (validation)
- Helmet, CORS, Rate Limiting (bảo mật)

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- Zustand (state management)
- React Router DOM
- React Hook Form + Zod
- Radix UI
- Lucide Icons

## Bảo mật

- Mật khẩu được hash với bcrypt (12 rounds)
- Access token hết hạn sau 15 phút
- Refresh token hết hạn sau 7 ngày
- Rate limiting trên API
- Input validation với Zod
- Helmet security headers
- SQL injection prevention qua Prisma

## License

MIT
