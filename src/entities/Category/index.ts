import { Entity, Column } from "typeorm";
import { BaseEntity } from "../BaseEntity";

@Entity("category")
export class Category extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 255 })
  description: string;
}
