import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart-item.entity';
import { Product } from 'src/product/entities/product.entity';
import Redis from 'ioredis';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(Cart)
        private cartRepository: Repository<Cart>,
        @InjectRepository(CartItem)
        private cartItemRepository: Repository<CartItem>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @Inject('REDIS_CLIENT') private readonly redis: Redis,
    ) { }

    private getRedisKey(userId: number): string {
        return `cart:${userId}`;
    }

    private async getCartFromDb(userId: number) {
        const cart = await this.cartRepository.findOne({
            where: { userId },
            relations: ['items', 'items.product', 'items.product.images'],
        })

        if (!cart || !cart.items || cart.items.length === 0) return [];

        const formattedItems = cart.items.map((item) => {
            const prod = item.product;
            const mainImage = prod.images?.find(img => img.is_main) || prod.images?.[0] || null;
            const displayPrice = prod.price_display
                ? prod.price_display
                : Number(prod.price_numeric).toLocaleString('vi-VN') + 'đ';
            return {
                productId: prod.id,
                quantity: item.quantity,
                product: {
                    id: prod.id,
                    product_name: prod.product_name,
                    slug: prod.slug,
                    price_display: displayPrice,
                    price_numeric: prod.price_numeric,
                    stock_quantity: prod.stock_quantity,
                    main_image: mainImage,
                },
            }
        })
        return formattedItems;
    }

    private async refreshRedisCart(userId: number) {
        const freshItems = await this.getCartFromDb(userId);
        const key = this.getRedisKey(userId);

        if (freshItems.length > 0) {
            await this.redis.set(key, JSON.stringify(freshItems), 'EX', 3600);
        } else {
            await this.redis.del(key); // Nếu giỏ rỗng thì xóa cache
        }

        return { data: { cart_items: freshItems } };
    }

    async getCart(userId: number) {
        const key = this.getRedisKey(userId);

        // B1: Đọc từ Redis (Tốc độ mili-giây)
        const cachedCart = await this.redis.get(key);

        if (cachedCart) {
            try {
                // 🔥 [FIX QUAN TRỌNG]: Thử Parse JSON
                // Nếu cachedCart là rác (vd: "cart:1"), dòng này sẽ gây lỗi và nhảy xuống catch
                const parsedCart = JSON.parse(cachedCart);

                // Nếu parse thành công, trả về ngay
                return { data: { cart_items: parsedCart } };
            } catch (error) {
                // 🚑 CẤP CỨU: Nếu lỗi JSON.parse -> Redis đang chứa rác!
                console.warn(`[Redis Error] Cache của user ${userId} bị hỏng (Format sai). Đang tự động xóa...`);

                // Xóa ngay cái key bị lỗi đi để lần sau không gặp lại
                await this.redis.del(key);

                // Không return lỗi, mà để code chạy tiếp xuống dưới để lấy từ DB (Fallback)
            }
        }

        // B2: Cache Miss (Hoặc vừa xóa Cache lỗi): Đọc từ Neon (Source of Truth)
        // console.log(`Cache miss cho user ${userId}, đang đọc từ Database...`);
        const cartItems = await this.getCartFromDb(userId);

        // B3: "Châm" lại vào Redis (Lưu 1 giờ)
        // Chỉ lưu nếu có dữ liệu để tránh cache rác
        if (cartItems.length > 0) {
            await this.redis.set(key, JSON.stringify(cartItems), 'EX', 3600);
        } else {
            // Nếu DB rỗng thì xóa luôn key trong Redis (nếu có) cho đồng bộ
            await this.redis.del(key);
        }

        return { data: { cart_items: cartItems } };
    }

    async addToCart(userId: number, dto: AddToCartDto) {
        let cart = await this.cartRepository.findOne({
            where: { userId }
        })

        if (!cart) {
            cart = this.cartRepository.create({ userId });
            await this.cartRepository.save(cart);
        }

        // Kiểm tra product còn trong kho hay không
        const product = await this.productRepository.findOneBy({ id: dto.productId })
        if (!product) throw new NotFoundException('Product not exist');

        if (product.stock_quantity < dto.quantity) {
            throw new Error(`${product.stock_quantity} product left.`);
        }

        let cartItem = await this.cartItemRepository.findOne({
            where: { cart_id: cart.id, product_id: dto.productId },
        });

        if (cartItem) {
            cartItem.quantity += dto.quantity;
        }
        else {
            cartItem = this.cartItemRepository.create({
                cart: cart,
                product_id: dto.productId,
                quantity: dto.quantity,
            });
        }

        await this.cartItemRepository.save(cartItem);

        return this.refreshRedisCart(userId)
    }

    async updateQuantity(userId: number, productId: number, dto: UpdateCartItemDto) {
        const cart = await this.cartRepository.findOne({ where: { userId } });
        if (!cart) throw new NotFoundException('Cart not found');

        const cartItem = await this.cartItemRepository.findOne({
            where: { cart_id: cart.id, product_id: productId },
        });

        if (!cartItem) throw new NotFoundException('Item not found');

        cartItem.quantity = dto.quantity;
        await this.cartItemRepository.save(cartItem);

        return this.refreshRedisCart(userId);
    }

    async removeFromCart(userId: number, productId: number) {
        const cart = await this.cartRepository.findOne({ where: { userId } });
        if (cart) {
            await this.cartItemRepository.delete({ cart_id: cart.id, product_id: productId });
        }
        return this.refreshRedisCart(userId);
    }

    async deleteCart(userId: number) {
        const cart = await this.cartRepository.findOne({ where: { userId } });
        if (cart) {
            await this.cartItemRepository.delete({ cart_id: cart.id });
        }

        await this.redis.del(this.getRedisKey(userId));

        return { data: { cart_items: [] } };
    }
}
