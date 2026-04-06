# Why Am I Single? - Self-Reflection App

A supportive, non-judgmental web application to help users explore their dating patterns.

## Project Structure

- **src/data/questions.ts**: Contains the questionnaire logic and categories.
- **src/utils/engine.ts**: Scoring logic to generate insights.
- **src/components/**: React components for each screen.
- **src/App.tsx**: Main state manager.

## How to Run

1. Copy `.env.example` to `.env` in the root (VITE_DEEPSEEK_API_KEY)
2. Copy `server/.env.example` to `server/.env` (DEEPSEEK_API_KEY)
3. Fill in both API keys (same DeepSeek key in both files)
4. `npm install` in root
5. `npm install` in `server/`
6. `npm run dev:all` from root to start both servers
7. Open http://localhost:5173

### Why two servers?
The frontend proxies `/api/*` to the backend so the DeepSeek API key stays server-side.

## Troubleshooting

If you see errors about "node is not recognized", please ensure Node.js is installed and added to your system PATH. You may need to restart your computer after installing Node.js.
