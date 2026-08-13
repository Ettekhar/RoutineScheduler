# University Class Scheduler

An automated, conflict-free weekly class routine scheduling system for universities. This system manages teacher workloads, student batches, classrooms (theory & labs), and time-slot configurations to generate schedules efficiently.

👉 **[Live Deployment Link](https://routine-scheduler-xi.vercel.app/)**

---

## Features

- ⚡ **Automated Generation**: Instantly generate conflict-free weekly schedules with a single click.
- 📅 **Interactive Calendar**: Visual weekly calendar with drag-and-drop support for easy manual adjustments.
- 🏫 **Smart Resource Management**:
  - **Teachers**: Set maximum workloads and manage teaching hours.
  - **Courses**: Organize by semester, credit hours, and sessions per week.
  - **Batches**: Coordinate student cohorts by semester and sections.
  - **Classrooms**: Group rooms by type (Theory vs. Lab) and monitor occupancy.
- 🥪 **Lunch Break Configuration**: Block off custom time slots across the schedule (e.g. 1:15 PM - 2:00 PM).
- 🔄 **Session Management**: Switch schedules across semesters/sessions (e.g. Fall 2025, Spring 2025).
- 📤 **Data Export**: Export the generated schedules for semesters, sections, or individual batches.

---

## Tech Stack

### Frontend
- **Framework**: React 18 (TypeScript)
- **Styling**: Tailwind CSS & Radix UI / Shadcn
- **State Management & Server Cache**: TanStack Query (React Query)
- **Routing**: Wouter
- **Build Tool**: Vite

### Backend
- **Server**: Express (Node.js) with TypeScript
- **Bundler**: Esbuild (compiled to a optimized single CommonJS bundle for fast serverless cold starts)
- **Database/Storage**: File-based persistence utilizing a local JSON engine, optimized for serverless multi-instance environments via Vercel `/tmp` writable seeding.

---

## Getting Started (Local Development)

To run the project locally on your machine, follow these steps:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run in Development Mode**:
   ```bash
   npm run dev
   ```
   This will start both the Express backend and the Vite frontend dev server concurrently.

3. **Build for Production**:
   ```bash
   npm run build
   ```
   This script builds the frontend client bundle into `dist/public` and compiles the Express server code into `dist/index.cjs`.

4. **Start Production Server**:
   ```bash
   npm run start
   ```

---

## Vercel Serverless Architecture Details

This project is fully optimized for Vercel deployments:
- **`vercel.json`** leverages `@vercel/node` for serverless API endpoints and `@vercel/static-build` to serve React assets efficiently.
- Static asset serving uses `{ "handle": "filesystem" }` routing to ensure correct MIME types are resolved before falling back to the Single Page Application (`index.html`) routing.
- The storage system uses an active module-caching structure combined with dynamic path selection (falling back to `/tmp/storage.json` on Vercel) to bypass serverless read-only restrictions.
