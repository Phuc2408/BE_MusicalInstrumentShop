import { Body, Controller, InternalServerErrorException, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('v1/orders')
export class OrderController {

  private readonly logger = new Logger(OrderController.name);

  constructor(private readonly orderService: OrderService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Req() req, @Body() createOrderDto: CreateOrderDto) {

    const userId = req.user.user_id;
    const result = await this.orderService.createOrder(userId, createOrderDto);
    if (result) {
      return {
        orderId: result.order_id,
        redirectUrl: result.redirect_url
      };
    }
    throw new InternalServerErrorException('Không thể tạo đơn hàng. Vui lòng kiểm tra lại giỏ hàng hoặc thử lại sau.');
  }
}
