# Social Media Backend API

A Node.js/Express backend service for the social media demo application.

## Features

- **Authentication**: JWT-based auth with registration and login
- **Posts**: Create, read, delete posts with image support
- **Comments**: Nested commenting system with likes
- **Likes**: Like/unlike posts and comments
- **Follows**: Follow/unfollow users with follower counts
- **Users**: User profiles, search, and profile updates
- **Notifications**: Real-time notification system
- **Security**: Rate limiting, CORS, input validation, SQL injection protection

## Quick Start

### Prerequisite
- Node.js 18+
- MySQL 8.0+

### Installation

1. **Clone and install dependencies:**
\`\`\`bash
cd backend
npm install
\`\`\`

2. **Set up environment variables:**
\`\`\`bash
cp .env.example .env
# Edit .env with your database credentials and JWT secret
\`\`\`

3. **Set up database:**
\`\`\`bash
# Create database and run migrations
mysql -u root -p < ../database/init/01-create-tables.sql
mysql -u root -p < ../database/init/05-seed-data.sql
\`\`\`

4. **Start the server:**
\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get posts feed
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `DELETE /api/posts/:id` - Delete post

### Users
- `GET /api/users/:username` - Get user profile
- `GET /api/users/:username/posts` - Get user posts
- `PUT /api/users/profile` - Update profile
- `GET /api/users?q=search` - Search users

### Comments
- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Likes
- `POST /api/likes/posts/:postId` - Toggle post like
- `POST /api/likes/comments/:commentId` - Toggle comment like

### Follows
- `POST /api/follows/:username` - Follow/unfollow user
- `GET /api/follows/:username/followers` - Get followers
- `GET /api/follows/:username/following` - Get following

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## Environment Variables

\`\`\`env
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=social_media
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
\`\`\`

## Docker Support

\`\`\`bash
# Build image
docker build -t social-media-backend .

# Run container
docker run -p 3001:3001 --env-file .env social-media-backend
\`\`\`

## Testing

\`\`\`bash
npm test
\`\`\`

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Validates all inputs
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configurable cross-origin requests
- **Helmet**: Security headers
- **Password Hashing**: bcrypt with salt rounds

## Database Schema

The backend uses the MySQL schema defined in `/database/init/01-create-tables.sql` with the following main tables:

- `users` - User accounts and profiles
- `posts` - User posts with content and images
- `comments` - Post comments
- `likes` - Post and comment likes
- `follows` - User follow relationships
- `notifications` - User notifications

## Error Handling

All endpoints return consistent error responses:

\`\`\`json
{
  "error": {
    "message": "Error description",
    "details": ["Validation errors if applicable"]
  }
}
\`\`\`

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
