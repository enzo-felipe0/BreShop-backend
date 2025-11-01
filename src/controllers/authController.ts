import { Request, Response } from 'express';
import authService from '../services/authService';
import { UserType } from '@prisma/client';

// Interface local para requisições autenticadas
interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userType?: string;
}

class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, email, senha, tipoUsuario } = req.body;

      if (!nome || !email || !senha || !tipoUsuario) {
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios',
        });
      }

      if (senha.length < 6) {
        return res.status(400).json({
          error: 'A senha deve ter pelo menos 6 caracteres',
        });
      }

      if (!Object.values(UserType).includes(tipoUsuario)) {
        return res.status(400).json({
          error: 'Tipo de usuário inválido',
        });
      }

      const result = await authService.register({
        nome,
        email,
        senha,
        tipoUsuario,
      });

      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          error: error.message,
        });
      }
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({
          error: 'E-mail e senha são obrigatórios',
        });
      }

      const result = await authService.login({ email, senha });

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({
          error: error.message,
        });
      }
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  }

  async me(req: AuthenticatedRequest, res: Response): Promise<Response> {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado',
        });
      }

      return res.status(200).json({ user });
    } catch (error) {
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  }
}

export default new AuthController();
