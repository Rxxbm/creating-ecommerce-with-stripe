import { AppDataSource } from "../../config/data-source";
import { CartItem } from "../../entities/CartItem";

export const cartItemRepository = AppDataSource.getRepository(CartItem);
