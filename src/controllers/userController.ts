import { Request, Response } from 'express';
import userService from '../services/userService';
import prisma from '../config/database';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userType?: string;
}

class UserController {
  /**
   * Obtém informações do perfil do usuário autenticado
   */
  async getProfile(req: Request, res: Response): Promise<Response> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const profile = await userService.getProfile(userId);

      return res.status(200).json({ user: profile });
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Atualiza informações do perfil do usuário
   */
  async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { nome, senhaAtual, novaSenha } = req.body;

      // Validações básicas
      if (!nome && !novaSenha) {
        return res.status(400).json({ 
          error: 'Forneça pelo menos um campo para atualizar (nome ou senha)' 
        });
      }

      const updatedUser = await userService.updateProfile(userId, {
        nome,
        senhaAtual,
        novaSenha
      });

      return res.status(200).json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser
      });

    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);

      // Erros de validação
      if (
        error.message.includes('Nome deve ter') ||
        error.message.includes('Senha atual') ||
        error.message.includes('senha deve ter') ||
        error.message.includes('Senha atual incorreta') ||
        error.message.includes('Nenhum dado fornecido')
      ) {
        return res.status(400).json({ error: error.message });
      }

      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  /**
   * Valida apenas a senha atual (útil para formulários)
   */
  async validatePassword(req: Request, res: Response): Promise<Response> {
    try {
      const authReq = req as AuthenticatedRequest;
      const userId = authReq.userId;
      const { senha } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      if (!senha) {
        return res.status(400).json({ error: 'Senha é obrigatória' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const bcrypt = require('bcrypt');
      const senhaCorreta = await bcrypt.compare(senha, user.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ error: 'Senha incorreta', valid: false });
      }

      return res.status(200).json({ valid: true, message: 'Senha válida' });

    } catch (error) {
      console.error('Erro ao validar senha:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

export default new UserController();
