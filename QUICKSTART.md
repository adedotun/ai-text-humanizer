# Quick Start Guide

## Getting Started

1. **Navigate to the project directory:**
   ```bash
   cd ai-text-humanizer
   ```

2. **Install all dependencies:**
   ```bash
   npm run install-all
   ```
   
   This will install dependencies for:
   - Root project (concurrently for running both servers)
   - Server (Express backend)
   - Client (React frontend)

3. **Set up Hugging Face API (Optional but Recommended for Better Results):**
   
   The app works without an API key, but using Hugging Face API provides much better humanization results and is **free forever**!
   
   a. Create a free account at https://huggingface.co/join
   
   b. Get your API token:
      - Go to https://huggingface.co/settings/tokens
      - Click "New token"
      - Name it (e.g., "ai-text-humanizer")
      - Select "Read" permissions
      - Copy the token
   
   c. Create a `.env` file in the `server` directory:
      ```bash
      cd server
      touch .env
      ```
   
   d. Add your token to the `.env` file:
      ```env
      PORT=5000
      HUGGINGFACE_API_KEY=your_token_here
      ```
   
   Replace `your_token_here` with your actual token from step 3b.

4. **Start the development servers:**
   ```bash
   npm run dev
   ```
   
   This will start both the backend server (port 5000) and frontend (port 3000) simultaneously.

4. **Open your browser:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Alternative: Run Servers Separately

If you prefer to run them in separate terminals:

**Terminal 1 (Backend):**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client
npm install
npm start
```

## Testing the Application

1. Open http://localhost:3000 in your browser
2. Try the "Detect AI" tab with sample text like:
   ```
   Furthermore, it is important to note that artificial intelligence 
   has revolutionized numerous industries. Additionally, machine 
   learning algorithms facilitate data processing. In conclusion, 
   these technologies demonstrate significant potential.
   ```
3. Switch to "Humanize" tab to see how the text gets transformed
4. Use "Full Process" to detect and humanize in one step

## Features to Try

- **AI Detection**: See how the system identifies AI patterns
- **Humanization**: Watch formal text become more natural
- **Intensity Levels**: Try low, medium, and high intensity settings
- **Side-by-side Comparison**: View original vs humanized text

Enjoy using the AI Text Humanizer!

