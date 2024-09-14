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
git clone https://github.com/your-username/peach.git
cd peach
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Create a `.env` file in the root directory and add the following variables:

```
DATABASE_URL=your_postgresql_database_url
RESEND_API_KEY=your_resend_api_key
TRIGGER_SECRET_KEY=your_trigger_dev_secret_key
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
```

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

## Background Jobs

Background jobs are managed using [trigger.dev](https://trigger.dev). The configuration can be found in `trigger.config.ts`.

All jobs are defined in `src/trigger/`.


## Linting and Formatting

This project uses Biome for linting and formatting. The configuration is in the `biome.json` file.

## Contributing

Please read the CONTRIBUTING.md file (if available) for details on our code of conduct and the process for submitting pull requests.
