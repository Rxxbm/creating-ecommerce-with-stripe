import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Product } from "../Product";
import { Cart } from "../Cart";

@Entity("cartItem")
export class CartItem extends BaseEntity {
  @ManyToOne(() => Product, { onDelete: "CASCADE", onUpdate: "RESTRICT" })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => Cart, { onDelete: "CASCADE", onUpdate: "RESTRICT" })
  @JoinColumn({ name: "cart_id" })
  cart: Cart;

  @Column("int")
  quantityItem: number;
}
