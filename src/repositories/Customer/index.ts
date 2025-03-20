import { AppDataSource } from "../../config/data-source";
import { Customer } from "../../entities/Customer";

export const customerRepository = AppDataSource.getRepository(Customer).extend({
  async findByEmail(email: string): Promise<Customer | null> {
    return this.findOne({ where: { email } });
  },
});
