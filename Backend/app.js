import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import sectorHeadRoutes from './routes/sectorHead.js';
import citizenRoutes from './routes/citizenRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import cors from 'cors';


dotenv.config();
connectDB();
const app = express();
app.use(express.json());
const allowedOrigins = [
  "http://localhost:5173",
  "https://civicconnect-nfew.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked: " + origin));
    }
  },
  credentials: true,
}));

app.options("*", cors());
app.use('/api/auth', authRoutes);
app.use('/api/sector-head', sectorHeadRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/feedback', feedbackRoutes);
// app.use('/api/issues', adminRoutes);
export default app;
