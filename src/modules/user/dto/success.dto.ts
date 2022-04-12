import { ApiProperty } from "@nestjs/swagger";

export class SuccessResDto {
  @ApiProperty({
    description: "Is success response",
    type: () => Boolean,
    example: true,
  })
  isSuccess: boolean;
}