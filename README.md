# Task Management System

The system should allow users to create, assign, track, and manage tasks efficiently.

## Core Requirements:

### User Authentication:

● Secure user registration and login functionalities.
● Use industry-standard practices for password storage and session management.

### Task Management:

● Create tasks with attributes: title, description, due date, priority, and status.
● Implement full CRUD (Create, Read, Update, Delete) operations for tasks.

### Team Collaboration:

● Allow users to assign tasks to other registered users.
● Implement a notification system to alert users when a task is assigned.

### Dashboard:

● Tasks assigned to them
● Tasks they created
● Overdue tasks

### Search and Filter:

● Implement search by task title or description.
● Filtering based on status, priority, and due date.

## Technical Specifications:

● Frontend: Next.js, Javascript, Tailwindcss
Backend: Node.js with Express.js
Database: MongoDB

## Deployment

Click=> [Open link]()

## Setup instructions

GIt Clone

```bash
https://github.com/vishnuu5/Task-Management-System-stamurai-task.git
```

### Frontend setup & Installations

Add `.env` variables here like

```bash
NEXT_PUBLIC_API_URL=http://localhost:backend-url
```

1. installations

```bash
npm install
```

2. frontend Project run

```bash
npm run dev
```

### Backend setup & Installations

1. Add `.env` variables here like

```bash
PORT=5000
MONGODB_URI=Mongodb-url
JWT_SECRET=""
NODE_ENV=development
FRONTEND_URL=http://localhost:frontend-url
```

2.  installations

```bash
npm install
```

2. backend Project run

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - change-password

### analytics

- `GET /api/analytics/task-completion` - Get task completion metrics
- `GET /api/analytics/task-completion-by-user` - Get task completion by user
- `GET /api/analytics/overdue-trend` - Get overdue tasks trend
- `GET /api/analytics/priority-distribution` - Get task distribution by priority
- `GET /api/analytics/task-creation-trend` - Get task creation trend
- `GET /api/analytics/user-activity` - Get user activity summary

### auditlogs

- `GET /api/audit-logs/` - Get all audit logs (admin only)
- `GET /api/audit-logs/:id` - Get audit log by ID (admin only)
- `GET /api/audit-logs/entity/:type/:id` - Get audit logs for a specific entity (admin and managers)

### notificaions

- `GET /api/notifications/` - Get all notifications for the current user
- `PUT /api/notifications/:id/read` - Mark a notification as read
- `delete /api/notifications/clear` - Clear all notifications for the current user
- `POST /api/notifications/test` - Create a new notification (for testing)

### preferences

- `GET /api/preferences/` - Get user preferences
- `PUT /api/preferences/` - Update user preferences
- `POST /api/notifications/reset` - Reset user preferences to default

### tasks

- `GET /api/tasks/` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks/` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `patch /api/tasks/:id` - Update task status
- `delete /api/tasks/:id` - Delete task

### users

- `GET /api/users/` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin only)
- `delete /api/users/:id` - Delete user (admin only)

### License

MIT
