import { Request, Response } from "express";
import { Like, ObjectLiteral, Repository } from "typeorm";
import { RouteResponse } from "../http-responses";

export abstract class BaseController<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  protected async paginate(
    req: Request,
    res: Response,
    options?: {
      where?: any;
      order?: any;
      relations?: string[];
    }
  ): Promise<void> {
    const page = parseInt(req.query.page as string) || 1; // Página padrão: 1
    const limit = parseInt(req.query.limit as string) || 10; // Limite padrão: 10
    const sortBy = (req.query.sortBy as string) || "id"; // Ordenar por padrão: ID
    const sortOrder = (req.query.sortOrder as string) || "ASC"; // Ordem padrão: ASC
    const search = (req.query.search as string) || "";

    // Configura a cláusula WHERE com base no campo de ordenação e no termo de pesquisa
    const whereClause = search
      ? { [sortBy]: Like(`%${search}%`), ...options?.where } // Filtra o campo de ordenação com o termo de pesquisa
      : options?.where || {}; // Sem filtro se não houver termo de pesquisa

    // Calcula o número de itens a serem ignorados
    const skip = (page - 1) * limit;

    // Busca os dados paginados e o total de registros
    const [data, total] = await this.repository.findAndCount({
      skip,
      take: limit,
      where: whereClause,
      order: {
        [sortBy]: sortOrder,
        ...options?.order,
      },
      relations: options?.relations || [],
    });

    // Retorna os dados e metadados de paginação
    return RouteResponse.success(res, {
      result: data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
