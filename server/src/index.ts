import express from 'express';
import cors from 'cors';
import { getDb } from './db';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Save result endpoint
app.post('/api/results', async (req, res) => {
    try {
        const { context, answers, insights } = req.body;
        const db = await getDb();

        await db.run(
            'INSERT INTO results (context, answers, insights) VALUES (?, ?, ?)',
            [JSON.stringify(context), JSON.stringify(answers), JSON.stringify(insights)]
        );

        res.json({ success: true, message: 'Result saved successfully' });
    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ error: 'Failed to save result' });
    }
});

// Simple stats endpoint
app.get('/api/stats', async (req, res) => {
    try {
        const db = await getDb();
        const count = await db.get('SELECT COUNT(*) as count FROM results');
        res.json(count);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
