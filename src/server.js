import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/db.js';
import employeeRoutes from './routes/employeeRoutes.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


app.get('/api/v1/health', (req, res) => res.json({ status: 'API is running', version: 'v1' }));
app.use('/api/v1/employees', employeeRoutes);


app.use(errorHandler);

// Start server
await initializeDatabase();
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
