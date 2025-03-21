import { AppDataSource } from "../../config/data-source";
import { Cart } from "../../entities/Cart";

export const cartRepository = AppDataSource.getRepository(Cart);
