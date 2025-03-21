import { IsNotEmpty, IsPositive, IsString, IsUUID } from "class-validator";

export class CreateItemDTO {
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  productID: string;

  @IsNotEmpty()
  @IsPositive()
  quantity: string;

  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  costumerID: string;
}
