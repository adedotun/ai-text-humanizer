# AI Text Humanizer

A powerful web application that detects AI-generated content and helps humanize it to make it more natural and avoid plagiarism detection.

## Features

- **AI Detection**: Analyzes text using pattern recognition and heuristics to detect AI-generated content
- **Text Humanization**: Transforms formal, AI-like text into more natural, human-sounding content
- **Plagiarism Avoidance**: Helps make text unique while maintaining meaning
- **Intensity Control**: Choose between low, medium, and high humanization intensity
- **Real-time Analysis**: Get instant feedback on AI detection scores and recommendations

## Tech Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Node.js with Express
- **AI Detection**: Custom heuristics and pattern analysis
- **Text Processing**: Hugging Face Inference API (free forever) + Advanced paraphrasing and synonym replacement

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-text-humanizer
```

2. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Running the Application

### Development Mode

Run both server and client concurrently:
```bash
npm run dev
```

Or run them separately:

**Terminal 1 - Server:**
```bash
npm run server
```

**Terminal 2 - Client:**
```bash
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Usage

1. **Detect AI**: Paste your text and click "Detect AI Content" to see if it's likely AI-generated
2. **Humanize**: Paste your text, select intensity level, and click "Humanize Text" to make it more natural
3. **Full Process**: Use "Detect & Humanize" to both detect AI and automatically humanize if needed

## API Endpoints

### POST `/api/detect-ai`
Detects AI-generated content in text.

**Request:**
```json
{
  "text": "Your text here"
}
```

**Response:**
```json
{
  "aiScore": 0.75,
  "isLikelyAI": true,
  "confidence": 0.5,
  "analysis": {
    "reasons": ["High use of formal transition phrases"],
    "recommendation": "Consider humanizing this text"
  }
}
```

### POST `/api/humanize`
Humanizes text to make it more natural.

**Request:**
```json
{
  "text": "Your text here",
  "intensity": "medium"
}
```

**Response:**
```json
{
  "original": "Original text",
  "humanized": "Humanized text",
  "changes": {
    "wordCountChange": 5,
    "sentenceCountChange": 1,
    "percentageChanged": "10.5"
  }
}
```

### POST `/api/process`
Combines detection and humanization.

**Request:**
```json
{
  "text": "Your text here",
  "intensity": "medium",
  "forceHumanize": true
}
```

## Configuration

Create a `.env` file in the `server` directory:

```env
PORT=5000

# Hugging Face API Configuration (Optional but Recommended)
# Get your free API token at: https://huggingface.co/settings/tokens
# The free tier includes generous rate limits and is free forever
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### Setting Up Hugging Face API (Free Forever)

1. **Create a Hugging Face account** (if you don't have one):
   - Go to https://huggingface.co/join
   - Sign up for a free account

2. **Get your API token**:
   - Go to https://huggingface.co/settings/tokens
   - Click "New token"
   - Give it a name (e.g., "ai-text-humanizer")
   - Select "Read" permissions
   - Copy the token

3. **Add the token to your `.env` file**:
   - Create a `.env` file in the `server` directory
   - Add `HUGGINGFACE_API_KEY=your_token_here`
   - Replace `your_token_here` with your actual token

**Note**: The app works without the API key using custom humanization logic, but the Hugging Face API provides better results. The free tier is generous and never expires!

## How It Works

### AI Detection
The system uses multiple heuristics:
- Pattern recognition for common AI phrases
- Sentence structure analysis
- Word frequency analysis
- Personal voice detection

### Text Humanization
The humanization process uses **Hugging Face Inference API** (free forever) when an API key is provided, with automatic fallback to custom logic:

**With Hugging Face API** (recommended):
- Uses advanced AI models for natural paraphrasing
- Processes text in intelligent batches
- Respects rate limits automatically
- Provides high-quality, natural-sounding results

**Fallback Custom Logic**:
- Replaces formal phrases with casual alternatives
- Varies sentence lengths
- Adds personal voice elements
- Replaces formal words with simpler synonyms
- Adjusts structure for natural flow

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

