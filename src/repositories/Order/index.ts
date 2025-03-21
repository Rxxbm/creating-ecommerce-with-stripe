import { AppDataSource } from "../../config/data-source";
import { Order } from "../../entities";

export const orderRepository = AppDataSource.getRepository(Order);
