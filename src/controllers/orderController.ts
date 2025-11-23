import { Request, Response } from 'express';
import prisma from '../config/database';

// Comprador: histórico de pedidos realizados
export async function getMyOrders(req: Request, res: Response) {
    const { userId } = req as any;
    try {
        const orders = await prisma.order.findMany({
            where: { compradorId: userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: { fotos: true, vendedor: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar histórico de compras.' });
    }
}

// Vendedor: histórico de vendas (pedidos com produtos deste vendedor)
export async function getMySales(req: Request, res: Response) {
    const { userId } = req as any;
    try {
        const orderItems = await prisma.orderItem.findMany({
            where: {
                product: { vendedorId: userId }
            },
            include: {
                order: {
                    include: { comprador: true }
                },
                product: {
                    include: { fotos: true }
                }
            }
        });

        orderItems.sort((a, b) => {
            if (a.order && b.order) {
                return new Date(b.order.createdAt).getTime() - new Date(a.order.createdAt).getTime();
            }
            return 0;
        });

        const salesByOrder = orderItems.reduce((acc: any, item) => {
            const orderId = item.orderId;
            if (!acc[orderId]) {
                acc[orderId] = { order: item.order, items: [] };
            }
            acc[orderId].items.push(item);
            return acc;
        }, {});

        res.json(Object.values(salesByOrder));
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar histórico de vendas.' });
    }
}
