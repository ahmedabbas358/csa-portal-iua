# 🚀 Deployment Guide

This project is configured for **Railway** (or any Node.js hosting).

## ✅ Automatic Deployment

1.  **Push to GitHub**:
    ```bash
    git add .
    git commit -m "deploy: update"
    git push
    ```
2.  **Railway**:
    - Connect your GitHub repo.
    - Railway will automatically detect `package.json`.
    - It will run `npm install`, `npm run build`, and `npm start`.

## 🛠 Manual Setup (If needed)

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
    - `DATABASE_URL`: Your Prisma connection string.
    - `SESSION_SECRET`: A random string for security.
