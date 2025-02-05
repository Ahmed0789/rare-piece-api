# API using HAPI 

## Overview
This API is built using the **Hapi.js** framework and follows modern best practices, including **JWT-based authentication**, **session management**, and **rate limiting** to prevent abuse. The API uses **MySQL** as the database, managed via **Sequelize ORM**.

## Features
- User authentication with **JWT tokens**.
- Rate limiting on authentication routes to prevent brute-force attacks.
- Secure password hashing using **bcrypt.js**.
- **Sequelize ORM** for database management.
- **Hapi.js latest standards** for API development.

## Requirements

### Node.js

Please install [Node.js](http://nodejs.org/) `>= v18` and [npm](https://nodejs.org/) `>= v9`. You will find it
easier to use the Node Version Manager [nvm](https://github.com/creationix/nvm)


## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ahmed0789/hapi-auth-api.git
cd hapi-auth-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root:
```
PORT=3000
JWT_SECRET=your_super_secure_secret_key
JWT_EXPIRATION=1d
MYSQL_DATABASE=RarePieceTest
MYSQL_USER=root
MYSQL_PASSWORD=your_mysql_password
MYSQL_HOST=localhost
```

### 4. Start the API Server
```bash
npm run start
```

## Database Setup
This API uses **MySQL** as the database. Ensure MySQL is installed and running locally.

### Create the Database
```sql
CREATE DATABASE RarePieceTest;
```

### Create the Users Table
```sql
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Authentication Routes
All authentication routes use **JWT-based authentication** and **rate limiting**.

### 1. User Registration
**Endpoint:** `POST /register`

**Request Body:**
```json
{
  "username": "test@example.com",
  "password": "SecurePass123"
}
```

**Responses:**
- `201 Created`: User registered successfully with a JWT token.
- `409 Conflict`: Account already exists.
- `422 Unprocessable Entity`: Username or password is missing.

---

### 2. User Login
**Endpoint:** `POST /login`

**Request Body:**
```json
{
  "username": "test@example.com",
  "password": "SecurePass123"
}
```

**Responses:**
- `200 OK`: Login successful, returns a JWT token.
- `401 Unauthorized`: Invalid credentials.
- `422 Unprocessable Entity`: Username or password is missing.

---

### 3. User Logout
**Endpoint:** `POST /logout`

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
- `200 OK`: User logged out successfully.

---

### 4. Get User Profile
**Endpoint:** `GET /profile`

**Headers:**
```http
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "user": {
    "userId": 1
  }
}
```

## Rate Limiting
All authentication routes have a **request limit** to prevent abuse:
- `POST /register`: **5 requests per minute**
- `POST /login`: **5 requests per minute**
- `POST /logout`: **10 requests per minute**
- `GET /profile`: **10 requests per minute**

Rate limiting is managed using the **hapi-rate-limit** plugin.

## JWT Authentication
JWT tokens are issued at login/registration and must be included in the `Authorization` header for protected routes.

### Example:
```http
Authorization: Bearer <JWT_TOKEN>
```

## API Technologies Used
- **Hapi.js** - Web framework.
- **MySQL** - Relational database.
- **Sequelize ORM** - Database management.
- **bcrypt.js** - Secure password hashing.
- **JWT (JSON Web Tokens)** - Authentication.
- **@hapi/jwt** - JWT handling.
- **hapi-rate-limit** - Rate limiting.

## Deployment
To deploy this API using **Docker**, use the following:

### Dockerfile
```dockerfile
FROM node:20
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "src/server/index.js"]
```

### Run the API in Docker
```bash
docker build -t hapi-api .
docker run -p 3000:3000 hapi-api
```
---

🚀🚀🚀