import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateOrderDTO {
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  customerID: string;
}
