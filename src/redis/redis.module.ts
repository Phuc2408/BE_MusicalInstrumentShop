// src/redis/redis.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Redis, RedisOptions } from 'ioredis';
import { RedisController } from './redis-test.controller';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST');
        const port = config.get<number>('REDIS_PORT');
        const username = config.get<string>('REDIS_USERNAME') ?? 'default';
        const password = config.get<string>('REDIS_PASSWORD');
        const useTls = config.get<string>('REDIS_TLS') === 'true';

        if (!host || !port || !password) {
          throw new Error('Redis config missing (HOST/PORT/PASSWORD)');
        }

        const options: RedisOptions = {
          host,
          port,
          username,
          password,
        };

        if (useTls) {
          options.tls = {
            rejectUnauthorized: false,
          };
        }

        const client = new Redis(options);

        client.on('connect', () => console.log('[Redis] connected'));
        client.on('error', (err) => console.error('[Redis] error', err));

        return client;
      },
      inject: [ConfigService],
    },
  ],
  controllers:[RedisController],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
