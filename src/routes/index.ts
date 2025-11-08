import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
