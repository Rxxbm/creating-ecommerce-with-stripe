import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Product } from "../Product";
import { Order } from "../Order";

@Entity("OrderItem")
export class OrderItem extends BaseEntity {
  @JoinColumn({ name: "order_id" })
  @ManyToOne(() => Order, { onDelete: "CASCADE", onUpdate: "RESTRICT" })
  order: Order;

  @JoinColumn({ name: "product_id" })
  @ManyToOne(() => Product, { onDelete: "CASCADE", onUpdate: "RESTRICT" })
  product: Product;

  @Column({ type: "int" })
  quantityItem: number;

  @Column({ type: "decimal", precision: 10 })
  price: number;
}
