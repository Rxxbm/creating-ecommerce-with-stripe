import { Request, Response } from "express";
import * as crypto from "crypto";

import { Controller, Post } from "../decorators/http";
import { RouteResponse } from "../common/http-responses";
import { ValidatedDTO } from "../config/dto";
import { CreateCustomerDTO, LoginDTO } from "../dtos";
import { customerRepository } from "../repositories";
import {
  makeJwtToken,
  PrivateRoute,
  redisClient,
  nodemailer,
} from "../thirdparty";

@Controller("/auth")
export class AuthenticationController {
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Cria um novo cliente
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCustomer'
   *     responses:
   *       200:
   *         description: Cliente criado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CreateCustomer'
   */
  @Post("/register")
  @ValidatedDTO(CreateCustomerDTO)
  async create(req: Request, res: Response): Promise<void> {
    try {
      const cliente = customerRepository.create({
        ...req.body,
      });
      await customerRepository.save(cliente);
      return RouteResponse.successCreated(res, cliente);
    } catch (error) {
      console.log(error);
    }
  }
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Realiza login
   *     tags: [Autenticação]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Login'
   *     responses:
   *       200:
   *         description: Token gerado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 token:
   *                   type: string
   *                   description: Token JWT gerado
   *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   *       401:
   *         description: Email ou senha inválidos
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Email ou senha inválidos
   */
  @Post("/login")
  @ValidatedDTO(LoginDTO)
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    // Busca o cliente pelo email
    const cliente = await customerRepository.findOne({ where: { email } });

    // Verifica se o cliente existe e se a senha é válida
    if (!cliente || !(await cliente.comparePassword(password))) {
      return RouteResponse.unauthorized(res, "Email ou senha inválidos");
    }
    // Gera o token JWT
    const token = makeJwtToken({
      id: cliente!.id,
      email: cliente!.email,
      role: cliente!.role,
    });

    // Retorna o token
    return RouteResponse.success(res, { token });
  }

  /**
   * @swagger
   * /auth/forgot-password:
   *   post:
   *     summary: Envia um email com o token de recuperação de senha para o usuário.
   *     description: Gera um token de recuperação e envia para o email do usuário.
   *     tags: [Autenticação]
   *     parameters:
   *       - name: email
   *         in: body
   *         description: O email do usuário que deseja recuperar a senha.
   *         required: true
   *         schema:
   *           type: string
   *           format: email
   *     responses:
   *       200:
   *         description: Email enviado com sucesso.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Email enviado com sucesso"
   *       404:
   *         description: Usuário não encontrado.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Usuário não encontrado"
   *       500:
   *         description: Erro ao enviar o email.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Erro ao enviar email"
   */
  @Post("/forgot-password")
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const user = await customerRepository.findOne({
      where: { email: req.body.email },
    });

    if (!user) {
      return RouteResponse.notFound(res, "User not found");
    }

    const token = crypto.randomBytes(20).toString("hex");

    await redisClient.set(user.id, token);

    // Enviar email com o token

    await nodemailer.sendMail(
      user.email,
      "Recuperação de senha",
      `<p>Seu token é: ${token}</p> ID: ${user.id}`
    );

    return RouteResponse.success(res, "Email was sent successfully");
  }

  /**
   * @swagger
   * /auth/reset-password:
   *   post:
   *     summary: Altera a senha do usuário
   *     tags: [Autenticação]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *                 description: Token de recuperação de senha
   *                 example: 123456
   *               password:
   *                 type: string
   *                 description: Nova senha
   *                 example: nova-senha
   *     responses:
   *       200:
   *         description: Senha alterada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Senha alterada com sucesso
   *       401:
   *         description: Token inválido
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Token inválido
   *       404:
   *         description: Usuário não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Usuário não encontrado
   */

  @Post("/reset-password")
  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password, userID } = req.body;

    const userToken = await redisClient.getRecoveryToken(userID);

    if (!userToken || userToken !== token) {
      return RouteResponse.unauthorized(res, "Token inválido");
    }

    const user = await customerRepository.findOne({
      where: { id: userID },
    });

    if (!user) {
      return RouteResponse.notFound(res, "Usuário não encontrado");
    }

    user.password = password;

    await customerRepository.save(user);

    await redisClient.deleteRecoveryToken(userID);

    return RouteResponse.success(res, "Senha alterada com sucesso");
  }

  /**
   * @swagger
   * /auth/me:
   *   post:
   *     summary: Retorna os dados do usuário autenticado
   *     tags: [Autenticação]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dados do usuário autenticado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Login'
   *       401:
   *         description: Não autorizado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Token inválido ou expirado
   */
  @Post("/me")
  @PrivateRoute()
  async me(req: Request, res: Response): Promise<void> {
    // Retorna os dados do usuário autenticado
    return RouteResponse.success(res, req.user);
  }
}
