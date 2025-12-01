import { PrismaClient } from '@prisma/client';
import emailService from '../utils/emailService';

interface OrderItem {
  nome: string;
  quantidade: number;
  preco: number;
}

interface SendOrderNotificationsParams {
  orderId: string;
  buyerId: string;
  sellerId: string;
  total: number;
  items: OrderItem[];
}

export class OrderNotificationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async sendOrderNotifications(params: SendOrderNotificationsParams): Promise<void> {
    try {
      // Busca dados do comprador e vendedor em paralelo
      const [buyer, seller] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: params.buyerId },
          select: { id: true, nome: true, email: true },
        }),
        this.prisma.user.findUnique({
          where: { id: params.sellerId },
          select: { id: true, nome: true, email: true },
        }),
      ]);

      if (!buyer || !seller) {
        throw new Error('Comprador ou vendedor não encontrado');
      }

      // Envia apenas para o comprador (email de compra)
      if (params.buyerId !== params.sellerId) {
        await emailService.sendPurchaseNotification(
          buyer.email,
          buyer.nome,
          params.orderId,
          params.total,
          params.items
        );
      }

      // Envia apenas para o vendedor (email de venda)
      if (params.sellerId && buyer.id !== seller.id) {
        await emailService.sendSaleNotification(
          seller.email,
          seller.nome,
          params.orderId,
          params.total,
          buyer.nome,
          params.items
        );
      }

      console.log(`📧 Notificações enviadas para pedido #${params.orderId}`);
    } catch (error) {
      console.error('❌ Erro ao enviar notificações:', error);
      // Não falha a transação principal, apenas loga o erro
    }
  }
}
