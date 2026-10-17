import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'aws-finos-api',
    timestamp: new Date().toISOString()
  });
});

// Mount FinOps API
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`[aws-finos-api] running on http://localhost:${PORT}`);
});
