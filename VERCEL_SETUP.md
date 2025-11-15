# Quick Vercel Deployment Steps

## 1. Deploy Frontend to Vercel

1. Go to https://vercel.com and sign in (or sign up with GitHub)
2. Click **"Add New..."** → **"Project"**
3. Import your repository: `adedotun/ai-text-humanizer`
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `client` (click "Edit" and set to `client`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`
5. **Environment Variables** (click "Environment Variables"):
   - Add: `REACT_APP_API_URL` = `https://your-backend-url.railway.app`
     - ⚠️ You'll need to deploy the backend first (see Step 2), then come back and update this
6. Click **"Deploy"**

## 2. Deploy Backend to Railway

1. Go to https://railway.app and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `ai-text-humanizer` repository
4. Railway will detect it's a Node.js project
5. **Configure**:
   - Click on the service → **Settings**
   - **Root Directory**: Set to `server`
   - **Start Command**: `npm start`
6. **Environment Variables** (in Railway dashboard):
   - Click **"Variables"** tab
   - Add: `HUGGINGFACE_API_KEY` = `your_huggingface_api_key`
   - Add: `NODE_ENV` = `production`
   - `PORT` is auto-set by Railway
7. **Get your backend URL**:
   - Click **"Settings"** → **"Generate Domain"**
   - Copy the URL (e.g., `https://ai-text-humanizer-production.up.railway.app`)
8. **Update Vercel**:
   - Go back to Vercel dashboard
   - Your project → **Settings** → **Environment Variables**
   - Update `REACT_APP_API_URL` with your Railway URL
   - Click **"Redeploy"** to apply changes

## 3. Verify Deployment

1. Visit your Vercel URL (e.g., `https://ai-text-humanizer.vercel.app`)
2. Test the application:
   - Try detecting AI text
   - Try humanizing text
   - Check that API calls work

## Troubleshooting

- **CORS errors**: Backend CORS is configured to allow all origins in production
- **API not found**: Make sure `REACT_APP_API_URL` is set correctly in Vercel
- **Backend not responding**: Check Railway logs for errors
- **Build fails**: Check that all dependencies are in package.json files

## Your Repository

✅ Code is pushed to: `https://github.com/adedotun/ai-text-humanizer`

