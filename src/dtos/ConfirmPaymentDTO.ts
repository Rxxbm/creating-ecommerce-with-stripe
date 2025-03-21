import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmPaymentDTO {
  @IsNotEmpty()
  @IsString()
  payment_intent_id: string;
}
