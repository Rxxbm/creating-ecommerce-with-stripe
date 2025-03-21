import { Request, Response } from "express";

import { Controller, Delete, Get, Post } from "../decorators/http";
import { RouteResponse, BaseController } from "../common";
import { AppDataSource } from "../config/data-source";
import { Cart, CartItem, Customer, Order, OrderItem } from "../entities";
import { orderRepository } from "../repositories/Order";
import { ValidatedDTO } from "../config/dto";
import { CreateOrderDTO } from "../dtos";

@Controller("/order")
export class OrderController extends BaseController<Order> {
  constructor() {
    super(orderRepository);
    this.getAllOrders = this.getAllOrders.bind(this);
  }
  /**
   * @swagger
   * /order/list:
   *   get:
   *     summary: Retorna uma lista paginada de pedidos
   *     tags: [Pedido]
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
   *         description: Lista de pedidos
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
  async getAllOrders(req: Request, res: Response): Promise<void> {
    return this.paginate(req, res, {
      relations: ["customer"],
    });
  }

  /**
   * @swagger
   * /order/create:
   *   post:
   *     summary: Cria um novo pedido a partir do carrinho de um cliente
   *     description: |
   *       Cria um novo pedido com base nos itens do carrinho de um cliente.
   *       O carrinho é esvaziado após a criação do pedido.
   *     tags: [Pedido]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - customerID
   *             properties:
   *               customerID:
   *                 type: string
   *                 description: ID do cliente
   *                 example: "12345"
   *     responses:
   *       201:
   *         description: Pedido criado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Order created successfully"
   *                 order:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     total:
   *                       type: number
   *                       format: double
   *                       example: 99.95
   *                     items:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           product:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: integer
   *                                 example: 101
   *                               name:
   *                                 type: string
   *                                 example: "Product A"
   *                               price:
   *                                 type: number
   *                                 format: double
   *                                 example: 19.99
   *                           quantityItem:
   *                             type: integer
   *                             example: 2
   *                           price:
   *                             type: number
   *                             format: double
   *                             example: 19.99
   *       404:
   *         description: Cliente não encontrado ou carrinho vazio
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Customer not found"
   *       500:
   *         description: Erro interno do servidor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Internal server error"
   */
  @Post("/create")
  @ValidatedDTO(CreateOrderDTO)
  async createOrder(req: Request, res: Response): Promise<void> {
    const { customerID } = req.body;

    // Inicia a transação
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      try {
        // 1. Busca o cliente
        const customer = await transactionalEntityManager.findOne(Customer, {
          where: { id: customerID },
        });

        if (!customer) {
          return RouteResponse.notFound(res, "Customer not found");
        }

        // 2. Busca o carrinho do cliente
        const cart = await transactionalEntityManager.findOne(Cart, {
          where: {
            customer: {
              id: customerID,
            },
          },
        });

        if (!cart) {
          return RouteResponse.notFound(res, "Cart not found");
        }

        const cartItems = await transactionalEntityManager.find(CartItem, {
          where: {
            cart: {
              id: cart.id,
            },
          },
          relations: ["product", "cart"], // Carrega o produto associado
        });

        if (!cartItems) {
          return RouteResponse.notFound(res, "Cart items not found");
        }

        // 3. Cria um novo pedido (Order)
        const order = new Order();
        order.customer = customer;
        order.total = cart.total; // Define o total do pedido como o total do carrinho

        for (const item of cartItems) {
          const orderItem = new OrderItem();
          orderItem.product = item.product;
          orderItem.quantityItem = item.quantityItem;
          orderItem.price = item.product.price; // Preço unitário do produto
          orderItem.order = order;
          await transactionalEntityManager.save(orderItem);
        }

        // 6. Salva o pedido no banco de dados
        await transactionalEntityManager.save(order);

        // 7. Remove todos os itens do carrinho
        await transactionalEntityManager.remove(cart);

        // Retorna a resposta de sucesso
        return RouteResponse.successCreated(res, {
          message: "Order created successfully",
          order,
        });
      } catch (error) {
        throw error; // A transação será revertida automaticamente em caso de erro
      }
    }).catch((error) => {
      return RouteResponse.serverError(error.message, res);
    });
  }
  /**
   * @swagger
   * /order/remove/{id}:
   *   delete:
   *     summary: Remove um pedido e seus itens
   *     tags: [Pedido]
   *     description: Deleta um pedido pelo seu id e todos os seus itens atualizando quantidade dos produtos.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: ID of the order to be removed
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Order removed successfully
   *       400:
   *         description: Bad request, order not found
   *       500:
   *         description: Internal server error
   */
  @Delete("/remove/:id")
  async removeOrder(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    // Inicia a transação
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      try {
        // 1. Busca o pedido
        const order = await transactionalEntityManager.findOne(Order, {
          where: { id },
        });

        if (!order) {
          return RouteResponse.badRequest(res, "Order not found");
        }

        // 2. Busca os itens do pedido
        const orderItems = await transactionalEntityManager.find(OrderItem, {
          where: {
            order: {
              id: order.id,
            },
          },
          relations: ["product"], // Carrega o pedido associado
        });

        for (const item of orderItems) {
          item.product.quantity = item.product.quantity + item.quantityItem;
          await transactionalEntityManager.save(item.product);
        }

        if (!orderItems) {
          return RouteResponse.badRequest(res, "Order items not found");
        }

        // 3. Remove os itens do pedido
        await transactionalEntityManager.remove(orderItems);

        // 4. Remove o pedido
        await transactionalEntityManager.remove(order);

        // Retorna a resposta de sucesso
        return RouteResponse.success(res, "Order removed successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        return RouteResponse.serverError(`Server Error ${errorMessage}`, res); // A transação será revertida automaticamente em caso de erro
      }
    });
  }
}
