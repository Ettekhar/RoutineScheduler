# University Class Routine Scheduling System

## Overview

This is a web-based university class routine scheduling system designed to automatically generate conflict-free weekly class schedules for all 8 semesters. The system manages classroom assignments, teacher availability, and student batches while ensuring no scheduling conflicts occur.

The application provides an admin panel for managing teachers, courses, batches, and classrooms, along with an automated schedule generator that balances workloads and minimizes gaps. Users can view schedules in a calendar format, manually edit assignments with real-time conflict detection, and export schedules to various formats.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component Library**: Shadcn/ui (New York style) built on Radix UI primitives
- Uses Tailwind CSS for styling with custom design tokens
- Material Design principles for data-intensive productivity application
- Responsive layouts with mobile-first approach

**State Management**: 
- TanStack Query (React Query) for server state management
- Local React state for UI interactions
- No global state management library (intentionally simple)

**Routing**: Wouter for lightweight client-side routing

**Design System**:
- Typography: Inter font family with defined hierarchy (text-3xl for page titles down to text-xs for timestamps)
- Spacing: Tailwind units (2, 3, 4, 6, 8, 12, 16) for consistent spacing
- Color system: HSL-based with CSS variables for theme support (light/dark mode)
- Component variants: Uses class-variance-authority for consistent button and component styling

**Key UI Patterns**:
- Dashboard with statistics cards
- Calendar/schedule grid view with drag-and-drop capability
- Admin panels with CRUD tables
- Real-time conflict detection with visual feedback (orange highlighting)
- Modal-based editing forms with validation

### Backend Architecture

**Runtime**: Node.js with Express.js

**Language**: TypeScript with ES modules

**API Design**: RESTful JSON API
- CRUD endpoints for teachers, courses, batches, classrooms
- Schedule generation and management endpoints
- Statistics/analytics endpoints

**Server Structure**:
- `server/index.ts`: Main Express application setup
- `server/routes.ts`: API route definitions
- `server/storage.ts`: Data access layer abstraction
- `server/static.ts`: Static file serving for production
- `server/vite.ts`: Development server with HMR integration

**Development vs Production**:
- Development: Vite middleware for HMR
- Production: Pre-built static assets served via Express

### Data Storage

**Database**: PostgreSQL via Neon serverless driver

**ORM**: Drizzle ORM
- Type-safe database queries
- Schema definition in `shared/schema.ts`
- Migrations managed via drizzle-kit

**Database Schema**:
- **Teachers**: id, name, designation, department, maxLoad, currentLoad
- **Courses**: id, code, name, semester, creditHours, courseType (theory/lab), sessionsPerWeek
- **Batches**: id, name, semester, studentCount, section
- **Classrooms**: id, name, capacity, classroomType (theory/lab)
- **TimeSlots**: Predefined time slots for scheduling periods
- **ScheduleEntries**: Links courses, teachers, batches, classrooms, and time slots

**Validation**: Zod schemas for runtime validation (derived from Drizzle schemas using drizzle-zod)

### Core Features

**Schedule Generation Algorithm**:
- Conflict detection for teachers, rooms, and batches
- Automatic lab section splitting for batches > 25 students
- Teacher workload balancing
- Gap minimization in schedules
- 5-day working week (Sunday-Thursday)

**Conflict Detection**:
- Real-time validation during manual edits
- Visual indicators (orange/warning color)
- Conflict type identification (teacher/room/batch)

**Export Functionality**:
- PDF generation
- Filter by teacher, semester, or day
- Full schedule or filtered views

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: PostgreSQL serverless driver for Neon
- **drizzle-orm**: Type-safe ORM for database operations
- **drizzle-zod**: Schema-to-Zod converter for validation

### Frontend Libraries
- **React**: UI framework (v18+)
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight routing
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation with Zod
- **date-fns**: Date manipulation and formatting

### UI Components (Radix UI)
- Complete set of @radix-ui components (dialog, dropdown, select, etc.)
- **cmdk**: Command palette component
- **embla-carousel-react**: Carousel functionality

### Styling
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **clsx** + **tailwind-merge**: Conditional class name utilities

### Build Tools
- **Vite**: Frontend build tool and dev server
- **esbuild**: Server bundling for production
- **tsx**: TypeScript execution for development

### Development Tools
- **@replit/vite-plugin-runtime-error-modal**: Error overlay for Replit
- **@replit/vite-plugin-cartographer**: Replit integration
- **@replit/vite-plugin-dev-banner**: Development banner

### Utility Libraries
- **zod**: Schema validation
- **nanoid**: Unique ID generation
- **uuid**: UUID generation (alternative ID strategy)

### Potential Future Dependencies
- PDF generation library (currently referenced but not implemented)
- xlsx: Excel export functionality (listed in dependencies)