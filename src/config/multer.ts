import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Aceitar apenas imagens
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
  }
};

export default multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por arquivo
  },
});
