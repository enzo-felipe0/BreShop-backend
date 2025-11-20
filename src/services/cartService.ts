import prisma from '../config/database';

interface AddToCartInput {
  compradorId: string;
  productId: string;
  quantidade: number;
}

class CartService {
  async checkout(compradorId: string, cartItems: { productId: string; quantidade: number }[]) {
    // Iniciar transação
    return prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      for (const item of cartItems) {
        // Buscar produto e travar para escrita
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Produto com ID ${item.productId} não encontrado`);
        }

        if (product.quantidade < item.quantidade) {
          throw new Error(`Estoque insuficiente para ${product.nome}`);
        }

        // Atualizar estoque
        await tx.product.update({
          where: { id: item.productId },
          data: { quantidade: { decrement: item.quantidade } },
        });

        total += product.preco * item.quantidade;
        orderItemsData.push({
          productId: item.productId,
          quantidade: item.quantidade,
          preco: product.preco,
        });
      }

      // Criar pedido
      const order = await tx.order.create({
        data: {
          compradorId,
          total,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      return order;
    });
  }
}

export default new CartService();
