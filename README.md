# Parallax Portfolio - Full Stack Setup

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update with your values:
```bash
cp .env.example .env
```

**Required Configuration:**
- `MONGODB_URI`: Your MongoDB connection string
- `EMAIL_USER`: Your email address for sending notifications
- `EMAIL_PASSWORD`: Your email app password (for Gmail, use App Password)
- `ADMIN_EMAIL`: Email address to receive audit notifications

### 3. Start MongoDB
Make sure MongoDB is running locally or use MongoDB Atlas:
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### 4. Run the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## Project Structure

```
Parallax-Portfolio/
├── models/              # Database models
│   └── AuditRequest.js
├── routes/              # API routes
│   └── api.js
├── services/            # Business logic
│   └── emailService.js
├── js/                  # Frontend JavaScript
│   └── api.js
├── css/                 # Stylesheets
├── shaders/             # WebGL shaders
├── index.html           # Main portfolio page
├── audit.html           # Audit form page
├── server.js            # Express server
├── package.json         # Dependencies
└── .env                 # Environment variables (create this)
```

## API Endpoints

### POST /api/audit
Submit a new audit request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "website": "https://example.com",
  "message": "Looking for a digital audit"
}
```

### GET /api/audit
Get all audit requests (paginated)
Query params: `?page=1&limit=10`

### GET /api/audit/:id
Get a specific audit request by ID

## Email Setup (Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
3. Use this app password in your `.env` file as `EMAIL_PASSWORD`

## Database Schema

**AuditRequest Model:**
- `name`: String (required)
- `email`: String (required, validated)
- `company`: String (required)
- `website`: String (required, URL format)
- `message`: String (required)
- `status`: Enum ['pending', 'reviewed', 'contacted', 'completed']
- `createdAt`: Date
- `updatedAt`: Date

## Features

✅ Full-stack Node.js/Express backend
✅ MongoDB database integration
✅ Email notifications (user confirmation + admin alert)
✅ Form validation (frontend + backend)
✅ RESTful API endpoints
✅ Error handling
✅ CORS enabled
✅ Static file serving

## Next Steps

- [ ] Add authentication for admin endpoints
- [ ] Create admin dashboard to view submissions
- [ ] Add rate limiting
- [ ] Implement logging
- [ ] Add unit tests
- [ ] Deploy to production (Vercel, Heroku, etc.)
