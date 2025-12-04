import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsPhoneNumber,
    IsInt,
    Min,
    ValidateNested,
    IsArray,
    ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export enum PaymentMethod {
    COD = 'COD',
    VNPAY = 'VNPAY',
}

export enum DeliveryMethod {
    FREE = 'free',
    FLAT = 'flat',
}

/**
 * Thông tin billing (khớp billingInfo trên FE)
 */
export class BillingInfoDto {
    @ApiProperty({
        description: 'Customer first name as shown in billing details.',
        example: 'Phuc',
    })
    @IsNotEmpty({ message: 'First name không được để trống.' })
    @IsString({ message: 'First name phải là chuỗi.' })
    firstName: string;

    @ApiProperty({
        description: 'Customer last name as shown in billing details.',
        example: 'Nguyen',
    })
    @IsNotEmpty({ message: 'Last name không được để trống.' })
    @IsString({ message: 'Last name phải là chuỗi.' })
    lastName: string;

    @ApiProperty({
        description: 'Billing / shipping address (Address Line 1).',
        example: '123 Le Loi, District 1',
    })
    @IsNotEmpty({ message: 'Địa chỉ giao hàng không được để trống.' })
    @IsString({ message: 'Địa chỉ phải là chuỗi.' })
    address: string;

    @ApiProperty({
        description: 'City or province of the customer.',
        example: 'Ho Chi Minh City',
    })
    @IsNotEmpty({ message: 'Thành phố / Tỉnh không được để trống.' })
    @IsString({ message: 'Thành phố / Tỉnh phải là chuỗi.' })
    city: string;

    @ApiProperty({
        description: 'Customer phone number in Vietnam format (E.164 or local).',
        example: '+84901234567',
    })
    @IsNotEmpty({ message: 'Số điện thoại không được để trống.' })
    @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ.' })
    phone: string;
}

/**
 * Một item trong giỏ hàng
 */
export class OrderItemDto {
    @ApiProperty({
        description: 'ID sản phẩm.',
        example: 1,
    })
    @IsInt({ message: 'productId phải là số nguyên.' })
    productId: number;

    @ApiProperty({
        description: 'Số lượng sản phẩm.',
        example: 2,
    })
    @IsInt({ message: 'Số lượng phải là số nguyên.' })
    @Min(1, { message: 'Số lượng tối thiểu là 1.' })
    quantity: number;
}

// DTO cho request tạo order (checkout)
export class CreateOrderDto {
    @ApiProperty({
        description: 'Danh sách sản phẩm trong đơn hàng.',
        type: [OrderItemDto],
    })
    @IsArray({ message: 'items phải là một mảng.' })
    @ArrayMinSize(1, { message: 'Đơn hàng phải có ít nhất 1 sản phẩm.' })
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items: OrderItemDto[];

    @ApiProperty({
        description: 'Thông tin thanh toán / giao hàng của khách.',
        type: BillingInfoDto,
    })
    @ValidateNested()
    @Type(() => BillingInfoDto)
    billing: BillingInfoDto;

    @ApiProperty({
        description: 'Phương thức giao hàng.',
        enum: DeliveryMethod,
        example: DeliveryMethod.FREE,
    })
    @IsEnum(DeliveryMethod, {
        message: 'Phương thức giao hàng không hợp lệ.',
    })
    delivery: DeliveryMethod;

    @ApiProperty({
        description: 'Phương thức thanh toán (FE: cod | banking).',
        enum: PaymentMethod,
        example: PaymentMethod.COD,
    })
    @IsNotEmpty({ message: 'Vui lòng chọn phương thức thanh toán.' })
    @Transform(({ value }) => {
        if (typeof value !== 'string') return value;

        const lower = value.toLowerCase();

        // FE gửi "banking" -> map thành "VNPAY"
        if (lower === 'banking') return PaymentMethod.VNPAY;

        // FE gửi "cod" -> map thành "COD"
        if (lower === 'cod') return PaymentMethod.COD;

        // Nếu FE gửi sẵn "VNPAY"/"COD" thì giữ nguyên
        return value;
    })
    @IsEnum(PaymentMethod, { message: 'Phương thức thanh toán không hợp lệ.' })
    payment: PaymentMethod;
}
