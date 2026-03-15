# INVORA Backend

Production-ready Node.js + Express + MongoDB backend for the INVORA Smart Inventory Management System.

## Setup

```bash
# 1. Install dependencies
cd server
npm install

# 2. Configure environment
# Edit .env with your MongoDB URI (default: mongodb://localhost:27017/invora)

# 3. Seed the database
npm run seed

# 4. Start the server
npm run dev
```

## Demo Credentials

| Role     | Email               | Password    |
|----------|---------------------|-------------|
| Admin    | admin@store.com     | admin123    |
| Manager  | manager@store.com   | manager123  |
| Employee | employee@store.com  | emp123      |

## API Endpoints

| Method | Endpoint                    | Auth | Role            |
|--------|-----------------------------|------|-----------------|
| POST   | /api/auth/login             | ❌   | Any             |
| POST   | /api/auth/logout            | ✅   | Any             |
| GET    | /api/auth/me                | ✅   | Any             |
| GET    | /api/users                  | ✅   | Admin           |
| POST   | /api/users                  | ✅   | Admin           |
| PUT    | /api/users/:id              | ✅   | Admin           |
| PATCH  | /api/users/:id/toggle       | ✅   | Admin           |
| DELETE | /api/users/:id              | ✅   | Admin           |
| GET    | /api/products               | ✅   | All             |
| POST   | /api/products               | ✅   | Admin, Manager  |
| PUT    | /api/products/:id           | ✅   | Admin, Manager  |
| DELETE | /api/products/:id           | ✅   | Admin, Manager  |
| GET    | /api/products/sku/generate  | ✅   | Admin, Manager  |
| GET    | /api/categories             | ✅   | All             |
| POST   | /api/categories             | ✅   | Admin, Manager  |
| PUT    | /api/categories/:id         | ✅   | Admin, Manager  |
| DELETE | /api/categories/:id         | ✅   | Admin, Manager  |
| GET    | /api/requests               | ✅   | All             |
| POST   | /api/requests               | ✅   | All             |
| PUT    | /api/requests/:id/approve   | ✅   | Admin, Manager  |
| PUT    | /api/requests/:id/reject    | ✅   | Admin, Manager  |
| GET    | /api/reports/stock-summary  | ✅   | Admin, Manager  |
| GET    | /api/reports/low-stock      | ✅   | Admin, Manager  |
| GET    | /api/reports/stock-movement | ✅   | Admin, Manager  |
| GET    | /api/logs                   | ✅   | Admin           |
| GET    | /api/settings               | ✅   | All             |
| PUT    | /api/settings               | ✅   | Admin           |
| POST   | /api/settings/reset         | ✅   | Admin           |
