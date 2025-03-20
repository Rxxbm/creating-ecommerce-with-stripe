import { DataSource } from "typeorm";
import {
  Cart,
  CartItem,
  Category,
  Customer,
  Order,
  OrderItem,
  Product,
} from "../entities";

const isTest = process.env.NODE_ENV === "test";

export const AppDataSource = new DataSource(
  isTest
    ? {
        type: "sqlite",
        database: ":memory:",
        synchronize: true, // Apenas para testes
        logging: false,
        entities: [
          Cart,
          CartItem,
          Category,
          Customer,
          Order,
          OrderItem,
          Product,
        ],
        migrations: [],
        subscribers: [],
        extra: {
          softDelete: true,
        },
      }
    : {
        type: "postgres",
        database: process.env.POSTGRES_DB,
        host: process.env.DB_HOST || "db",
        port: 5432,
        username: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        synchronize: true, // Apenas para testes
        logging: false,
        entities: [
          Cart,
          CartItem,
          Category,
          Customer,
          Order,
          OrderItem,
          Product,
        ],
        migrations: ["src/migration/**/*.ts"],
        subscribers: ["src/subscriber/**/*.ts"],
        extra: {
          ssl: process.env.NODE_ENV === "production",
          softDelete: true,
        },
      }
);
