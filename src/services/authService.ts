import { User, UserType } from '@prisma/client';
import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';

interface RegisterInput {
  nome: string;
  email: string;
  senha: string;
  tipoUsuario: UserType;
}

interface LoginInput {
  email: string;
  senha: string;
}

interface AuthResponse {
  user: {
    id: string;
    nome: string;
    email: string;
    tipoUsuario: UserType;
  };
  token: string;
}

// Tipo User sem a senha (para retornar ao frontend)
type UserWithoutPassword = Omit<User, 'senha'>;

class AuthService {
  async register(data: RegisterInput): Promise<AuthResponse> {
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('E-mail já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await hashPassword(data.senha);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        nome: data.nome,
        email: data.email,
        senha: hashedPassword,
        tipoUsuario: data.tipoUsuario,
      },
    });

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
    });

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
      },
      token,
    };
  }

  async login(data: LoginInput): Promise<AuthResponse> {
    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(data.senha, user.senha);

    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
    });

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipoUsuario: user.tipoUsuario,
      },
      token,
    };
  }

  async getUserById(userId: string): Promise<UserWithoutPassword | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nome: true,
        email: true,
        tipoUsuario: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

export default new AuthService();
