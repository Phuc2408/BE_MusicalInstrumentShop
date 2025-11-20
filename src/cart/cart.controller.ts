import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('v1/cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    getCart(@Req() req) {
        const userId = req.user.user_id;
        return this.cartService.getCart(userId);
    }

    @Post('items')
    addToCart(@Req() req, @Body() dto: AddToCartDto) {
        const userId = req.user.user_id;
        return this.cartService.addToCart(userId, dto);
    }

    @Patch('items/:productId')
    updateQuantity(
        @Req() req,
        @Param('productId') productId: number,
        @Body() dto: UpdateCartItemDto
    ) {
        return this.cartService.updateQuantity(req.user.user_id, +productId, dto);
    }

    @Delete('items/:productId')
    removeFromCart(@Req() req, @Param('productId') productId: number) {
        const userId = req.user.user_id;
        return this.cartService.removeFromCart(userId, +productId);
    }

    @Delete()
    clearCart(@Req() req) {
        const userId = req.user.user_id;
        return this.cartService.clearCart(userId);
    }

    @Post('sync')
    async syncCart(
        @Req() req,
        @Body() body: { guest_cart_items: AddToCartDto[] }
    ) {
        const userId = req.user.user_id;
        const items = body.guest_cart_items;

        if (!items || items.length === 0) {
            return this.cartService.getCart(userId);
        }

        const syncPromises = items.map(async (item) => {
            try {
                await this.cartService.addToCart(userId, item);
            } catch (e) {
                console.warn(`Lỗi sync sản phẩm ID ${item.productId}:`, e.message);
            }
        });

        await Promise.all(syncPromises);

        return this.cartService.getCart(userId);
    }
}
