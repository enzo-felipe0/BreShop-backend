import prisma from '../config/database';

interface CreateProductInput {
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  vendedorId: string;
  fotos: string[];
}

class ProductService {
  async create(data: CreateProductInput) {
    const product = await prisma.product.create({
      data: {
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        quantidade: data.quantidade,
        vendedorId: data.vendedorId,
        fotos: {
          create: data.fotos.map(url => ({ url })),
        },
      },
      include: {
        fotos: true,
        vendedor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });

    return product;
  }

  async findAll() {
    return await prisma.product.findMany({
      include: {
        fotos: true,
        vendedor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        fotos: true,
        vendedor: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
      },
    });
  }

  async findByVendedor(vendedorId: string) {
    return await prisma.product.findMany({
      where: { vendedorId },
      include: {
        fotos: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

export default new ProductService();
