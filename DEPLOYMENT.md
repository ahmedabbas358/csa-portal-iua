# Deployment Guide (CSA Portal)

This guide explains how to deploy the **CSA Portal** to a production server (VPS, Cloud, or Local Server).

## 🚀 Quickest Method: Docker (Recommended)

This method ensures the environment is exactly as developed.

1.  **Install Docker** on your server.
2.  **Copy these files** to your server:
    -   `Dockerfile`
    -   `docker-compose.yml`
    -   `.dockerignore`
    -   `package.json`
    -   `server/prisma/schema.prisma`
    -   (Or just clone the whole repo)
3.  **Run**:
    ```bash
    docker-compose up -d --build
    ```
4.  **Access**: `http://YOUR_SERVER_IP:3000`

### 💾 Persistent Data
-   Database is stored in `./csa_data` folder on the host.
-   Uploaded images are stored in `./csa_uploads` folder on the host.
-   **BACKUP THESE FOLDERS REGULARLY.**

---

## 🛠 Manual Method (Node.js + PM2)

If you cannot use Docker:

1.  **Install Node.js 20+**.
2.  **Clone code** and install dependencies:
    ```bash
    npm install
    ```
3.  **Build Frontend**:
    ```bash
    npm run build
    ```
4.  **Setup Database**:
    ```bash
    npx prisma generate --schema=server/prisma/schema.prisma
    npx prisma db push --schema=server/prisma/schema.prisma
    ```
5.  **Start Server** (using `pm2` for reliability):
    ```bash
    npm install -g pm2
    pm2 start npm --name "csa-portal" -- start
    ```
6.  **Nginx (Optional)**: Setup Nginx as a reverse proxy for port 3001.

---

## 📊 Capacity Planning

-   **Database**: SQLite (High Performance File DB).
-   **Concurrent Users**: ~500-2000 daily active users comfortably on a standard VPS (2 vCPU, 4GB RAM).
-   **Image Storage**: Stores images on disk. Ensure your server has enough disk space.

## ⚠️ Important Production Notes

1.  **Environment Variables**: Update `JWT_SECRET` in `docker-compose.yml` or `.env`.
2.  **HTTPS**: Use Nginx + Certbot or Cloudflare to secure your domain with HTTPS.
3.  **Backups**: Copy the `csa_data/dev.db` file and `csa_uploads/` folder to a safe location weekly.
