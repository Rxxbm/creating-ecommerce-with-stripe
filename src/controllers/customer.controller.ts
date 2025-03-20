import { Request, Response } from "express";
import { Controller, Delete, Get, Put } from "../decorators/http";
import { RouteResponse, BaseController } from "../common";
import { customerRepository } from "../repositories/Customer";
import { Customer } from "../entities";

@Controller("/customer")
export class customerController extends BaseController<Customer> {
  constructor() {
    super(customerRepository);
    this.getAll = this.getAll.bind(this);
  }
  /**
   * @swagger
   * /customer/list:
   *   get:
   *     summary: Retorna uma lista paginada de consumidores
   *     tags: [Consumidor]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de itens por página
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           default: id
   *         description: Campo para ordenação
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           default: ASC
   *         description: Ordem de ordenação
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Termo de pesquisa
   *     responses:
   *       200:
   *         description: Lista de classificacao
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Login'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                     limit:
   *                       type: integer
   *                     total:
   *                       type: integer
   *                     totalPages:
   *                       type: integer
   */

  @Get("/list")
  async getAll(req: Request, res: Response): Promise<void> {
    return this.paginate(req, res);
  }

  /**
   * @swagger
   * /customer/{id}:
   *   get:
   *     summary: Retorna um consumidor pelo ID
   *     tags: [Consumidor]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID do consumidor
   *     responses:
   *       200:
   *         description: Consumidor
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CreateCustomer'
   */

  @Delete("/:id")
  async delete(req: Request, res: Response): Promise<void> {
    try {
      await customerRepository.delete(req.params.id);
      return RouteResponse.successEmpty(res);
    } catch (error) {
      return RouteResponse.serverError((error as Error).message, res);
    }
  }
}
