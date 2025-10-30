# AI Investment Analyst

**Google Chrome Built-in AI Challenge 2025 Entry**

An AI-powered workspace for investment analysts that transforms hours of manual research into minutes using Chrome's built-in AI APIs.

## Overview

This application transforms fragmented equity research workflows into structured insight using Chrome's built-in AI APIs. Analysts waste hours digging through scattered documents—this turns it into structured insight with an AI workspace built for research.

## The Problem

Research is fragmented across 30+ disconnected notes, emails, and models. Analysts waste hours rebuilding understanding every time they revisit a company. It feels chaotic and unscalable—knowledge gets lost, context is rebuilt from scratch, and conviction weakens over time.

## The Solution

This application provides:
- **Structured Workspace**: Every company gets its own research environment
- **AI-Powered Analysis**: Generate bull/bear cases, meeting prep, earnings analysis
- **Document Processing**: Upload SEC filings, earnings transcripts for instant insights
- **Privacy-First**: All processing happens locally using Chrome AI APIs
- **Export Integration**: Copy structured outputs to Google Docs, Notion, Slack

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Chrome AI APIs**: Writer, Summarizer, Proofreader, Rewriter
- **Storage**: Local browser storage (MVP)

## Chrome AI Integration

**APIs Used**:
- **Writer API**: Generate structured investment analysis outputs
- **Summarizer API**: Process lengthy SEC filings and earnings transcripts
- **Proofreader API**: Polish content for professional standards
- **Rewriter API**: Refine and improve content directly within the editor

**Privacy-First Architecture**: All sensitive financial data is processed locally using Chrome's built-in AI, ensuring no external API calls or data transmission.

**Technical Implementation**:
- Intelligent document chunking for large files (>20KB)
- Real-time progress tracking across all operations
- Comprehensive error handling and availability checking
- Client-side processing only—no server required

## Getting Started

### Prerequisites
- Chrome browser with AI enabled (version 127+)
- Node.js 18+
- npm 9+

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/ai-investment-analyst-chrome-ai-hackathon.git
cd ai-investment-analyst-chrome-ai-hackathon

# Install dependencies
npm install

# Set up environment variables (optional - app works without them using mock data)


cp env.local.example .env.local
# The app works without FINNHUB_API_KEY (uses mock data for popular stocks: AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META)
# For full access, add your FINNHUB_API_KEY (get a free key from https://finnhub.io/register)
# For localhost testing, NEXT_PUBLIC_CHROME_AI_TOKEN can be left empty (default token included)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Chrome AI Setup

**For localhost (development/testing):**
1. Enable Chrome AI: Go to `chrome://flags/#optimization-guide-on-device-model` and set to "Enabled"
2. Enable all API flags (set each to "Enabled"):
   - `chrome://flags/#writer-api-for-gemini-nano`
   - `chrome://flags/#summarization-api-for-gemini-nano`
   - `chrome://flags/#proofreader-api-for-gemini-nano`
   - `chrome://flags/#rewriter-api-for-gemini-nano`
3. Restart Chrome
4. Verify AI availability in the app's status indicator (top-right corner)

**Note**: You'll need approximately 22GB free disk space for Chrome AI models to download. The first-time setup may take a few minutes as models download. APIs are available on localhost in Chrome after enabling these flags.

**For production (origin trial required):**
Writer and Rewriter APIs are in a joint origin trial and require registration:
1. Visit the [Rewriter API origin trial page](https://developer.chrome.com/docs/ai/rewriter-api) and follow the registration instructions
2. Acknowledge Google's Generative AI Prohibited Uses Policy
3. Register your origin (or extension ID for Chrome Extensions) 
4. Copy the origin trial token provided
5. Add the token to your `.env.local` file as `NEXT_PUBLIC_CHROME_AI_TOKEN=your_token_here`
6. The token is automatically included in the app via `<meta httpEquiv="origin-trial">` tag (see `src/app/layout.tsx`)

**Note**: The app includes a default token for localhost testing. For production, replace it with your registered origin trial token.

**Note**: Summarizer and Proofreader APIs are available in Chrome stable (no origin trial needed). For localhost testing, enabling the flag is sufficient—no token required.

## Testing Instructions for Judges

1. **Prerequisites**:
   - Chrome browser version 127+ with AI enabled
   - Approximately 20GB free disk space for model downloads
   - Node.js 18+ and npm 9+

2. **Setup**:
   ```bash
   npm install
   cp env.local.example .env.local
   # FINNHUB_API_KEY is optional - app works with mock data (supports: AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META)
   # For full access, add your FINNHUB_API_KEY (free at https://finnhub.io/register)
   npm run dev
   ```

3. **Enable Chrome AI** (for localhost):
   - Go to `chrome://flags/#optimization-guide-on-device-model` and set to "Enabled"
   - Enable all API flags (set each to "Enabled"):
     - `chrome://flags/#writer-api-for-gemini-nano`
     - `chrome://flags/#summarization-api-for-gemini-nano`
     - `chrome://flags/#proofreader-api-for-gemini-nano`
     - `chrome://flags/#rewriter-api-for-gemini-nano`
   - Restart Chrome
   - Verify AI availability in app status indicator (top-right)
   - **Note**: For localhost testing, no origin trial token is needed—just enable the flags. For production, you'll need to register for the origin trial.

4. **Test Core Features**:
   - Search for "TSLA" or "AAPL"
   - Click "Bull & Bear Case" analysis (takes 30-60 seconds)
   - Upload a sample earnings transcript PDF
   - Verify all processing happens locally (check Network tab—no external API calls)

5. **Verify Chrome AI Integration**:
   - Check browser console for Chrome AI API calls
   - Verify status indicator shows "Available"
   - Confirm no external API calls to cloud services
   - All processing happens client-side

## Demo

**90-Second Demo Flow**:
1. Search for "TSLA" and add to favourites
2. Click into Tesla workspace
3. Run "Bull & Bear Case" analysis
4. Upload earnings transcript document
5. Export results to Google Docs

## Project Status

- ✅ Next.js application with TypeScript
- ✅ Chrome AI API integration complete
- ✅ Document processing and chunking
- ✅ Real-time progress tracking
- ✅ Professional output formatting
- ✅ Local storage and privacy-first architecture

**Submission Deadline**: November 1, 2025

## Submission Materials

Complete submission package available in `/SUBMISSION` folder:
- Devpost content and demo script
- Screenshots guide and architecture diagrams
- Setup instructions and technical documentation

---

**Built with**: Chrome AI APIs, Next.js, TypeScript, Tailwind CSS, ShadCN UI