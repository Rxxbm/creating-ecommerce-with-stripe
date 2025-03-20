import { Request, Response } from "express";
import { Controller, Delete, Get, Post, Put } from "../decorators/http";
import { RouteResponse, BaseController } from "../common";
import { categoryRepository } from "../repositories/Category";
import { ValidatedDTO } from "../config/dto";
import { CreateCategoryDTO } from "../dtos/CreateCategoryDTO";
import { Category } from "../entities";

@Controller("/category")
export class categoryController extends BaseController<Category> {
  constructor() {
    super(categoryRepository);
    this.getAll = this.getAll.bind(this);
  }
  /**
   * @swagger
   * /category/list:
   *   get:
   *     summary: Retorna uma lista paginada de categoria
   *     tags: [Categoria]
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
   *         description: Lista de categorias
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Category'
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
   * /category/{id}:
   *   get:
   *     summary: Retorna uma classificação pelo ID
   *     tags: [Categoria]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID da classificação
   *     responses:
   *       200:
   *         description: Classificação encontrada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   *       404:
   *         description: Category not found
   */

  @Get("/:id")
  async getOne(req: Request, res: Response): Promise<void> {
    const category = await categoryRepository.findOneBy({
      id: req.params.id,
    });
    if (category) {
      return RouteResponse.success(res, category);
    } else {
      return RouteResponse.notFound(res, "Category not found");
    }
  }

  /**
   * @swagger
   * /category/create:
   *   post:
   *     summary: Cria uma nova classificação
   *     tags: [Categoria]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Category'
   *     responses:
   *       201:
   *         description: Classificação criada com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   */

  @Post("/create")
  @ValidatedDTO(CreateCategoryDTO)
  async create(req: Request, res: Response): Promise<void> {
    const category = categoryRepository.create(req.body);
    await categoryRepository.save(category);
    return RouteResponse.successCreated(res, category);
  }

  /**
   * @swagger
   * /category/{id}:
   *   put:
   *     summary: Atualiza uma classificação pelo ID
   *     tags: [Categoria]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID da classificação
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Category'
   *     responses:
   *       200:
   *         description: Classificação atualizada
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Category'
   */

  @Put("/:id")
  async update(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const category = await categoryRepository.update(id, req.body);
    const newcategory = await categoryRepository.findOneBy({
      id: id,
    });
    if (category) {
      return RouteResponse.success(res, newcategory);
    } else {
      return RouteResponse.notFound(res, "Category not found");
    }
  }

  /**
   * @swagger
   * /category/{id}:
   *   delete:
   *     summary: Deleta uma classificação pelo ID
   *     tags: [Categoria]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *         required: true
   *         description: ID da classificação
   *     responses:
   *       204:
   *         description: category deletada com sucesso
   */

  @Delete("/:id")
  async delete(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    await categoryRepository.delete(id);
    return RouteResponse.successEmpty(res);
  }
}
