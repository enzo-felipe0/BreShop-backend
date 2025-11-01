import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userType?: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não fornecido',
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({
        error: 'Token mal formatado',
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        error: 'Token mal formatado',
      });
    }

    const decoded = verifyToken(token);

    // Cast do request para adicionar propriedades customizadas
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.userId = decoded.userId;
    authenticatedReq.userEmail = decoded.email;
    authenticatedReq.userType = decoded.tipoUsuario;

    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido ou expirado',
    });
  }
};
