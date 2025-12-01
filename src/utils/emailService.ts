import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"BreShop" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`✅ Email enviado para ${options.to}`);
    } catch (error) {
      console.error('❌ Erro ao enviar email:', error);
      throw new Error('Falha ao enviar email');
    }
  }

  async sendPurchaseNotification(
    buyerEmail: string,
    buyerName: string,
    orderId: string,
    total: number,
    items: Array<{ nome: string; quantidade: number; preco: number }>
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.nome}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantidade}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">R$ ${item.preco.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pedido Confirmado</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #e91e63 0%, #f8bbd0 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🛍️ BreShop</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Pedido Confirmado!</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0;">Olá, ${buyerName}!</h2>
            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
              Seu pedido <strong style="color: #e91e63;">#${orderId}</strong> foi recebido com sucesso e está sendo processado.
            </p>

            <!-- Order Details -->
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">📦 Detalhes do Pedido</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #e91e63; color: #ffffff;">
                    <th style="padding: 12px; text-align: left; border-radius: 5px 0 0 0;">Produto</th>
                    <th style="padding: 12px; text-align: center;">Qtd</th>
                    <th style="padding: 12px; text-align: right; border-radius: 0 5px 0 0;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Total -->
            <div style="background: linear-gradient(135deg, #e91e63 0%, #f8bbd0 100%); border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">VALOR TOTAL</p>
              <h2 style="color: #ffffff; margin: 10px 0 0 0; font-size: 32px;">R$ ${total.toFixed(2)}</h2>
            </div>

            <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0;">
              Obrigado por comprar no <strong style="color: #e91e63;">BreShop</strong>! 🎉
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999999; margin: 0; font-size: 12px;">
              © 2025 BreShop - E-commerce para Brechós Online<br>
              Este é um email automático, por favor não responda.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: buyerEmail,
      subject: `✅ Pedido #${orderId} Confirmado - BreShop`,
      html,
    });
  }

  async sendSaleNotification(
    sellerEmail: string,
    sellerName: string,
    orderId: string,
    total: number,
    buyerName: string,
    items: Array<{ nome: string; quantidade: number; preco: number }>
  ): Promise<void> {
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.nome}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantidade}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">R$ ${item.preco.toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nova Venda</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #4caf50 0%, #81c784 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">💰 BreShop</h1>
            <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Nova Venda Realizada!</p>
          </div>

          <!-- Content -->
          <div style="padding: 30px;">
            <h2 style="color: #333333; margin: 0 0 20px 0;">Parabéns, ${sellerName}!</h2>
            <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
              Você realizou uma nova venda! Pedido <strong style="color: #4caf50;">#${orderId}</strong>
            </p>

            <!-- Buyer Info -->
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #666666; margin: 0;">
                <strong style="color: #333333;">👤 Comprador:</strong> ${buyerName}
              </p>
            </div>

            <!-- Order Details -->
            <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">📦 Produtos Vendidos</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #4caf50; color: #ffffff;">
                    <th style="padding: 12px; text-align: left; border-radius: 5px 0 0 0;">Produto</th>
                    <th style="padding: 12px; text-align: center;">Qtd</th>
                    <th style="padding: 12px; text-align: right; border-radius: 0 5px 0 0;">Preço</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </div>

            <!-- Total -->
            <div style="background: linear-gradient(135deg, #4caf50 0%, #81c784 100%); border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <p style="color: #ffffff; margin: 0; font-size: 14px;">VALOR TOTAL DA VENDA</p>
              <h2 style="color: #ffffff; margin: 10px 0 0 0; font-size: 32px;">R$ ${total.toFixed(2)}</h2>
            </div>

            <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0;">
              Continue vendendo no <strong style="color: #4caf50;">BreShop</strong>! 🚀
            </p>
          </div>

          <!-- Footer -->
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999999; margin: 0; font-size: 12px;">
              © 2025 BreShop - E-commerce para Brechós Online<br>
              Este é um email automático, por favor não responda.
            </p>
          </div>

        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: sellerEmail,
      subject: `💰 Nova Venda #${orderId} - BreShop`,
      html,
    });
  }
}

export default new EmailService();
