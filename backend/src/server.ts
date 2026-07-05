import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import formRoutes from './routes/forms.js';
import billingRoutes from './routes/billing.js';
import { validateEnv } from './utils/env.js';
import { errorHandler } from './middleware/errorHandler.js';
const env = validateEnv();

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '1mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/billing', billingRoutes);

<<<<<<< HEAD
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', mode: env.STORAGE_MODE, timestamp: new Date().toISOString() });
});

app.get('/api/ready', (_req, res) => {
  res.json({ status: 'ready', mode: env.STORAGE_MODE });
=======
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storageAdapter: env.STORAGE_ADAPTER });
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3
});

app.use(errorHandler);

app.listen(PORT, () => {
<<<<<<< HEAD
  console.log(`DentProSuite backend running on port ${PORT} in ${env.NODE_ENV} mode [storage: ${env.STORAGE_MODE}]`);
=======
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode using ${env.STORAGE_ADAPTER} adapter`);
>>>>>>> 0a3d8169160c949370332006f3066950243c45c3
});
