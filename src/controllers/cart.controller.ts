import { Request, Response } from "express";
import { Controller, Delete, Get, Post } from "../decorators/http";
import { RouteResponse, BaseController } from "../common";
import { Cart, CartItem, Customer, Product } from "../entities";
import {
  customerRepository,
  cartItemRepository,
  cartRepository,
} from "../repositories";
import { AppDataSource } from "../config/data-source";
import { ValidatedDTO } from "../config/dto";
import { CreateItemDTO } from "../dtos/CreateItemDTO";

@Controller("/cart")
export class CartController extends BaseController<CartItem> {
  constructor() {
    super(cartItemRepository);
    this.listItems = this.listItems.bind(this);
  }
  /**
   * @swagger
   * /cart/item/list/{customerID}:
   *   get:
   *     summary: Lista os itens do carrinho de um cliente
   *     tags: [Carrinho]
   *     description: Retorna os itens do carrinho de um cliente específico, com suporte a paginação.
   *     parameters:
   *       - in: path
   *         name: customerID
   *         required: true
   *         schema:
   *           type: string
   *         description: ID do cliente
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
   *           default: "id"
   *         description: Campo para ordenação
   *       - in: query
   *         name: sortOrder
   *         schema:
   *           type: string
   *           default: "ASC"
   *         description: Ordem de ordenação
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Termo de pesquisa para filtrar os itens
   *     responses:
   *       200:
   *         description: Lista de itens do carrinho
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Items found"
   *                 items:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         example: 1
   *                       name:
   *                         type: string
   *                         example: "Product A"
   *                       image:
   *                         type: string
   *                         example: "https://example.com/productA.jpg"
   *                       price:
   *                         type: string
   *                         example: "39.98"
   *                       quantity:
   *                         type: integer
   *                         example: 2
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     limit:
   *                       type: integer
   *                       example: 10
   *                     total:
   *                       type: integer
   *                       example: 20
   *                     totalPages:
   *                       type: integer
   *                       example: 2
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
  @Get("/item/list/:customerID")
  async listItems(req: Request, res: Response): Promise<void> {
    const { customerID } = req.params;

    try {
      // Verifique se o cliente existe
      const customer = await customerRepository.findOne({
        where: { id: customerID },
      });

      if (!customer) {
        return RouteResponse.notFound(res, "Customer not found");
      }

      // Encontre o carrinho do cliente
      const cart = await cartRepository.findOne({
        where: {
          customer: {
            id: customerID,
          },
        },
      });

      if (!cart) {
        return RouteResponse.success(res, {
          message: "Cart is empty",
          items: [],
        });
      }

      // Use o método `paginate` para buscar os itens do carrinho
      return await this.paginate(req, res, {
        where: {
          cart: {
            id: cart.id,
          },
        },
        relations: ["product"], // Carregue o relacionamento com Product
      });
    } catch (error) {
      return RouteResponse.serverError((error as Error).message, res);
    }
  }

  /**
   * @swagger
   * /cart/item/add:
   *   post:
   *     summary: Adiciona um item ao carrinho de um cliente
   *     tags: [Carrinho]
   *     description: Adiciona um produto ao carrinho de um cliente específico. Se o carrinho não existir, ele será criado.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: "#/components/schemas/AddItem"
   *     responses:
   *       201:
   *         description: Item adicionado ao carrinho com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Item added to cart"
   *                 cartItem:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     cart:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 1
   *                     product:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: integer
   *                           example: 67890
   *                         name:
   *                           type: string
   *                           example: "Product A"
   *                         price:
   *                           type: number
   *                           example: 19.99
   *                     quantityItem:
   *                       type: integer
   *                       example: 2
   *       404:
   *         description: Cliente ou produto não encontrado
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
  @Post("/item/add")
  @ValidatedDTO(CreateItemDTO)
  async addItem(req: Request, res: Response): Promise<void> {
    const { customerID, productID, quantity } = req.body;

    // Inicia a transação
    await AppDataSource.transaction(async (transactionalEntityManager) => {
      try {
        const customer = await transactionalEntityManager.findOne(Customer, {
          where: { id: customerID },
        });

        const product = await transactionalEntityManager.findOne(Product, {
          where: { id: productID },
        });

        if (!product) {
          return RouteResponse.notFound(res, "Product not found");
        }

        if (product.quantity < quantity) {
          return RouteResponse.badRequest(res, "Insufficient stock");
        }

        if (!customer) {
          return RouteResponse.notFound(res, "Customer not found");
        }

        let cart = await transactionalEntityManager.findOne(Cart, {
          where: {
            customer: {
              id: customerID,
            },
          },
          relations: ["customer"],
        });

        if (!cart) {
          cart = new Cart();
          cart.customer = customer;
          cart.total = 0;
          await transactionalEntityManager.save(cart);
        }

        const cartItem = new CartItem();
        cartItem.cart = cart;
        cartItem.product = product;
        cartItem.quantityItem = quantity;

        cart.total += product.price * quantity;
        product.quantity -= quantity;

        await transactionalEntityManager.save(cartItem);
        await transactionalEntityManager.save(cart);
        await transactionalEntityManager.save(product);

        return RouteResponse.successCreated(res, {
          message: "Item added to cart",
          cartItem,
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
   * /cart/item/remove/{id}:
   *   delete:
   *     summary: Remove um item do carrinho
   *     tags: [Carrinho]
   *     description:
   *       Remove um item do carrinho com base no ID fornecido.
   *       Atualiza o total do carrinho e a quantidade do produto no estoque.
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: ID do item do carrinho a ser removido
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: Item removido com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Item removed from cart"
   *       '404':
   *         description: Item não encontrado
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Item not found"
   *       '500':
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
  @Delete("/item/remove/:id")
  async removeItem(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      try {
        const cartItem = await transactionalEntityManager.findOne(CartItem, {
          where: { id },
          relations: ["product", "cart"],
        });

        if (!cartItem) {
          return RouteResponse.notFound(res, "Item not found");
        }

        const product = cartItem.product;
        const cart = cartItem.cart;

        cart.total -= product.price * cartItem.quantityItem;
        product.quantity += cartItem.quantityItem;

        await transactionalEntityManager.remove(cartItem);
        await transactionalEntityManager.save(cart);
        await transactionalEntityManager.save(product);

        return RouteResponse.success(res, {
          message: "Item removed from cart",
        });
      } catch (error) {
        throw error;
      }
    }).catch((error) => {
      return RouteResponse.serverError(error.message, res);
    });
  }
}
