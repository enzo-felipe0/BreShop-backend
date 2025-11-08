import { Router } from 'express';
import productController from '../controllers/productController';
import { authMiddleware } from '../middlewares/authMiddleware';
import upload from '../config/multer';

const router = Router();

// Rotas públicas
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Rotas protegidas
router.post(
  '/',
  authMiddleware,
  upload.array('fotos', 5), // máximo 5 fotos
  productController.create
);

router.get('/vendedor/meus-produtos', authMiddleware, productController.getByVendedor);

export default router;
