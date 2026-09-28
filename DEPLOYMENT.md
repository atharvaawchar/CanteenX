# CanteenX — Production Deployment Guide 🚀

This guide provides step-by-step instructions for deploying CanteenX to popular free-tier cloud platforms, Docker containers, or a Linux VPS.

---

## 📋 Deployment Options Overview

| Platform | Difficulty | Database Storage | Cost | Best For |
| :--- | :--- | :--- | :--- | :--- |
| **Option A: Render.com (Recommended)** | ⭐ (Easiest) | Persistent Disk / SQLite | Free Tier | Single service full-stack app |
| **Option B: Docker Compose** | ⭐⭐ | Volume Mounted SQLite | Local / VPS | AWS / DigitalOcean VPS |
| **Option C: Vercel (Frontend) + Render (Backend)** | ⭐⭐ | Render SQLite | Free Tier | Decoupled architecture |
| **Option D: Railway / Fly.io** | ⭐⭐ | Persistent Volume | Free Tier / Pay per use | High-performance Node.js |

---

## 🎯 Option A: Deploy to Render.com (Easiest 1-Click Free Hosting)

Render supports deploying Express apps with persistent disks.

### Steps:
1. Push your project repository to GitHub or GitLab.
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your GitHub repository containing `render.yaml`.
5. Render will automatically detect the blueprint and set up:
   - Build Command: `npm run setup && npm run build`
   - Start Command: `npm run seed && npm start`
6. Click **Apply**. Render will build and launch CanteenX at `https://canteenx.onrender.com`.

---

## 🐳 Option B: Deploy with Docker (AWS / DigitalOcean / VPS)

For a self-hosted cloud server or Linux VPS:

### Prerequisites:
- Docker and Docker Compose installed on your server.

### Steps:
1. Clone the repository to your server:
   ```bash
   git clone https://github.com/your-username/CanteenX.git
   cd CanteenX
   ```

2. Build and launch the container in detached mode:
   ```bash
   docker compose up -d --build
   ```

3. Access your application live at `http://your-server-ip:5000`.

---

## ⚡ Option C: Decoupled Deployment (Vercel Frontend + Render Backend)

### 1. Deploy Backend to Render:
1. Create a **Web Service** on Render.
2. Root Directory: `backend`
3. Build Command: `npm install`
4. Start Command: `npm run seed && npm start`
5. Add Environment Variable:
   - `JWT_SECRET`: `your_random_secret_string`
6. Copy your deployed backend URL (e.g., `https://canteenx-api.onrender.com`).

### 2. Deploy Frontend to Vercel:
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Import your GitHub repository.
3. Select Root Directory as `frontend`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://canteenx-api.onrender.com`
5. Click **Deploy**.

---

## 🛠️ Testing Production Build Locally

You can test the unified production build on your local machine before pushing:

```bash
# 1. Install all dependencies
npm run setup

# 2. Build frontend for production
npm run build

# 3. Seed database & start production server
npm run seed
npm start
```

Visit `http://localhost:5000` in your browser to test the full production bundle!
