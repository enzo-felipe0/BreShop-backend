import { Request, Response } from 'express';
import cartService from '../services/cartService';
import { OrderNotificationService } from '../services/orderNotificationService';
import prisma from '../config/database';

// Instancia o serviço de notificações
const notificationService = new OrderNotificationService(prisma);

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

      // Finaliza a compra
      const order = await cartService.checkout(compradorId, items);

      // ✅ BUSCA DADOS COMPLETOS DO PEDIDO PARA ENVIAR EMAIL
      const orderWithDetails = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: {
                include: { vendedor: true }
              }
            }
          },
          comprador: true
        }
      });

      if (!orderWithDetails) {
        console.error('❌ Pedido criado mas não encontrado para envio de email');
        return res.status(201).json({ 
          message: 'Compra finalizada com sucesso!', 
          order 
        });
      }

      // ✅ PREPARA DADOS DOS ITENS PARA O EMAIL
      const emailItems = orderWithDetails.items.map(item => ({
        nome: item.product.nome,
        quantidade: item.quantidade,
        preco: item.preco
      }));

      // ✅ AGRUPA ITENS POR VENDEDOR
      const itemsByVendor = orderWithDetails.items.reduce((acc: any, item) => {
        const vendedorId = item.product.vendedorId;
        
        if (!acc[vendedorId]) {
          acc[vendedorId] = {
            vendedor: item.product.vendedor,
            items: [],
            total: 0
          };
        }
        
        const itemTotal = item.preco * item.quantidade;
        acc[vendedorId].items.push({
          nome: item.product.nome,
          quantidade: item.quantidade,
          preco: item.preco
        });
        acc[vendedorId].total += itemTotal;
        return acc;
      }, {});

      // ✅ ENVIA EMAIL PARA O COMPRADOR (com todos os itens)
      try {
        await notificationService.sendOrderNotifications({
          orderId: orderWithDetails.id,
          buyerId: compradorId,
          sellerId: orderWithDetails.items[0].product.vendedorId,
          total: orderWithDetails.total,
          items: emailItems
        });

        console.log(`✅ Email de compra enviado para ${orderWithDetails.comprador.email}`);
      } catch (emailError) {
        console.error('❌ Erro ao enviar email para comprador:', emailError);
        // Não falha a requisição se o email falhar
      }

      // ✅ ENVIA EMAIL PARA CADA VENDEDOR ENVOLVIDO
      for (const vendedorId in itemsByVendor) {
        const vendorData = itemsByVendor[vendedorId];
        
        try {
          await notificationService.sendOrderNotifications({
            orderId: orderWithDetails.id,
            buyerId: compradorId,
            sellerId: vendedorId,
            total: vendorData.total,
            items: vendorData.items
          });

          console.log(`✅ Email de venda enviado para ${vendorData.vendedor.email}`);
        } catch (emailError) {
          console.error(`❌ Erro ao enviar email para vendedor ${vendedorId}:`, emailError);
          // Não falha a requisição se o email falhar
        }
      }

      return res.status(201).json({ 
        message: 'Compra finalizada com sucesso! Notificações enviadas por email.', 
        order: orderWithDetails
      });

    } catch (error: any) {
      console.error('Erro ao finalizar compra:', error);

      // Tratar erro de estoque insuficiente
      if (error.message && error.message.includes('Estoque insuficiente')) {
        return res.status(409).json({ error: error.message });
      }

      // Tratar erro de produto não encontrado
      if (error.message && error.message.includes('não encontrado')) {
        return res.status(404).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new CartController();
