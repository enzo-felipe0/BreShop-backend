import prisma from '../config/database';

interface CartItem {
  productId: string;
  quantidade: number;
}

class CartService {
  async checkout(compradorId: string, cartItems: CartItem[]) {
    // Usar transação interativa do Prisma
    return await prisma.$transaction(async (tx) => {
      let total = 0;
      const orderItemsData = [];

      // Iterar sobre cada item do carrinho
      for (const item of cartItems) {
        // 1. Buscar o produto dentro da transação
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        // 2. Validar existência do produto
        if (!product) {
          throw new Error(`Produto com ID ${item.productId} não encontrado`);
        }

        // 3. Verificar estoque disponível
        if (product.quantidade < item.quantidade) {
          throw new Error(
            `Estoque insuficiente para "${product.nome}". ` +
            `Disponível: ${product.quantidade}, Solicitado: ${item.quantidade}`
          );
        }

        // 4. ATUALIZAR ESTOQUE (decrementar quantidade)
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantidade: {
              decrement: item.quantidade, // Subtrai atomicamente
            },
          },
        });

        // 5. Calcular o total e preparar dados do pedido
        total += product.preco * item.quantidade;
        orderItemsData.push({
          productId: item.productId,
          quantidade: item.quantidade,
          preco: product.preco,
        });
      }

      // 6. Criar o pedido completo
      const order = await tx.order.create({
        data: {
          compradorId,
          total,
          status: 'PENDENTE', // Ajuste conforme seu enum OrderStatus
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      return order;
    });
  }
}

export default new CartService();
