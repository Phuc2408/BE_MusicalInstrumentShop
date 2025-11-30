import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderResponseDto {
    @ApiProperty({ example: 123 })
    order_id: number;

    @ApiProperty({
        enum: OrderStatus,
        example: OrderStatus.CONFIRMED,
    })
    status: OrderStatus;

    @ApiProperty({
        nullable: true,
        example: null,
        description:
            'URL để redirect tới cổng thanh toán nếu là VNPAY, null nếu thanh toán COD.',
    })
    redirect_url: string | null;
}
