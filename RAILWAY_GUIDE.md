# 🛤️ Railway Deployment Guide

This guide will help you deploy the **CSA Portal Backend** to [Railway.app](https://railway.app/).

## Prerequisites
- A GitHub account.
- A Railway account (Login with GitHub).
- The project code pushed to your GitHub repository.

## Step 1: Create a Project
1.  Go to the [Railway Dashboard](https://railway.app/dashboard).
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select your repository (`csa-portal-iua`).
4.  Click **"Deploy Now"** (It might fail initially because variables are missing, don't worry).

## Step 2: Configure the Backend Service
1.  Click on the card for your repo in the Railway canvas.
2.  Go to **Settings** -> **General**.
3.  Scroll down to **"Root Directory"**.
4.  Change it to: `/server` (This is crucial!).
5.  Railway will re-deploy. It might still fail due to missing database.

## Step 3: Add a Database
1.  In the project canvas, right-click on empty space or click **"New"**.
2.  Select **Database** -> **Add PostgreSQL**.
3.  Railway will spin up a PostgreSQL database for you.

## Step 4: Connect Backend to Database
1.  Click on the **PostgreSQL** card.
2.  Go to the **Variables** tab.
3.  Copy the `DATABASE_URL` (it looks like `postgresql://postgres:...`).
4.  Go back to your **Backend Service** card (the repo one).
5.  Go to the **Variables** tab.
6.  Click **"New Variable"** and add:
    -   Key: `DATABASE_URL`
    -   Value: (Paste the URL you copied)
7.  Add another variable for security:
    -   Key: `JWT_SECRET`
    -   Value: (Type a long random string, e.g., `mySuperSecretKey123!`)
8.  Add Port Variable (Optional, Railway sets PORT automatically, but good to be safe):
    -   Key: `PORT`
    -   Value: `3000`

## Step 5: Final Deploy
1.  Once variables are saved, Railway will automatically trigger a new deployment.
2.  Watch the **Deployments** tab logs.
3.  You should see:
    -   `Installing dependencies...`
    -   `Running build...`
    -   `Prisma Migrations...` (This runs our `npm start` script)
    -   `Server running on port...`

## Step 6: Get Public URL
1.  Go to the **Settings** tab of your Backend Service.
2.  Under **"Networking"**, look for "Public Networking".
3.  Click **"Generate Domain"**.
4.  You will get a URL like `csa-portal-production.up.railway.app`.
5.  **Copy this URL**.

## Step 7: Connect Frontend (Local or Deployed)
1.  **For Local Development**:
    -   Open `.env.local` in your project root.
    -   Change `VITE_API_URL` to your new Railway URL:
        ```bash
        VITE_API_URL=https://csa-portal-production.up.railway.app/api
        ```
    -   Run `npm run dev` and test Login!

2.  **For Production Frontend**:
    -   Deploy the frontend (root directory) as a separate service (on Vercel, Netlify, or Railway Static Site).
    -   Set the `VITE_API_URL` environment variable for the frontend to point to the backend.
