# CSA Portal Backend API

This is the production-ready Node.js/Express backend for the CSA Portal.

## Tech Stack
-   **Runtime**: Node.js
-   **Framework**: Express
-   **Database**: PostgreSQL
-   **ORM**: Prisma
-   **Auth**: JWT + Bcrypt
-   **Security**: Helmet, Rate Limiting, CORS

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env` file from the example:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/csa_portal"
    PORT=3000
    JWT_SECRET="your_production_secret"
    ```

3.  **Database Migration**:
    ```bash
    npx prisma migrate dev --name init
    ```

4.  **Run Development**:
    ```bash
    npm run dev
    ```

5.  **Build & Run Production**:
    ```bash
    npm run build
    npm start
    ```

## API Endpoints

### Auth
-   `POST /api/auth/register` - Create new account
-   `POST /api/auth/login` - Login and get Token
-   `GET /api/auth/me` - Get current user profile

### Theme
-   `GET /api/theme` - Get user's saved theme
-   `PUT /api/theme` - Update user's theme

## Production Notes
-   Set `NODE_ENV=production`
-   Use a process manager like **PM2** (`pm2 start dist/index.js`)
-   Ensure PostgreSQL is backed up regularly.
