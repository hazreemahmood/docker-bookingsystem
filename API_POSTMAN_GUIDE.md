# API Testing Guide for Booking System

## 🔥 Root Cause of Login Failure

The problem was in the **Nginx configuration path**. Here's what was wrong:

**docker-compose.yml volume mount:**
```yaml
volumes:
  - ./laravel:/var/www/html
```
This mounts the `laravel/` directory directly to `/var/www/html`, so index.php lives at `/var/www/html/public/index.php`.

**OLD (wrong) Nginx config:**
```nginx
root /var/www/html/laravel/public;   # ❌ This path doesn't exist!
```
This was trying to find `/var/www/html/laravel/public/index.php` which doesn't exist because the Laravel code is at `/var/www/html/public/index.php`.

**FIXED Nginx config:**
```nginx
root /var/www/html/public;   # ✅ Correct path!
```

---

## 📬 Postman API Test Guide

### Register a New User

| Method | URL |
|--------|-----|
| **POST** | `http://175.141.240.242:8080/api/auth/register` |

**Headers:**
| Key | Value |
|-----|-------|
| Content-Type | application/json |
| Accept | application/json |

**Body (raw JSON):**
```json
{
    "name": "Test User",
    "email": "testuser@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Expected Response (201 Created):**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "name": "Test User",
        "email": "testuser@example.com",
        "role": "user",
        "created_at": "2026-06-05T...",
        "updated_at": "2026-06-05T..."
    },
    "token": "1|abc123def456..."
}
```

---

### Login (This is what's failing)

| Method | URL |
|--------|-----|
| **POST** | `http://175.141.240.242:8080/api/auth/login` |

**Headers:**
| Key | Value |
|-----|-------|
| Content-Type | application/json |
| Accept | application/json |

**Body (raw JSON):**
```json
{
    "email": "testuser@example.com",
    "password": "password123"
}
```

**Expected Response (200 OK):**
```json
{
    "message": "Login successful",
    "user": {
        "id": 1,
        "name": "Test User",
        "email": "testuser@example.com",
        "role": "user",
        ...
    },
    "token": "1|abc123def456..."
}
```

**Error Response (422 Unprocessable):**
```json
{
    "message": "The provided credentials are incorrect.",
    "errors": {
        "email": ["The provided credentials are incorrect."]
    }
}
```

---

### Get Available Services (Public - No Auth Needed)

| Method | URL |
|--------|-----|
| **GET** | `http://175.141.240.242:8080/api/services` |

**Expected Response (200):**
```json
[
    {
        "id": 1,
        "name": "Service Name",
        "description": "...",
        "duration_minutes": 60,
        "base_price": "50.00"
    }
]
```

---

### Get Current User (Requires Auth Token)

| Method | URL |
|--------|-----|
| **GET** | `http://175.141.240.242:8080/api/auth/me` |

**Headers:**
| Key | Value |
|-----|-------|
| Authorization | Bearer YOUR_TOKEN_HERE |
| Accept | application/json |

---

### Create a Booking (Requires Auth Token)

| Method | URL |
|--------|-----|
| **POST** | `http://175.141.240.242:8080/api/bookings` |

**Headers:**
| Key | Value |
|-----|-------|
| Authorization | Bearer YOUR_TOKEN_HERE |
| Content-Type | application/json |
| Accept | application/json |

**Body (raw JSON):**
```json
{
    "service_id": 1,
    "customer_name": "Test User",
    "customer_email": "testuser@example.com",
    "booking_date": "2026-06-10",
    "time_slot": "10:00",
    "duration_minutes": 60,
    "price": 50.00,
    "notes": "Optional notes"
}
```

---

## 🛠️ Deployment Fix Instructions

### Step 1: Rebuild and Restart Containers

SSH into your home server and run:

```bash
cd /path/to/your/docker-bookingsystem

# Stop all containers
docker-compose down

# Delete old node_modules volume to force clean install
docker volume rm docker-bookingsystem_react_node_modules 2>/dev/null || true

# Rebuild and start
docker-compose up --build -d

# Check status
docker-compose ps
```

### Step 2: Run Laravel Migrations

```bash
# Enter PHP container
docker exec -it booking_php sh

# Run migrations to create database tables
php artisan migrate --force

# (Optional) Seed demo data
php artisan db:seed --force

# Exit container
exit
```

### Step 3: Fix Storage Permissions

```bash
docker exec booking_php chmod -R 777 storage bootstrap/cache
```

### Step 4: Test the API

```bash
# Test if API is alive
curl http://175.141.240.242:8080/api/services

# Test login
curl -X POST http://175.141.240.242:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"testuser@example.com","password":"password123"}'
```

### Step 5: Clear Browser Cache

After deployment, clear your browser cache or use incognito mode before testing.

---

## 📋 Quick Troubleshooting Checklist

If login still fails after the fix:

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `POST http://.../api/auth/login` returns 404 | Nginx path still wrong | Check `root` in nginx config |
| Returns 500 error | No APP_KEY generated | Run `php artisan key:generate` |
| Returns 500 error | No migrations run | Run `php artisan migrate` |
| Returns 422 with "credentials incorrect" | No user exists or wrong password | Register first or check credentials |
| Returns `net::ERR_CONNECTION_REFUSED` | Port 8080 not open on server | Check firewall |
| Login works in Postman but not browser | CORS issue | Already configured for `*` origins |

---

## 🚀 After Fix: Verify Complete Flow

```mermaid
sequenceDiagram
    Browser->>Server: GET http://175.141.240.242:8080/login
    Server->>Browser: React Login Page
    Browser->>Server: POST /api/auth/login {email, password}
    Nginx->>PHP: FastCGI /public/index.php
    PHP->>MySQL: Find user by email
    MySQL->>PHP: User found
    PHP->>Browser: 200 {token, user}
    Browser->>localStorage: Save token
    Browser->>Server: GET /dashboard (with Bearer token)
    Server->>Browser: Dashboard page ✅