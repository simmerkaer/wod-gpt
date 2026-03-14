# WOD-GPT

![WOD-GPT](wod-gpt-image.png)

An AI-powered crossfit workout generator that creates custom workouts based on your preferences.

## Frontend

The frontend is built with React, TypeScript, and Vite.

### Frontend Features

- React
- TypeScript
- Vite
- ESLint and Prettier for code quality
- Tailwind CSS for styling
- Shadcn UI components

## Backend

The backend is built with Azure Functions and TypeScript. It includes various dependencies for handling API requests, monitoring, and communication.

### Backend Features

- Azure Functions
- TypeScript
- Azure Communication Services for email
- OpenAI integration

### Workout history blob migration

Workout history is stored as **one JSON blob per user**: `users/{userId}/workouts.json`. Older deployments used monthly paths: `users/{userId}/{year}/{month}/workouts.json`.

From the **`api/`** directory, with `AZURE_STORAGE_CONNECTION_STRING` set:

```sh
# Preview (no writes)
npm run migrate-workouts -- --dry-run

# Merge legacy monthly blobs into single blob per user (idempotent)
npm run migrate-workouts

# After verifying data, remove old monthly blobs
npm run migrate-workouts -- --delete-legacy
```

Deploy the API that uses the single-blob layout, then run the migration as soon as you can so history appears again for users who only had monthly files.

### Getting Started

Install dependencies:

Note: NODE must be v18
```sh
npm install
```

Start the SWA CLI server:

```sh
npm run start
```
