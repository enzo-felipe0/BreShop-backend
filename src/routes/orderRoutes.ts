import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getMyOrders, getMySales } from '../controllers/orderController';

const router = Router();

router.get('/minhas-compras', authMiddleware, getMyOrders);
router.get('/minhas-vendas', authMiddleware, getMySales);

export default router;
