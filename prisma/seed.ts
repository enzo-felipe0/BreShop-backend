import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários de teste
  const hashedPassword = await bcrypt.hash('senha123', 10);

  const comprador = await prisma.user.upsert({
    where: { email: 'comprador@breshop.com' },
    update: {},
    create: {
      nome: 'João Comprador',
      email: 'comprador@breshop.com',
      senha: hashedPassword,
      tipoUsuario: 'COMPRADOR',
    },
  });

  const vendedor = await prisma.user.upsert({
    where: { email: 'vendedor@breshop.com' },
    update: {},
    create: {
      nome: 'Maria Vendedora',
      email: 'vendedor@breshop.com',
      senha: hashedPassword,
      tipoUsuario: 'VENDEDOR',
    },
  });

  console.log('✅ Usuários criados:', { comprador, vendedor });

  // Criar produtos de exemplo
  const produto1 = await prisma.product.upsert({
    where: { id: 'seed-produto-1' },
    update: {},
    create: {
      id: 'seed-produto-1',
      nome: 'Calça Cargo Masculina',
      descricao: 'Linda calça cargo em ótimo estado de conservação. Perfeita para looks retrô!',
      preco: 49.90,
      quantidade: 4,
      vendedorId: vendedor.id,
      fotos: {
        create: [
          { url: '/uploads/exemplo-calca.jpeg' },
        ],
      },
    },
  });

  const produto2 = await prisma.product.upsert({
    where: { id: 'seed-produto-2' },
    update: {},
    create: {
      id: 'seed-produto-2',
      nome: 'Vestido Comprido',
      descricao: 'Vestido longo de verão, leve e confortável. Tamanho M.',
      preco: 89.90,
      quantidade: 4,
      vendedorId: vendedor.id,
      fotos: {
        create: [
          { url: '/uploads/exemplo-vestido.jpeg' },
        ],
      },
    },
  });

  console.log('✅ Produtos criados:', { produto1, produto2 });
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
