import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MongoModule } from './commons/mongo/mongo.module';
import { RedisModule } from './commons/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    MongoModule,
    RedisModule,
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
