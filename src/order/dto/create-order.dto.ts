import { IsNotEmpty, IsString, IsEnum, IsPhoneNumber } from 'class-validator';

export class CreateOrderDto {
    @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống.' })
    @IsString()
    address: string;

    @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
    @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ.' })
    phone: string;

    @IsNotEmpty({ message: 'Vui lòng chọn phương thức thanh toán.' })
    @IsEnum(['COD', 'VNPAY'], { message: 'Phương thức thanh toán không hợp lệ.' })
    paymentMethod: 'COD' | 'VNPAY';
}