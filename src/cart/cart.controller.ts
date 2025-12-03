import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { AuthGuard } from '@nestjs/passport';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApiBadRequest, ApiCreatedResponseData, ApiNotFound, ApiOkResponseData, ApiUnauthorized } from 'src/common/decorators/swagger.decorator';
import { CartDataWrapperDto } from './dto/cart.response.dto';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('v1/cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    @ApiOperation({ summary: 'Retrieve the user cart' })
    @ApiOkResponseData(CartDataWrapperDto)
    @ApiUnauthorized()
    getCart(@Req() req): Promise<CartDataWrapperDto> {
        const userId = req.user.user_id;
        return this.cartService.getCart(userId);
    }

    @Post('items')
    @ApiOperation({ summary: 'Add an item to the cart' })
    @ApiCreatedResponseData(CartDataWrapperDto)
    @ApiBadRequest('Invalid product or insufficient stock')
    @ApiUnauthorized()
    @ApiNotFound('Product not exist')
    addToCart(@Req() req, @Body() dto: AddToCartDto): Promise<CartDataWrapperDto> {
        const userId = req.user.user_id;
        return this.cartService.addToCart(userId, dto);
    }

    @Patch('items/:productId')
    @ApiOperation({ summary: 'Update the quantity of an item in the cart' })
    @ApiOkResponseData(CartDataWrapperDto)
    @ApiBadRequest()
    @ApiUnauthorized()
    @ApiNotFound('Cart not found | Item not found')
    updateQuantity(
        @Req() req,
        @Param('productId') productId: number,
        @Body() dto: UpdateCartItemDto
    ): Promise<CartDataWrapperDto> {
        return this.cartService.updateQuantity(req.user.user_id, +productId, dto);
    }

    @Delete('items/:productId')
    @ApiOperation({ summary: 'Remove an item from the cart' })
    @ApiOkResponseData(CartDataWrapperDto)
    @ApiUnauthorized()
    removeFromCart(@Req() req, @Param('productId') productId: number): Promise<CartDataWrapperDto> {
        const userId = req.user.user_id;
        return this.cartService.removeFromCart(userId, +productId);
    }

    @Delete()
    @ApiOperation({ summary: 'Clear the entire cart' })
    @ApiOkResponseData(CartDataWrapperDto)
    @ApiUnauthorized()
    clearCart(@Req() req): Promise<CartDataWrapperDto> {
        const userId = req.user.user_id;
        return this.cartService.clearCart(userId);
    }

    @Post('sync')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Synchronize guest cart items with user cart' })
    @ApiOkResponseData(CartDataWrapperDto)
    async syncCart(
        @Req() req,
        @Body() body: { guest_cart_items: AddToCartDto[] }
    ): Promise<CartDataWrapperDto> {
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
