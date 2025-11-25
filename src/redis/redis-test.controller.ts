import { Controller, Get, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Controller('/v1/redis')
export class RedisController {
  // constructor(
  //   @Inject('REDIS_CLIENT') private readonly redis: Redis,
  // ) { }

  // // 1. Test API cơ bản
  // @Get()
  // getHello() {
  //   return { message: 'Redis Controller is running!' };
  // }

  // // 2. Test ghi/đọc Redis (Hàm cũ của bạn)
  // @Get('redis-test')
  // async redisTest() {
  //   const key = 'test:nest';
  //   const value = `hello-redis-${Date.now()}`;

  //   // Lưu vào Redis, hết hạn sau 1 ngày (86400 giây)
  //   await this.redis.set(key, value, 'EX', 86400);
  //   const stored = await this.redis.get(key);

  //   return {
  //     key,
  //     valueJustSet: value,
  //     valueFromRedis: stored,
  //     message: 'Kết nối Redis ngon lành!'
  //   };
  // }

  // // 🔥 3. HÀM CỨU HỘ: Xóa sạch cache giỏ hàng bị lỗi
  // // Gọi API này để fix lỗi "SyntaxError: Unexpected token"
  // @Get('cleanup-cart')
  // async cleanupCart() {
  //   // Tìm tất cả các key bắt đầu bằng "cart:" (ví dụ cart:1, cart:2...)
  //   const keys = await this.redis.keys('cart:*');

  //   if (keys.length > 0) {
  //     // Xóa tất cả các key tìm được
  //     await this.redis.del(...keys);

  //     return {
  //       status: 'SUCCESS',
  //       message: `Đã xóa ${keys.length} key rác trong Redis.`,
  //       deletedKeys: keys,
  //     };
  //   }

  //   return {
  //     status: 'CLEAN',
  //     message: 'Redis sạch sẽ, không tìm thấy cache giỏ hàng nào.',
  //   };
  // }
}