import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Customer } from "../Customer";

export enum statusEnum {
  PENDING = "pending",
  PAID = "paid",
  SENT = "sent",
  RECEIVED = "received",
}

@Entity("order")
export class Order extends BaseEntity {
  @JoinColumn({ name: "customer_id" })
  @ManyToOne(() => Customer)
  customer: Customer;

  @Column({ type: "decimal", scale: 2, precision: 10 })
  total: number;

  @Column({ type: "enum", enum: statusEnum, default: statusEnum.PENDING })
  status: string;
}
