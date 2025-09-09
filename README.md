# Social Media Demo App - Frontend

A modern React/Next.js frontend for a social media application designed to connect with a Java Spring Boot backend.

## Features

- 🎨 Modern, responsive UI with clean design
- 👤 User authentication and profiles
- 📝 Create, edit, and delete posts
- ❤️ Like and comment on posts
- 🔍 Search users and posts
- 📱 Mobile-first responsive design
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 📡 API client ready for Spring Boot integration

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Fetch API with custom wrapper

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Update `.env.local` with your backend API URL:
   \`\`\`
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   \`\`\`

4. Run the development server:
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

The frontend is designed to work with a Java Spring Boot backend. The API client (`lib/api.ts`) provides TypeScript interfaces and methods for all backend endpoints.

### Key API Endpoints Expected:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration
- `GET /api/posts` - Fetch posts feed
- `POST /api/posts` - Create new post
- `POST /api/posts/{id}/like` - Like/unlike post
- `POST /api/posts/{id}/comments` - Add comment
- `GET /api/users/profile` - Get user profile

See `docs/api-spec.yaml` for complete API specification.

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── header.tsx        # App header
│   ├── sidebar.tsx       # Navigation sidebar
│   ├── post-card.tsx     # Post component
│   └── post-feed.tsx     # Posts feed
├── lib/                  # Utilities
│   ├── api.ts           # API client
│   └── utils.ts         # Helper functions
├── hooks/               # Custom React hooks
├── public/              # Static assets
└── docs/               # API documentation
    └── api-spec.yaml   # OpenAPI specification
\`\`\`

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## API Documentation

The complete API specification is available in `docs/api-spec.yaml`. This OpenAPI specification defines all endpoints, request/response schemas, and authentication requirements that your Java Spring Boot backend should implement.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License
