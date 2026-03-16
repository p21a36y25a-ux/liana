# Liana HR & Time Attendance WebApp

A comprehensive HR and Time Attendance management system built for Kosovo businesses, featuring advanced payroll calculations compliant with Kosovo Labor Law and EUR (€) currency support.

## 🚀 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS + Zustand |
| Backend | NestJS + TypeORM + MySQL |
| Real-time | Socket.io |
| Auth | JWT (JSON Web Tokens) |
| Database | MySQL 8.0 |
| API Docs | Swagger / OpenAPI |

## 📁 Project Structure

```
liana/
├── packages/
│   ├── backend/          # NestJS REST API
│   │   └── src/modules/
│   │       ├── auth/          # JWT auth & RBAC
│   │       ├── employees/     # Employee management
│   │       ├── punches/       # Clock-in/out with photos
│   │       ├── attendance/    # Daily attendance records
│   │       ├── leave/         # Leave request workflow
│   │       ├── payroll/       # Kosovo Law payroll engine
│   │       ├── notifications/ # Email notifications
│   │       └── departments/   # Organizational structure
│   ├── frontend/         # React + Vite SPA
│   │   └── src/
│   │       ├── pages/         # Route components
│   │       ├── components/    # Reusable UI components
│   │       ├── services/      # API client services
│   │       ├── store/         # Zustand state management
│   │       └── types/         # TypeScript interfaces
│   └── shared/           # Shared types & constants
├── docker-compose.yml    # MySQL + Backend + Frontend
├── .env.example          # Environment template
└── README.md
```

## 🏃 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (for MySQL)

### 1. Clone and Install

```bash
git clone <repo-url>
cd liana
npm install
```

### 2. Configure Environment

```bash
cp .env.example packages/backend/.env
# Edit packages/backend/.env with your settings
```

### 3. Start MySQL (Docker)

```bash
npm run docker:up
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts:
- **Backend API**: http://localhost:3000
- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:3000/api/docs

## 🔑 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Employee** | Clock in/out, view own attendance, request leave |
| **Manager** | Approve leave, view team attendance & reports |
| **HR Admin** | Full access: employee management, payroll, reports |
| **System Admin** | Complete system access including configuration |

## ⏰ Time Tracking

Employees can clock in/out directly from the main dashboard:
1. Navigate to **Time Tracking**
2. Click employee name card
3. Select **Check In** or **Check Out**
4. Camera captures verification photo
5. Attendance record is automatically updated in real-time

## 💰 Kosovo Law Payroll Calculation

The payroll engine implements three-tier hourly rates:

| Hours Bracket | Rate | Example (€7.50/hr) |
|--------------|------|-------------------|
| 0 – 160 hours | 100% | 160 × €7.50 = €1,200.00 |
| 161 – 200 hours | 130% | 40 × €9.75 = €390.00 |
| 201+ hours | 150% | 30 × €11.25 = €337.50 |

**Example**: Employee with 230 hours at €7.50/hr = **€1,927.50 gross**

### Base Period Defaults
- 20 working days / month (no Saturdays)
- 8 hours/day = 160 standard hours
- Overtime threshold: 160h (configurable)
- Premium threshold: 200h (configurable)
- Currency: EUR (€)

## 📋 Features

- ✅ **Camera-based Punch** – Photo verification on every clock in/out
- ✅ **Real-time Dashboard** – Live attendance status for all employees
- ✅ **Leave Management** – Full approval workflow (Employee → Manager → HR)
- ✅ **Advanced Payroll** – Kosovo Law 3-tier calculation engine
- ✅ **Role-Based Access** – 4 permission levels
- ✅ **Department Management** – Organizational structure
- ✅ **Email Notifications** – Leave approvals, payroll, punch alerts
- ✅ **Attendance Reports** – Monthly stats, filter by date/department
- ✅ **Swagger API Docs** – Complete API documentation
- ✅ **Docker Support** – One-command deployment

## 🔧 Environment Variables

See [.env.example](.env.example) for all required variables.

Key variables:
```bash
DB_HOST=localhost
DB_PASSWORD=liana_password
JWT_SECRET=your-secret-key
SMTP_HOST=smtp.gmail.com
FRONTEND_URL=http://localhost:5173
```

## 🐳 Docker Deployment

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🏗️ Implementation Phases

- [x] Phase 1: Project setup, auth, employee management
- [x] Phase 2: Time tracking with camera integration
- [x] Phase 3: Attendance records & timesheets
- [x] Phase 4: Leave management workflow
- [x] Phase 5: Kosovo Law payroll calculations
- [ ] Phase 6: Reporting & analytics
- [ ] Phase 7: Real-time Socket.io integration
- [ ] Phase 8: Email notification service

## 📄 License

Private – All rights reserved.

