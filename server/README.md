# BuddyChat Server

This folder contains the backend server for BuddyChat, built with **Node.js**, **Express**, and **TypeScript**.

## Prerequisites

- Node.js 18+
- npm
- MongoDB connection string

## Environment variables

Create a `.env` file in `/home/runner/work/BuddyChat/BuddyChat/server` with:

```env
PORT=5000
MONGODB_URL=your_mongodb_connection_string
```

## Install dependencies

```bash
npm install
```

## Run the server

Development mode (with auto-reload):

```bash
npm run dev
```

Direct start:

```bash
npm run start
```

Build TypeScript:

```bash
npm run build
```

## API health check

When running, verify server status:

```http
GET /
```

Expected response:

```json
{
  "success": true,
  "message": "Server is Running."
}
```

## Project structure

- `server.ts` – App bootstrap, middleware, DB connection, and routes
- `config/db.config.ts` – MongoDB connection setup
