import app from './app';
import orderStatusSimulator from './services/orderStatusSimulator';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/`);
  console.log(`🗄️  Database: SQLite (prisma/dev.db)`);
  console.log(`${'='.repeat(60)}\n`);
  
  // Iniciar o simulador de status de pedidos
  orderStatusSimulator.start();
});

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n${signal} signal received: closing HTTP server`);
  orderStatusSimulator.stop();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;
