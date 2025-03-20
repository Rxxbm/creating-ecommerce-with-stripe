import { Entity, Column, OneToMany, BeforeInsert, BeforeUpdate } from "typeorm";
import { BaseEntity } from "../BaseEntity";
import { comparePasswords, hashPassword } from "../../thirdparty/bcrypt";

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

@Entity("customer")
export class Customer extends BaseEntity {
  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  email: string;

  @Column({ type: "varchar", length: 100, name: "password" })
  password: string;

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role: Role;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPass() {
    if (this.password) {
      this.password = await hashPassword(this.password);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return comparePasswords(password, this.password);
  }
}
