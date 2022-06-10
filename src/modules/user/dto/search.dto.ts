import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Min, Max } from 'class-validator';
import { UserSortField } from '../constant/userSortField.constant';
import { UserSortType } from '../constant/userSortType.constant';
import { UserTypes } from '../constant/userType.constant';
import { ProfileUserDto } from './login-user.dto';
import { Pagination } from './pagination.dto';

export class SearchUserReqDto {
  @ApiProperty({
    description: 'Search email or name, when null is not condition',
    type: () => String,
    example: 'tan',
    required: false,
  })
  search: string;

  @ApiProperty({
    description: 'Role user, when null is select all',
    type: () => String,
    enum: UserTypes,
    required: false,
  })
  roles: string;

  @ApiProperty({
    description: 'Sort by field',
    type: () => String,
    enum: UserSortField,
    default: UserSortField.CREATEDAT,
    example: UserSortField.CREATEDAT,
    required: false,
  })
  sortField: string;

  @ApiProperty({
    description: 'Sort type ASC or DESC',
    type: () => String,
    enum: UserSortType,
    default: UserSortType.DESC,
    example: UserSortType.DESC,
    required: false,
  })
  sortType: string;

  @ApiProperty({
    description: 'Current page',
    type: () => Number,
    example: 0,
    default: 0,
    required: false,
  })
  @Type(() => Number)
  @Min(0)
  pageIndex: number;

  @ApiProperty({
    description: 'Rows per page',
    type: () => Number,
    example: 20,
    default: 20,
    required: false,
  })
  @Type(() => Number)
  @Min(1)
  @Max(200)
  pageSize: number;
}

export class SearchUserResDto {
  @ApiProperty({
    description: 'List user',
    isArray: true,
    type: () => ProfileUserDto,
  })
  list: ProfileUserDto[];

  @ApiProperty({
    description: 'pagination',
    type: () => Pagination,
  })
  pagination: Pagination;
}
