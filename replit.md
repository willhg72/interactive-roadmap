# Roadmap Generator Application

## Overview

This is a full-stack web application built to generate and visualize project roadmaps. The application allows users to upload JSON files containing roadmap data, validate the structure, and display interactive roadmap visualizations. It's built with a React frontend and Express.js backend, using PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Data Visualization**: D3.js for SVG-based roadmap rendering
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for roadmap validation and storage
- **Database**: PostgreSQL with Drizzle ORM
- **Storage**: In-memory storage for development, with database schema ready for production
- **Validation**: Zod for runtime type validation

### Database Schema
The application uses two main tables:
- `users`: For user authentication (id, username, password)
- `roadmaps`: For storing roadmap data (id, name, data as JSON, createdAt)

## Key Components

### Data Models
- **RoadmapBox**: Individual task/milestone with title and goal description
- **RoadmapSegment**: Groups of boxes with duration in weeks
- **RoadmapData**: Complete roadmap structure with multiple segments

### Frontend Components
- **FileUpload**: Drag-and-drop JSON file upload with validation
- **RoadmapCanvas**: Interactive SVG canvas with zoom/pan capabilities
- **RoadmapGenerator**: Main page component orchestrating the workflow

### Backend Services
- **Storage Interface**: Abstraction layer supporting both memory and database storage
- **Validation Service**: JSON schema validation using Zod
- **Route Handlers**: API endpoints for roadmap operations

## Data Flow

1. **Upload Phase**: User uploads JSON file via drag-and-drop interface
2. **Validation**: Frontend sends data to `/api/roadmap/validate` endpoint
3. **Schema Validation**: Backend validates using Zod schemas
4. **Visualization**: Valid data is rendered as interactive SVG using D3.js
5. **Storage**: Roadmaps can be saved to database via `/api/roadmap` endpoint
6. **Interaction**: Users can zoom, pan, and interact with the roadmap visualization

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive use of Radix UI primitives via shadcn/ui
- **Data Fetching**: TanStack Query for API communication
- **Visualization**: D3.js for roadmap rendering
- **Styling**: Tailwind CSS with custom design tokens

### Backend Dependencies
- **Database**: Neon PostgreSQL serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for runtime type checking
- **Session Management**: PostgreSQL-based session storage

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: Node.js with tsx for TypeScript execution
- **Database**: Environment variable based configuration

### Production Build
- **Frontend**: Vite production build with optimizations
- **Backend**: ESBuild bundling for Node.js deployment
- **Static Assets**: Served from dist/public directory
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Build Process
1. Frontend assets built using Vite
2. Backend bundled using ESBuild
3. Database migrations applied via Drizzle Kit
4. Static file serving configured for production

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```