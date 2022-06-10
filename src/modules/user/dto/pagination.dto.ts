import { ApiProperty } from '@nestjs/swagger';

export class Pagination {
  @ApiProperty({
    description: 'Page index',
    type: () => Number,
    example: 0,
  })
  pageIndex: number;

  @ApiProperty({
    description: 'Page size',
    type: () => Number,
    example: 20,
  })
  pageSize: number;

  @ApiProperty({
    description: 'Total row',
    type: () => Number,
    example: 55,
  })
  total: number;
}
