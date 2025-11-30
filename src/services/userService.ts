import prisma from '../config/database';
import { hashPassword } from '../utils/password';

interface UpdateProfileData {
  nome?: string;
  senhaAtual?: string;
  novaSenha?: string;
}

class UserService {
  /**
   * Atualiza informações básicas do perfil do usuário
   */
  async updateProfile(userId: string, data: UpdateProfileData) {
    // Buscar usuário atual
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Preparar dados para atualização
    const updateData: any = {};

    // Atualizar nome se fornecido
    if (data.nome && data.nome.trim() !== '') {
      if (data.nome.trim().length < 3) {
        throw new Error('Nome deve ter pelo menos 3 caracteres');
      }
      updateData.nome = data.nome.trim();
    }

    // Atualizar senha se fornecida
    if (data.novaSenha) {
      // Verificar se a senha atual foi fornecida
      if (!data.senhaAtual) {
        throw new Error('Senha atual é obrigatória para alterar a senha');
      }

      // Verificar se a senha atual está correta
      const bcrypt = require('bcrypt');
      const senhaCorreta = await bcrypt.compare(data.senhaAtual, user.senha);
      
      if (!senhaCorreta) {
        throw new Error('Senha atual incorreta');
      }

      // Validar nova senha
      if (data.novaSenha.length < 6) {
        throw new Error('Nova senha deve ter pelo menos 6 caracteres');
      }

      // Hash da nova senha
      updateData.senha = await hashPassword(data.novaSenha);
    }

    // Verificar se há dados para atualizar
    if (Object.keys(updateData).length === 0) {
      throw new Error('Nenhum dado fornecido para atualização');
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Busca informações do perfil do usuário
   */
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }
}

export default new UserService();
