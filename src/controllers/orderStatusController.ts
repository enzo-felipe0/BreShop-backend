import { Request, Response } from 'express';
import prisma from '../config/database';
import orderStatusSimulator from '../services/orderStatusSimulator';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userType?: string;
}

class OrderController {
  /**
   * Comprador: listar todos os seus pedidos com status
   */
  async getMyOrders(req: Request, res: Response): Promise<Response> {
    try {
      const authReq = req as AuthenticatedRequest;
      const compradorId = authReq.userId;

      if (!compradorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const orders = await prisma.order.findMany({
        where: { compradorId },
        include: {
          items: {
            include: {
              product: {
                include: { 
                  fotos: true,
                  vendedor: {
                    select: {
                      nome: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Adicionar informação de tempo estimado para próximo status
      const ordersWithEstimate = orders.map(order => {
        let estimatedNextUpdate = null;
        
        if (order.status !== 'ENTREGUE' && order.status !== 'CANCELADO') {
          const nextUpdateTime = new Date(order.statusUpdatedAt);
          nextUpdateTime.setHours(nextUpdateTime.getHours() + 2);
          estimatedNextUpdate = nextUpdateTime.toISOString();
        }

        return {
          ...order,
          estimatedNextUpdate
        };
      });

      return res.status(200).json(ordersWithEstimate);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Comprador: ver detalhes de um pedido específico
   */
  async getOrderById(req: Request, res: Response): Promise<Response> {
    try {
      const { orderId } = req.params;
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: {
                include: { 
                  fotos: true, 
                  vendedor: {
                    select: {
                      id: true,
                      nome: true,
                      email: true
                    }
                  }
                }
              }
            }
          },
          comprador: {
            select: {
              id: true,
              nome: true,
              email: true
            }
          }
        }
      });

      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      if (order.compradorId !== userId) {
        return res.status(403).json({ error: 'Você não tem permissão para ver este pedido' });
      }

      // Calcular tempo estimado para próxima atualização
      let estimatedNextUpdate = null;
      if (order.status !== 'ENTREGUE' && order.status !== 'CANCELADO') {
        const nextUpdateTime = new Date(order.statusUpdatedAt);
        nextUpdateTime.setHours(nextUpdateTime.getHours() + 2);
        estimatedNextUpdate = nextUpdateTime.toISOString();
      }

      return res.status(200).json({
        ...order,
        estimatedNextUpdate
      });
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Vendedor: buscar pedidos que contenham seus produtos
   */
  async getMySales(req: Request, res: Response): Promise<Response> {
    try {
      const authReq = req as AuthenticatedRequest;
      const vendedorId = authReq.userId;

      if (!vendedorId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const orderItems = await prisma.orderItem.findMany({
        where: {
          product: { vendedorId }
        },
        include: {
          order: {
            include: { 
              comprador: {
                select: {
                  nome: true,
                  email: true
                }
              }
            }
          },
          product: {
            include: { fotos: true }
          }
        }
      });

      // Agrupar por pedido
      const salesByOrder = orderItems.reduce((acc: any, item) => {
        const orderId = item.orderId;
        if (!acc[orderId]) {
          acc[orderId] = { order: item.order, items: [] };
        }
        acc[orderId].items.push(item);
        return acc;
      }, {});

      return res.json(Object.values(salesByOrder));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * [DESENVOLVIMENTO] Forçar atualização de status para testes
   */
  async forceUpdateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const { orderId } = req.params;
      const result = await orderStatusSimulator.forceUpdateOrder(orderId);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * [DESENVOLVIMENTO] Ver informações do simulador
   */
  async getSimulatorInfo(req: Request, res: Response): Promise<Response> {
    const info = orderStatusSimulator.getInfo();
    return res.status(200).json(info);
  }
}

export default new OrderController();
