import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import formRoutes from './routes/forms.js';
import billingRoutes from './routes/billing.js';
import serviceRoutes from './routes/services.js';
import clinicRoutes from './routes/clinics.js';
import invoiceRoutes from './routes/invoices.js';
import notificationRoutes from './routes/notifications.js';
import settingsRoutes from './routes/settings.js';
import { validateEnv } from './utils/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { writeLimiter } from './middleware/rateLimiter.js';
const env = validateEnv();

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(requestLogger);
const allowedOrigins = env.NODE_ENV === 'development'
  ? [env.FRONTEND_URL, 'http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001']
  : [env.FRONTEND_URL];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
app.use('/api/services', serviceRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', storageAdapter: env.STORAGE_ADAPTER });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode using ${env.STORAGE_ADAPTER} adapter`);
});
