# Social Media API Documentation

## Overview

The Social Media API is a RESTful web service that provides endpoints for managing users, posts, comments, and social interactions in a social media application. The API is built with Spring Boot and uses JWT for authentication.

## Base URL

- **Development**: `http://localhost:8080/api`
- **Production**: `https://api.socialmedia.example.com/api`

## Authentication

The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Getting a Token

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login`

Both endpoints return a JWT token that expires in 24 hours.

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login user | No |

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users/me` | Get current user profile | Yes |
| PUT | `/users/me` | Update current user profile | Yes |
| GET | `/users/{id}` | Get user by ID | Yes |
| POST | `/users/{id}/follow` | Follow a user | Yes |
| DELETE | `/users/{id}/follow` | Unfollow a user | Yes |
| GET | `/users/{id}/followers` | Get user followers | Yes |
| GET | `/users/{id}/following` | Get users being followed | Yes |

### Posts

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/posts` | Get posts feed | Yes |
| POST | `/posts` | Create a new post | Yes |
| GET | `/posts/{id}` | Get post by ID | Yes |
| DELETE | `/posts/{id}` | Delete a post | Yes |
| POST | `/posts/{id}/like` | Like a post | Yes |
| DELETE | `/posts/{id}/like` | Unlike a post | Yes |

### Comments

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/posts/{postId}/comments` | Get post comments | Yes |
| POST | `/comments` | Create a comment | Yes |
| DELETE | `/comments/{id}` | Delete a comment | Yes |

## Request/Response Examples

### Register User

**Request:**
\`\`\`bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "password123",
    "displayName": "John Doe"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "email": "john.doe@example.com",
    "displayName": "John Doe",
    "avatar": null,
    "bio": null,
    "followersCount": 0,
    "followingCount": 0,
    "postsCount": 0,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

### Create Post

**Request:**
\`\`\`bash
curl -X POST http://localhost:8080/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "content": "Just deployed my first microservice to Kubernetes!"
  }'
\`\`\`

**Response:**
\`\`\`json
{
  "id": "456e7890-e89b-12d3-a456-426614174000",
  "content": "Just deployed my first microservice to Kubernetes!",
  "authorId": "123e4567-e89b-12d3-a456-426614174000",
  "author": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "username": "johndoe",
    "displayName": "John Doe",
    "avatar": null
  },
  "likesCount": 0,
  "commentsCount": 0,
  "sharesCount": 0,
  "isLiked": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
\`\`\`

### Get Posts Feed

**Request:**
\`\`\`bash
curl -X GET "http://localhost:8080/api/posts?page=0&size=10" \
  -H "Authorization: Bearer <your-jwt-token>"
\`\`\`

**Response:**
\`\`\`json
{
  "content": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "content": "Just deployed my first microservice to Kubernetes!",
      "author": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "johndoe",
        "displayName": "John Doe",
        "avatar": null
      },
      "likesCount": 24,
      "commentsCount": 8,
      "sharesCount": 3,
      "isLiked": false,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 100,
  "totalPages": 10,
  "first": true,
  "last": false
}
\`\`\`

## Error Handling

The API returns standard HTTP status codes and error responses in JSON format:

\`\`\`json
{
  "message": "Invalid input provided",
  "status": 400,
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/posts"
}
\`\`\`

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `204 No Content` - Request successful, no content returned
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid token
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **Post creation**: 10 posts per hour per user

## Pagination

List endpoints support pagination with the following query parameters:

- `page` - Page number (0-based, default: 0)
- `size` - Number of items per page (default: 10, max: 100)

## Data Validation

### User Registration
- `username`: 3-20 characters, alphanumeric and underscores only
- `email`: Valid email format
- `password`: Minimum 8 characters
- `displayName`: 1-50 characters

### Posts
- `content`: 1-280 characters

### Comments
- `content`: 1-280 characters

## Development Setup

1. **Start the backend server**:
   \`\`\`bash
   cd backend
   ./mvnw spring-boot:run
   \`\`\`

2. **API will be available at**: `http://localhost:8080/api`

3. **Swagger UI**: `http://localhost:8080/swagger-ui.html`

4. **Health Check**: `http://localhost:8080/actuator/health`

## Testing

Use the provided Postman collection (`docs/postman-collection.json`) for testing all endpoints.

## Support

For API support and questions, please contact the development team or create an issue in the project repository.
