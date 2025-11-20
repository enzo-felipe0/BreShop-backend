import { Router } from 'express';
import cartController from '../controllers/cartController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/checkout', authMiddleware, cartController.checkout);

export default router;
