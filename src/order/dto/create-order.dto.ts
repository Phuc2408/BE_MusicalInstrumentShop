import { IsNotEmpty, IsString, IsEnum, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({
        description: 'Shipping address for the order.',
        example: '123 Le Loi, District 1, Ho Chi Minh City',
    })
    @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống.' })
    @IsString()
    address: string;

    @ApiProperty({
        description: 'Customer phone number in Vietnam format (E.164 or local).',
        example: '+84901234567',
    })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
    @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ.' })
    phone: string;

    @ApiProperty({
        description: 'Payment method for the order.',
        enum: ['COD', 'VNPAY'],
        example: 'COD',
    })
    @IsNotEmpty({ message: 'Vui lòng chọn phương thức thanh toán.' })
    @IsEnum(['COD', 'VNPAY'], { message: 'Phương thức thanh toán không hợp lệ.' })
    paymentMethod: 'COD' | 'VNPAY';
}