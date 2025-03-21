import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreatePaymentDTO {
  @IsNotEmpty()
  @IsString()
  payment_method: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  orderID: string;
}
