import { Router } from 'express';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import cartRoutes from './cartRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

export default router;
