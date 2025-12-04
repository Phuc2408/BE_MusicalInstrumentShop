import { Body, Controller, InternalServerErrorException, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderResponseDto } from './dto/order.response.dto';
import { ApiUnauthorized } from 'src/common/decorators/swagger.decorator';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@Controller('v1/orders')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class OrderController {

  constructor(private readonly orderService: OrderService) { }

  @Post()
  @ApiOperation({ summary: 'Checkout current cart and create an order' })
  @ApiUnauthorized('Checkout Failed')
  async create(@Req() req, @Body() createOrderDto: CreateOrderDto): Promise<CreateOrderResponseDto> {

    const userId = req.user.user_id;
    const result = await this.orderService.createOrder(userId, createOrderDto);
    if (!result) {
      throw new InternalServerErrorException(
        'Cannot create order, please try again later',
      );
    }
    return {
      order_id: result.order_id,
      status: result.status,
      redirect_url: result.redirect_url,
    };
  }
}
