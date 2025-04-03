# Peach - Textile Design Marketplace

Peach is a web application for selling and distributing TIFF layered textile design files. It's built with modern web technologies and provides a platform for designers to showcase and sell their work.

## Tech Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Prisma (with PostgreSQL)
- Lucia for authentication
- Resend for email
- Cloudflare R2 (S3 compatible) for file storage
- Trigger.dev for background jobs
- Biome for linting and formatting

## Prerequisites

- Node.js (v18 or later recommended)
- pnpm
- PostgreSQL database

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/siddharthborderwala/mypeach.git
cd mypeach
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the variables.

4. Set up the database:

```bash
pnpm db:generate
pnpm db:migrate
```

5. Run the development server:

```bash
pnpm dev
```

The application should now be running at `http://localhost:3000`.

## Project Structure

- `src/app`: Next.js app router pages and layouts
- `src/components`: React components
- `src/lib`: Utility functions and shared logic
- `src/hooks`: Custom React hooks
- `prisma`: Database schema and migrations

## Styling

This project uses Tailwind CSS for styling.

## Authentication

Authentication is handled using Lucia. The main configuration can be found in `src/lib/auth/lucia.ts`.


## File Storage

File storage is managed using AWS S3 compatible Cloudflare R2. The configuration is in `src/lib/storage/index.ts`.

### Public Bucket

The public bucket is used to store files that are publicly accessible, such as design thumbnails.

### Protected Bucket

The protected bucket is used to store files that are protected by authentication, such as the original design files.

## Background Jobs

Background jobs are managed using [trigger.dev](https://trigger.dev). The configuration can be found in `trigger.config.ts`.

All jobs are defined in `src/trigger/`.


## Linting and Formatting

This project uses Biome for linting and formatting. The configuration is in the `biome.json` file.

## Contributing

Please read the CONTRIBUTING.md file (if available) for details on our code of conduct and the process for submitting pull requests.
