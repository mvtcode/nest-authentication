import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { RedisModule } from 'src/commons/redis/redis.module';
import { JwtModule } from 'src/commons/jwt/jwt.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RedisModule,
    forwardRef(() => AuthModule)
  ],
  controllers: [
    UserController,
  ],
  providers: [
    UserService,
  ],
  exports: [
    UserService,
  ]
})
export class UserModule {}
