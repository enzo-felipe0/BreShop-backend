import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import orderStatusController from '../controllers/orderStatusController';

const router = Router();

// Rotas do Comprador
router.get('/minhas-compras', authMiddleware, orderStatusController.getMyOrders);
router.get('/:orderId', authMiddleware, orderStatusController.getOrderById);

// Rotas do Vendedor
router.get('/minhas-vendas', authMiddleware, orderStatusController.getMySales);

// [APENAS DESENVOLVIMENTO] Rotas de teste
if (process.env.NODE_ENV === 'development') {
  router.post('/:orderId/force-update', orderStatusController.forceUpdateStatus);
  router.get('/simulator/info', orderStatusController.getSimulatorInfo);
}

export default router;
