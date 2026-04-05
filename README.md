# Why Am I Single? - Self-Reflection App

A supportive, non-judgmental web application to help users explore their dating patterns.

## Project Structure

- **src/data/questions.ts**: Contains the questionnaire logic and categories.
- **src/utils/engine.ts**: Scoring logic to generate insights.
- **src/components/**: React components for each screen.
- **src/App.tsx**: Main state manager.

## How to Run

Since this project uses React + Vite, you need Node.js installed.

1.  Open your terminal in this folder: `WhyAmISingle`
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open the local URL (usually `http://localhost:5173`) in your browser.

## Troubleshooting

If you see errors about "node is not recognized", please ensure Node.js is installed and added to your system PATH. You may need to restart your computer after installing Node.js.
