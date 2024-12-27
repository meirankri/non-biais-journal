# Next.js Blog Platform

A modern blog platform built with Next.js, Prisma, and PostgreSQL.

## Features

- Dynamic routing with category and article slugs
- Full-text search capabilities
- Tag system for articles
- Responsive design with Tailwind CSS
- SEO-friendly with static page generation
- REST API endpoints for CRUD operations

## Prerequisites

- Node.js 16.x or later
- PostgreSQL database
- npm or yarn package manager

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd nextjs-blog
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env.example` to `.env`
   - Update the `DATABASE_URL` with your PostgreSQL connection string

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The project uses three main models:

- **Article**: Blog posts with title, content, author, etc.
- **Category**: Groups articles into categories
- **Tag**: Optional tags for articles

## API Routes

- `GET /api/articles`: List articles with pagination
- `POST /api/articles`: Create a new article
- `GET /api/articles/[categorySlug]/[articleSlug]`: Get article details
- `GET /api/categories`: List all categories
- `POST /api/categories`: Create a new category

## Development

- Run tests: `npm test`
- Format code: `npm run format`
- Lint code: `npm run lint`

## Deployment

The project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.