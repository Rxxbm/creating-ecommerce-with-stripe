import { createTransport, Transporter } from "nodemailer";

export class Nodemailer {
  transporter: Transporter;

  constructor() {
    const isProduction = process.env.NODE_ENV === "production";

    // Configuração do MailHog (Desenvolvimento local)
    if (!isProduction) {
      this.transporter = createTransport({
        host: process.env.MAIL_HOST || "localhost",
        port: Number(process.env.MAIL_PORT) || 1025, // MailHog geralmente usa a porta 1025
        secure: false, // MailHog não usa TLS/SSL por padrão
      });
    } else {
      // Configuração para produção (Exemplo com SMTP do Gmail)
      this.transporter = createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        secure: process.env.MAIL_SECURE === "true", // Usa TLS/SSL se configurado
        auth: {
          user: process.env.MAIL_USER, // Usuário de autenticação SMTP
          pass: process.env.MAIL_PASS, // Senha de autenticação SMTP
        },
      });
    }

    // Verificação da conexão
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("Erro ao conectar com o servidor de e-mail", error);
      } else {
        console.log("Servidor de e-mail conectado com sucesso");
      }
    });
  }

  // Método para envio de e-mails
  public async sendMail(
    to: string,
    subject: string,
    message: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.MAIL_USER || "test@email.com", // Adiciona um fallback para desenvolvimento
      to,
      subject,
      html: message,
    });
  }
}

// Instância do Nodemailer
export const nodemailer = new Nodemailer();
