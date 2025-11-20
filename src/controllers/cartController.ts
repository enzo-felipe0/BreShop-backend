import { Request, Response } from 'express';
import cartService from '../services/cartService';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userType?: string;
}

interface CartItem {
  productId: string;
  quantidade: number;
}

class CartController {
  async checkout(req: Request, res: Response): Promise<Response> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const compradorId = authenticatedReq.userId;
      const items = req.body.items as CartItem[];

      if (!compradorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }
      
      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Carrinho está vazio' });
      }

      const order = await cartService.checkout(compradorId, items);

      return res.status(201).json({ message: 'Compra finalizada com sucesso!', order });
    } catch (error: any) {
      console.error('Erro ao finalizar compra:', error);
      return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
  }
}

export default new CartController();
