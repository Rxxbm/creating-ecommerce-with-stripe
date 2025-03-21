import { Stripe } from "stripe";
import { Request, Response } from "express";

import { Controller, Post } from "../decorators/http";
import { RouteResponse } from "../common/http-responses";
import { orderRepository } from "../repositories/Order";
import { statusEnum } from "../entities";
import { ValidatedDTO } from "../config/dto";
import { CreatePaymentDTO, ConfirmPaymentDTO } from "../dtos";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

@Controller("/payment")
export class PaymentController {
  /**
   * @swagger
   * /payment/checkout:
   *   post:
   *     summary: Realiza o pagamento
   *     tags: [Pagamento]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/Payment'
   *     responses:
   *       200:
   *         description: Pagamento realizado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Payment'
   */
  @Post("/checkout")
  @ValidatedDTO(CreatePaymentDTO)
  async checkout(req: Request, res: Response): Promise<void> {
    try {
      const order = await orderRepository.findOne({
        where: { id: req.body.orderID },
      });
      if (!order) {
        return RouteResponse.notFound(res, "Order not found");
      }
      const paymentIntent = await stripe.paymentIntents.create({
        amount: order.total * 100,
        currency: "brl",
        payment_method: req.body.payment_method,
        metadata: { orderId: req.body.orderID },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: "never", // Não permite redirecionamentos
        },
      });
      return RouteResponse.success(res, paymentIntent);
    } catch (error) {
      return RouteResponse.serverError((error as Error).message, res);
    }
  }

  /**
   * @swagger
   * /payment/confirm:
   *   post:
   *     summary: Confirma o pagamento
   *     tags: [Pagamento]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ConfirmPayment'
   *     responses:
   *       200:
   *         description: Pagamento confirmado
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ConfirmPayment'
   */
  @Post("/confirm")
  @ValidatedDTO(ConfirmPaymentDTO)
  async confirmPayment(req: Request, res: Response): Promise<void> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(
        req.body.payment_intent_id
      );
      return RouteResponse.success(res, paymentIntent);
    } catch (error) {
      return RouteResponse.serverError((error as Error).message, res);
    }
  }

  static async confirmByWebhook(req: Request, res: Response): Promise<void> {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    if (!sig || !endpointSecret) {
      return RouteResponse.badRequest(
        res,
        "Webhook signature or secret missing"
      );
    }
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig as string,
        endpointSecret
      );
    } catch (err) {
      console.error("Erro ao verificar webhook:", err);
      return RouteResponse.serverError("Webhook Error", res);
    }

    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `💰 Pagamento confirmado para pedido ${paymentIntent.metadata.orderID}`
        );

        await orderRepository.update(paymentIntent.metadata.orderID, {
          status: statusEnum.PAID,
        });
        break;

      case "payment_intent.payment_failed":
        console.log("❌ Pagamento falhou:", event.data.object);
        break;
    }
  }
}
