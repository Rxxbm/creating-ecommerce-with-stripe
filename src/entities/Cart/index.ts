import { Entity, Column, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Customer } from "../Customer";

@Entity("cart")
export class Cart extends BaseEntity {
  @JoinColumn({ name: "customer_id" })
  @ManyToOne(() => Customer)
  customer: Customer;

  @Column({ type: "int", default: 1 })
  itens: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total: number;
}
