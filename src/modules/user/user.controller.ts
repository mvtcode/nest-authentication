import { Controller, Get, Post, Body, Patch, Delete, HttpException, HttpStatus, Inject, CACHE_MANAGER, UseGuards, Request } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Types } from 'mongoose';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserResDto } from './dto/create-user.dto';
import { UpdateUserPasswordDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { User } from './schemas/user.schema';
import { LoginUserDto, LoginUserResDto, ProfileUserDto } from './dto/login-user.dto';
import { Cache } from 'cache-manager';
import { parseJson } from 'src/libs/parse';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LocalAuthGuard } from '../auth/local-auth.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BadRequestExceptionResDto, ExceptionResDto, UnauthorizedExceptionResDto } from '../exception/exception-request.dto';
import { SuccessResDto } from './dto/success.dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  private defaultFields = {_id: 1, email: 1, createdAt: 1, updatedAt: 1};

  constructor(
    @Inject(CACHE_MANAGER) private cache: Cache,
    private readonly userService: UserService,
    private jwtService: JwtService,
  ) {}

  @ApiOperation({
    operationId: 'user-create',
    description: 'Create new user',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: () => BadRequestExceptionResDto,
    description: 'Exception bad request',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: () => ExceptionResDto,
    description: 'Internal server error',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => CreateUserResDto,
    description: 'New user created response',
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) : Promise<User> {
    const isExited = await this.userService.count({
      email: createUserDto.email
    });

    if (isExited) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Email is existed',
      }, HttpStatus.BAD_REQUEST);
    }
    
    return this.userService.create(createUserDto);
  }

  @ApiOperation({
    operationId: 'user-login',
    description: 'User login',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: () => BadRequestExceptionResDto,
    description: 'Exception bad request',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: () => LoginUserResDto,
    description: 'Login response',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req,
    @Body() _body: LoginUserDto
  ) {
    const dataSign = req.user;

    const refresh_token = new Types.ObjectId().toString();
    await this.cache.set(refresh_token, JSON.stringify(dataSign), { ttl: 0 });

    return {
      ...dataSign,
      token: this.jwtService.sign(dataSign),
      expire: process.env.JWT_EXPIRE,
      refresh_token,
    }
  }

  @ApiOperation({
    operationId: 'user-logout',
    description: 'User logout',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: () => SuccessResDto,
    description: 'Logout response',
  })
  @Post('logout')
  async logout(@Body() request: RefreshTokenDto) {
    await this.cache.del(request.refresh_token);
    return {
      isSuccess: true
    };
  }

  @ApiOperation({
    operationId: 'user-refresh-token',
    description: 'Refresh token',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    type: () => BadRequestExceptionResDto,
    description: 'Exception bad request',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: () => LoginUserResDto,
    description: 'Refresh token response',
  })
  @Post('refesh-token')
  async refeshToken(@Body() request: RefreshTokenDto) {
    const dataCache = await this.cache.get(request.refresh_token);

    if (!dataCache) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: 'Incorrect refresh_token',
      }, HttpStatus.BAD_REQUEST);
    }

    const dataSign = parseJson(dataCache as string);

    return {
      ...dataSign,
      token: this.jwtService.sign(dataSign),
      expire: process.env.JWT_EXPIRE,
      refresh_token: request.refresh_token,
    }
  }

  @ApiOperation({
    operationId: 'user-detail',
    description: 'Get user detail',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => ProfileUserDto,
    description: 'User response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  findOne(
    @Request() req,
  ) {
    const user = req.user;
    return this.userService.findOne({_id: user._id}, this.defaultFields);
  }

  @ApiOperation({
    operationId: 'user-update-password',
    description: 'Update password',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SuccessResDto,
    description: 'Is success response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('password')
  updatePassword(
    @Request() req,
    @Body() request: UpdateUserPasswordDto,
  ) {
    const user = req.user;
    return this.userService.updatePassword(user._id, request);
  }

  @ApiOperation({
    operationId: 'user-delete',
    description: 'Delete user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: () => SuccessResDto,
    description: 'Is success response',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: () => UnauthorizedExceptionResDto,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('')
  async remove(
    @Request() req,
  ) {
    const user = req.user
    return {
      isSuccess: await this.userService.remove(user._id)
    }
  }
}
