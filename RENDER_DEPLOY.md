# How to Deploy Backend on Render & Link Vercel Frontend 🚀

Your frontend is live at: **`https://canteen-x-liard.vercel.app`**

Follow these 4 simple steps to deploy your backend on Render and connect your Vercel frontend:

---

## 📍 Step 1: Push Code to GitHub
Make sure all your changes (including backend) are committed and pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure backend for Render & Vercel deployment"
git push origin main
```

---

## 📍 Step 2: Create Web Service on Render.com
1. Open [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your GitHub repo (`CanteenX`).
4. Configure the settings:
   - **Name**: `canteenx-backend` (or any name you prefer)
   - **Region**: Oregon (US) or closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` *(Important!)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run seed && npm start`
   - **Instance Type**: `Free`

5. Click **Create Web Service**.

Render will now build your backend and assign a live URL, for example:  
👉 **`https://canteenx-backend.onrender.com`**

---

## 📍 Step 3: Link Vercel Frontend to Render Backend
Now connect your live Vercel frontend (`https://canteen-x-liard.vercel.app`) to your new Render backend URL:

1. Open [Vercel Dashboard](https://vercel.com) and select your **canteen-x-liard** project.
2. Go to **Settings** → **Environment Variables**.
3. Add a new variable:
   - **Key / Name**: `VITE_API_URL`
   - **Value**: `https://canteenx-backend.onrender.com` *(replace with your actual Render URL from Step 2)*
   - **Environments**: Select *Production*, *Preview*, and *Development*.
4. Click **Save**.
5. Go to **Deployments** tab in Vercel, click the three dots `...` on your latest deployment, and click **Redeploy**.

---

## 📍 Step 4: Verify Deployment! 🎉

1. Open **`https://canteen-x-liard.vercel.app/login`**
2. Click **Demo Student** or **Demo Admin**.
3. Click **Sign In**.
4. You're fully connected and ready to pre-order food!
