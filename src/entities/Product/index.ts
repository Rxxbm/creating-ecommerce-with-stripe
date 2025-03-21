import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { Category } from "../Category";

@Entity("product")
export class Product extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  description: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  image: string;

  @ManyToOne(() => Category, (category) => category.id)
  @JoinColumn({ name: "category_id" })
  category: Category;
}
