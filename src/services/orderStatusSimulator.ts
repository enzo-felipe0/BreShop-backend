import prisma from '../config/database';
import { OrderStatus } from '@prisma/client';

class OrderStatusSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  
  // Intervalo de verificação: a cada 2 horas (em milissegundos)
  private readonly CHECK_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 horas
  
  // Tempo necessário para cada transição (em horas)
  private readonly STATUS_TRANSITIONS = {
    PENDENTE: { next: 'PROCESSANDO', delayHours: 2 },
    PROCESSANDO: { next: 'ENVIADO', delayHours: 2 },
    ENVIADO: { next: 'ENTREGUE', delayHours: 2 },
    ENTREGUE: { next: null, delayHours: 0 },
    CANCELADO: { next: null, delayHours: 0 },
  };

  /**
   * Inicia o simulador de status de pedidos
   * Verifica a cada 2 horas se há pedidos que devem ter o status atualizado
   */
  start() {
    if (this.intervalId) {
      console.log('⚠️  Simulador de status já está rodando');
      return;
    }

    console.log('🚀 Simulador de status de pedidos iniciado');
    console.log(`⏰ Verificação automática a cada 2 horas`);
    
    // Executa imediatamente na primeira vez
    this.updatePendingOrders();

    // Depois executa a cada 2 horas
    this.intervalId = setInterval(() => {
      this.updatePendingOrders();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Para o simulador
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Simulador de status de pedidos parado');
    }
  }

  /**
   * Atualiza pedidos que estão prontos para mudar de status
   */
  private async updatePendingOrders() {
    try {
      const now = new Date();
      console.log(`\n🔄 Verificando pedidos às ${now.toLocaleString('pt-BR')}`);

      // Buscar todos os pedidos que não estão finalizados
      const orders = await prisma.order.findMany({
        where: {
          status: {
            in: ['PENDENTE', 'PROCESSANDO', 'ENVIADO']
          }
        },
        select: {
          id: true,
          status: true,
          statusUpdatedAt: true,
          comprador: {
            select: {
              nome: true,
              email: true
            }
          }
        }
      });

      console.log(`📊 ${orders.length} pedido(s) em processamento`);

      let updatedCount = 0;

      for (const order of orders) {
        const transition = this.STATUS_TRANSITIONS[order.status];
        
        if (!transition || !transition.next) {
          continue;
        }

        // Calcular quanto tempo passou desde a última atualização
        const hoursSinceLastUpdate = 
          (now.getTime() - new Date(order.statusUpdatedAt).getTime()) / (1000 * 60 * 60);

        // Verificar se já passou o tempo necessário (2 horas)
        if (hoursSinceLastUpdate >= transition.delayHours) {
          await this.updateOrderStatus(order.id, transition.next as OrderStatus);
          
          console.log(`✅ Pedido ${order.id.substring(0, 8)}... atualizado`);
          console.log(`   ${order.status} → ${transition.next}`);
          console.log(`   Comprador: ${order.comprador.nome}`);
          
          updatedCount++;
        }
      }

      if (updatedCount === 0) {
        console.log('ℹ️  Nenhum pedido precisou ser atualizado');
      } else {
        console.log(`\n🎉 ${updatedCount} pedido(s) atualizado(s) com sucesso`);
      }

    } catch (error) {
      console.error('❌ Erro ao atualizar status dos pedidos:', error);
    }
  }

  /**
   * Atualiza o status de um pedido específico
   */
  private async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusUpdatedAt: new Date()
      }
    });
  }

  /**
   * Força a atualização de um pedido (para testes)
   */
  async forceUpdateOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { 
        status: true,
        comprador: {
          select: { nome: true }
        }
      }
    });

    if (!order) {
      throw new Error('Pedido não encontrado');
    }

    const transition = this.STATUS_TRANSITIONS[order.status];
    
    if (!transition || !transition.next) {
      throw new Error('Pedido já está no status final');
    }

    await this.updateOrderStatus(orderId, transition.next as OrderStatus);
    
    console.log(`🔧 [TESTE] Pedido atualizado manualmente`);
    console.log(`   ${order.status} → ${transition.next}`);
    console.log(`   Comprador: ${order.comprador.nome}`);
    
    return { 
      message: `Status atualizado: ${order.status} → ${transition.next}`,
      oldStatus: order.status,
      newStatus: transition.next
    };
  }

  /**
   * Retorna informações sobre o simulador
   */
  getInfo() {
    return {
      isRunning: this.intervalId !== null,
      checkIntervalHours: this.CHECK_INTERVAL_MS / (1000 * 60 * 60),
      transitions: this.STATUS_TRANSITIONS
    };
  }
}

export default new OrderStatusSimulator();