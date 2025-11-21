import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cart')
@UseGuards(AuthGuard('jwt'))
@Controller('v1/cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve the user cart' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getCart(@Req() req) {
        const userId = req.user.user_id;
        return this.cartService.getCart(userId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Add an item to the cart' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    addToCart(@Req() req, @Body() dto: AddToCartDto) {
        const userId = req.user.user_id;
        return this.cartService.addToCart(userId, dto);
    }

    @Patch('items/:productId')
    @ApiOperation({ summary: 'Update the quantity of an item in the cart' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    updateQuantity(
        @Req() req,
        @Param('productId') productId: number,
        @Body() dto: UpdateCartItemDto
    ) {
        return this.cartService.updateQuantity(req.user.user_id, +productId, dto);
    }

    @Delete('items/:productId')
    @ApiOperation({ summary: 'Remove an item from the cart' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    removeFromCart(@Req() req, @Param('productId') productId: number) {
        const userId = req.user.user_id;
        return this.cartService.removeFromCart(userId, +productId);
    }

    @Delete()
    @ApiOperation({ summary: 'Clear the entire cart' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    clearCart(@Req() req) {
        const userId = req.user.user_id;
        return this.cartService.clearCart(userId);
    }

    @Post('sync')
    @ApiOperation({ summary: 'Synchronize guest cart items with user cart' })
    @ApiResponse({ status: 200, description: 'Success' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
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
