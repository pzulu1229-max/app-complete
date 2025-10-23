
# Event Management Monolith Application

A full-stack monolith event management application built with Elysia.js, featuring authentication, user roles, realtime updates, and modern tool integrations.

## Features

- JWT Authentication with role-based access control
- User roles (Admin, Organizer, Attendee)
- Event management with admin approval
- RSVP system with status tracking
- Realtime updates via WebSockets
- Mock email notifications with Ethereal
- PostgreSQL database with Prisma ORM
- Auto-generated API documentation with Swagger

## Tech Stack

- **Backend**: Elysia.js (Bun runtime)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT
- **Realtime**: WebSockets
- **Email**: Nodemailer + Ethereal
- **Deployment**: Render

## Quick Start

### Prerequisites

- Bun runtime (or Node.js)
- PostgreSQL database (Neon recommended)
- Ethereal account for email testing

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd event-monolith-app
