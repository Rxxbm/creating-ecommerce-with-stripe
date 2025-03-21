import { Request, Response } from "express";
import { Controller } from "../decorators/http/controller";
import { Delete, Get, Post, Put } from "../decorators/http/methods";
import { RouteResponse } from "../common/http-responses";
import { productRepository } from "../repositories/Product";
import { ValidatedDTO } from "../config/dto";
import { CreateProductDTO } from "../dtos";
import { BaseController } from "../common/controller/BaseController";
import { Product } from "../entities";

@Controller("/product")
export class ProductController extends BaseController<Product> {
  constructor() {
    super(productRepository);
    this.getAll = this.getAll.bind(this);
  }
  /**
   * @swagger
   * /product/list:
   *   get:
   *     summary: Retorna uma lista paginada de produtos
   *     tags: [Produto]
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
   *         description: Lista de produto
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Product'
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
    return this.paginate(req, res, {
      relations: ["category"],
    });
  }

  /**
   * @swagger
   * /produto/{id}:
   *   get:
   *     summary: Retorna uma produto pelo ID
   *     tags: [Produto]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID da produto
   *     responses:
   *       200:
   *         description: produto encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   */

  @Get("/:id")
  async getOne(req: Request, res: Response): Promise<void> {
    const produto = await productRepository.findOne({
      where: { id: req.params.id },
      relations: ["categoria"],
    });
    if (produto) {
      return RouteResponse.success(res, produto);
    } else {
      return RouteResponse.notFound(res, "Product not found");
    }
  }

  /**
   * @swagger
   * /product/create:
   *   post:
   *     summary: Cria uma nova produto
   *     tags: [Produto]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Product'
   *     responses:
   *       200:
   *         description: produto criada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   */

  @Post("/create")
  @ValidatedDTO(CreateProductDTO)
  async create(req: Request, res: Response): Promise<void> {
    const produto = productRepository.create(req.body);
    await productRepository.save(produto);
    return RouteResponse.successCreated(res, produto);
  }

  /**
   * @swagger
   * /product/{id}:
   *   put:
   *     summary: Atualiza uma produto pelo ID
   *     tags: [Produto]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID da produto
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Product'
   *     responses:
   *       200:
   *         description: produto atualizada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Product'
   *       404:
   *         description: Product not found
   */

  @Put("/:id")
  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const produto = await productRepository.update(id, req.body);
    const newProduto = await productRepository.findOne({
      where: { id },
      relations: ["categoria"],
    });
    if (produto) {
      return RouteResponse.success(res, newProduto);
    } else {
      return RouteResponse.notFound(res, "Product not found");
    }
  }

  /**
   * @swagger
   * /product/{id}:
   *   delete:
   *     summary: Deleta uma produto pelo ID
   *     tags: [Produto]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID da produto
   *     responses:
   *       200:
   *         description: produto deletada
   *       404:
   *         description: produto não encontrada
   */

  @Delete("/:id")
  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await productRepository.delete(id);
    return RouteResponse.successEmpty(res);
  }
}
