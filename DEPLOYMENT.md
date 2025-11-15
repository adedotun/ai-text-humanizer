# Deployment Guide

This guide explains how to deploy the AI Text Humanizer application.

## Architecture

The application consists of two parts:
1. **Frontend**: React app (deployed to Vercel)
2. **Backend**: Express.js API server (deployed to Railway/Render)

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

### Steps

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin master
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Other
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `build`
     - **Install Command**: `npm install`

3. **Set Environment Variables in Vercel**:
   - Go to Project Settings → Environment Variables
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.railway.app` (or your backend URL)

4. **Deploy**: Click "Deploy"

## Backend Deployment (Railway)

### Option 1: Railway (Recommended)

1. **Sign up**: Go to https://railway.app
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose your `ai-text-humanizer` repository
4. **Configure**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - Add `PORT` (Railway will auto-assign, but you can set it)
   - Add `HUGGINGFACE_API_KEY` (your Hugging Face API key)
6. **Deploy**: Railway will automatically deploy
7. **Get URL**: Copy the generated URL (e.g., `https://your-app.railway.app`)
8. **Update Frontend**: Update `REACT_APP_API_URL` in Vercel with this URL

### Option 2: Render

1. **Sign up**: Go to https://render.com
2. **New Web Service**: Click "New" → "Web Service"
3. **Connect Repository**: Link your GitHub repository
4. **Configure**:
   - **Name**: `ai-text-humanizer-api`
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `PORT`: `10000` (or leave default)
   - `HUGGINGFACE_API_KEY`: Your Hugging Face API key
6. **Deploy**: Click "Create Web Service"
7. **Get URL**: Copy the URL (e.g., `https://ai-text-humanizer-api.onrender.com`)
8. **Update Frontend**: Update `REACT_APP_API_URL` in Vercel

## Environment Variables

### Backend (.env)
```
PORT=5001
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### Frontend (Vercel Environment Variables)
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

## Quick Deploy Commands

### Push to GitHub
```bash
git add .
git commit -m "Prepare for deployment"
git push origin master
```

### After Deployment

1. **Backend URL**: Copy your backend deployment URL
2. **Update Vercel**: Add/update `REACT_APP_API_URL` environment variable
3. **Redeploy Frontend**: Vercel will automatically redeploy when you update env vars

## Troubleshooting

### CORS Issues
- Make sure your backend has CORS enabled (already configured in `server/index.js`)
- Update CORS origin in backend to include your Vercel domain

### API Not Found
- Verify `REACT_APP_API_URL` is set correctly in Vercel
- Check backend logs for errors
- Ensure backend is running and accessible

### Build Failures
- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs in Vercel dashboard

## Notes

- The frontend is a static React app, perfect for Vercel
- The backend is a Node.js Express server, best deployed on Railway or Render
- Environment variables are crucial - make sure they're set correctly
- Free tiers are available on both Vercel and Railway/Render

