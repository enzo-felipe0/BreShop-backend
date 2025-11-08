import { Request, Response } from 'express';
import productService from '../services/productService';

interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userType?: string;
}

class ProductController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nome, descricao, preco, quantidade } = req.body;
      const authenticatedReq = req as AuthenticatedRequest;
      const vendedorId = authenticatedReq.userId;

      // Validações
      if (!nome || !descricao || !preco || !quantidade) {
        return res.status(400).json({
          error: 'Todos os campos são obrigatórios',
        });
      }

      if (!vendedorId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      // Verificar se é vendedor
      if (authenticatedReq.userType !== 'VENDEDOR') {
        return res.status(403).json({
          error: 'Apenas vendedores podem cadastrar produtos',
        });
      }

      // Processar fotos
      const files = req.files as Express.Multer.File[];
      const fotoUrls = files ? files.map(file => `/uploads/${file.filename}`) : [];

      const product = await productService.create({
        nome,
        descricao,
        preco: parseFloat(preco),
        quantidade: parseInt(quantidade, 10),
        vendedorId,
        fotos: fotoUrls,
      });

      return res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  }

  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const products = await productService.findAll();
      return res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const product = await productService.findById(id);

      if (!product) {
        return res.status(404).json({
          error: 'Produto não encontrado',
        });
      }

      return res.status(200).json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  }

  async getByVendedor(req: Request, res: Response): Promise<Response> {
    try {
      const authenticatedReq = req as AuthenticatedRequest;
      const vendedorId = authenticatedReq.userId;

      if (!vendedorId) {
        return res.status(401).json({
          error: 'Usuário não autenticado',
        });
      }

      const products = await productService.findByVendedor(vendedorId);
      return res.status(200).json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos do vendedor:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
      });
    }
  }
}

export default new ProductController();
