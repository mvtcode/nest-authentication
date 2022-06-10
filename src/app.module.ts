import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { MongoModule } from './commons/mongo/mongo.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

@Module({
  imports: [MongoModule, UserModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
