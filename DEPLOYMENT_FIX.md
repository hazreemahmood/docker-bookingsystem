# Login Issue Fix for Remote Deployment

## Problem
When accessing the booking system from a remote IP address (e.g., `http://175.141.240.242:8080`), the login fails because the React frontend was configured to send API requests to `http://localhost:8080/api`, which refers to the user's local machine, not the server.

## Changes Made

### 1. React API Service (`react/src/services/api.js`)
**Changed:** API base URL from hardcoded `http://localhost/api` to relative path `/api`

```javascript
// Before
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api';

// After
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

**Why:** Using a relative path ensures API requests go to the same domain/port as the frontend.

### 2. Nginx Configuration (`docker/nginx/conf.d/default.conf`)
**Changed:** Fixed incorrect root path and removed problematic redirect

```nginx
# Before
root /var/www/html/docker_bookingsystem/laravel/public;

location /docker_bookingsystem/laravel/public {
    return 301 http://hazree.bookingsystem.test;
}

# After
root /var/www/html/laravel/public;
```

**Why:** The path `docker_bookingsystem` doesn't exist in the container - it should be just `laravel/public`.

### 3. Docker Compose (`docker-compose.yml`)
**Changed:** React environment variable to use relative path

```yaml
# Before
environment:
  - VITE_API_BASE_URL=http://localhost:8080/api

# After
environment:
  - VITE_API_BASE_URL=/api
```

**Why:** Ensures the React app uses relative URLs when built/run in Docker.

## Deployment Instructions

### Step 1: Rebuild and Restart Containers
Run these commands on your home server:

```bash
# Stop all containers
docker-compose down

# Rebuild and start containers (important for React to pick up env changes)
docker-compose up --build -d

# Check if all containers are running
docker-compose ps
```

### Step 2: Clear Browser Cache
Since we changed frontend code, users need to:
1. Clear browser cache (Ctrl+Shift+Delete)
2. Or do a hard refresh (Ctrl+F5)
3. Or open in incognito/private mode

### Step 3: Test Login
1. Access: `http://175.141.240.242:8080/login`
2. Try to register a new account or login
3. Login should now work correctly

## Verification Steps

### Check if API is accessible:
```bash
# Test API endpoint directly
curl http://175.141.240.242:8080/api/services

# Should return JSON with services list
```

### Check container logs:
```bash
# View React container logs
docker logs booking_react

# View Nginx container logs
docker logs booking_nginx

# View PHP container logs
docker logs booking_php
```

### Check if containers can communicate:
```bash
# Enter Nginx container
docker exec -it booking_nginx sh

# Test connection to React
wget -qO- http://react:3000

# Test connection to PHP
wget -qO- http://php:9000

# Exit container
exit
```

## Expected Behavior After Fix

1. **Login Page**: Loads correctly at `http://175.141.240.242:8080/login`
2. **Login Request**: When submitting credentials, the request goes to `http://175.141.240.242:8080/api/auth/login` (not localhost)
3. **Authentication**: Token is received and stored in localStorage
4. **Redirect**: User is redirected to `/dashboard` after successful login
5. **API Calls**: All subsequent API calls use the correct server address

## Troubleshooting

### If login still fails:

1. **Check if API is responding:**
   ```bash
   # From your computer (not the server)
   curl http://175.141.240.242:8080/api/services
   ```
   Should return JSON data.

2. **Check firewall settings:**
   Ensure port 8080 is open on your home server.

3. **Check if containers are running:**
   ```bash
   docker-compose ps
   ```
   All should show "Up" status.

4. **Check database connection:**
   ```bash
   docker logs booking_php | grep -i error
   ```

5. **Verify Laravel is working:**
   ```bash
   docker exec booking_php php artisan route:list
   ```

## Additional Notes

- The fix uses **relative URLs** which is the best practice for this type of deployment
- The system will now work regardless of the domain/IP used to access it
- No need to update configuration when changing server IP addresses
- Works for both local development (`localhost:8080`) and remote access (`175.141.240.242:8080`)

## Security Reminder

Since this is exposed to the internet:
1. Consider changing default database passwords in `docker-compose.yml`
2. Set up HTTPS/SSL (port 443 is already mapped)
3. Keep the system updated
4. Monitor logs regularly

## Success Indicators

✅ Login page loads without errors  
✅ Can register new users  
✅ Can login with valid credentials  
✅ Redirects to dashboard after login  
✅ Can create bookings  
✅ Admin panel accessible (if admin user)  
✅ No console errors about API connectivity