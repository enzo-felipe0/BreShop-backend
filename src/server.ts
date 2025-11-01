import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📚 API Docs available at http://localhost:${PORT}/`);
  console.log(`🗄️  Database: SQLite (prisma/dev.db)`);
});
