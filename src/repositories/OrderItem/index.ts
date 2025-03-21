import { AppDataSource } from "../../config/data-source";
import { OrderItem } from "../../entities";

export const orderItemRepository = AppDataSource.getRepository(OrderItem);
