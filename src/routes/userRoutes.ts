import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import userController from '../controllers/userController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Obter perfil do usuário autenticado
router.get('/profile', userController.getProfile);

// Atualizar perfil do usuário
router.put('/profile', userController.updateProfile);

// Validar senha atual (útil para confirmação em formulários)
router.post('/validate-password', userController.validatePassword);

export default router;
