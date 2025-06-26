# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WOD-GPT is an AI-powered CrossFit workout generator built with React/TypeScript frontend and Azure Functions backend. It generates custom workouts based on user preferences including movement selection, workout format, and weight units.

## Development Commands

### Frontend (Root Directory)
- `npm run dev` - Start Vite development server on port 5173
- `npm run build` - Build frontend (runs TypeScript compilation then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run start` - Start SWA CLI with dev server and API (full stack development)

### Backend (api/ Directory)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode TypeScript compilation
- `npm run start` - Start Azure Functions locally (requires build first)
- `npm run clean` - Remove dist directory

### Full Stack Development
Use `npm run start` from root directory - this starts SWA CLI which runs both frontend dev server and API together.

## Architecture

### Frontend Structure
- **App.tsx**: Main application component managing workout generation state
- **hooks/**: Custom React hooks for data fetching and state management
  - `useWod.tsx`: Handles workout generation API calls
  - `useExercises.tsx`: Manages movement selection state
  - `useFeedback.tsx`: Handles feedback submission
- **components/**: UI components organized by functionality
  - Main UI: `MainMenu`, `GeneratedWod`, `FancyLoadingSpinner`
  - Selectors: `WorkoutSelector`, `FormatSelector`, `UnitSelector`, `SelectMovements`
  - UI library: Shadcn/ui components in `ui/` subdirectory
- **lib/**: Utility functions and data
  - `movementList.ts`: Complete list of available exercises
  - `backgrounds.tsx`: Animated background components
  - `utils.ts`: General utilities and Tailwind class merging

### Backend Structure
- **Azure Functions** runtime with TypeScript
- **functions/**: API endpoints
  - `generateWod.ts`: Main workout generation using OpenAI API
  - `giveFeedback.ts`: Feedback collection endpoint
- **movements/**: Exercise data and types
  - `movements.ts`: Array of all movement IDs
  - `types.ts`: TypeScript definitions for movements
- **prompts/**: AI prompt templates for workout generation

### Key Data Flow
1. User selects preferences in frontend components
2. `useWod` hook calls `/api/generateWod` endpoint
3. Backend uses OpenAI API with structured prompts
4. Generated workout displayed in `GeneratedWod` component

### Movement System
Movements are categorized by type (bodyweight, weightlifting, kettlebell, etc.) and stored as string IDs. The frontend allows selection by category or individual movements.

### Styling
- Tailwind CSS for styling
- Framer Motion for animations
- Theme system with dark/light mode toggle
- Animated gradient backgrounds

## Environment Requirements

### Backend Environment Variables
- `OPEN_AI_TARGET_URI`: Azure OpenAI endpoint
- `OPEN_AI_TARGET_KEY`: Azure OpenAI API key

### Development Tools
- Node.js
- Azure Functions Core Tools (for API development)
- SWA CLI (Static Web Apps CLI for full-stack development)

## Testing

Currently no test framework is configured. The backend includes a placeholder test script that outputs "No tests yet...".

## Deployment

Project is configured for Azure Static Web Apps deployment with:
- Frontend build output in `dist/`
- API functions in `api/dist/`
- SWA CLI configuration for local development