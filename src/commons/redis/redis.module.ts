import { Module, CacheModule } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      url: process.env.REDIS_URI,
      isGlobal: true,
      ttl: 0, // second
    }),
  ],
  exports: [
    CacheModule,
  ],
})
export class RedisModule {}
