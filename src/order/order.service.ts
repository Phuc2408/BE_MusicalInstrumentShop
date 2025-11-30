import { BadRequestException, Injectable } from '@nestjs/common';
import { CartService } from 'src/cart/cart.service';
import { DataSource, Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrderDto, PaymentMethod } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Product } from 'src/product/entities/product.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class OrderService {
    constructor(
        private dataSource: DataSource,
        private cartService: CartService,
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        private usersService: UsersService,
        private mailService: MailerService,
    ) { }

    async createOrder(userId: number, dto: CreateOrderDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const cart = await this.cartService.getRawCart(userId)
            if (!cart || cart.items.length === 0) {
                throw new BadRequestException('Cart is empty')
            }

            let totalAmount = 0;
            const orderItems: OrderItem[] = [];

            for (const item of cart.items) {
                const product = await queryRunner.manager.findOne(Product,
                    {
                        where: { id: item.product.id },
                        lock: { mode: 'pessimistic_write' }
                    }
                )
                if (!product || product.stock_quantity < item.quantity) {
                    throw new BadRequestException(`Sản phẩm ${product?.product_name} không đủ hàng.`);
                }

                product.stock_quantity -= item.quantity;
                await queryRunner.manager.save(Product, product);

                //Create OrderItem per item in CartItem[]
                const orderItem = new OrderItem();
                orderItem.product_id = product.id;
                orderItem.quantity = item.quantity;
                orderItem.price = product.price_numeric; // Save price
                orderItems.push(orderItem);
                totalAmount += Number(product.price_numeric) * item.quantity;
            }

            const order = new Order();
            order.userId = userId;
            order.shipping_address = dto.billing.address;
            order.phone = dto.billing.phone;
            order.total_amount = totalAmount;
            order.payment_method = dto.payment;
            order.status = OrderStatus.PENDING;

            const savedOrder = await queryRunner.manager.save(Order, order);

            for (const item of orderItems) {
                item.order_id = savedOrder.id;
            }
            await queryRunner.manager.save(OrderItem, orderItems);

            await this.cartService.clearCart(userId, queryRunner.manager);

            // Commit successful transaction
            await queryRunner.commitTransaction();

            // Run clearCart without queryRunner.manager to clear cart in Redis
            await this.cartService.clearCart(userId);

            if (dto.payment === PaymentMethod.COD) {
                // Update status of order with CONFIRMED status
                const finalOrder = await this.orderRepository.save({
                    id: savedOrder.id,
                    status: OrderStatus.CONFIRMED
                });

                await this.sendOrderConfirmationEmail(
                    userId,
                    finalOrder.id,
                    totalAmount,
                    order.shipping_address,
                    order.payment_method,
                );

                return { order_id: finalOrder.id, status: finalOrder.status, redirect_url: null };
            }

        }
        catch (err) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
    private async sendOrderConfirmationEmail(
        userId: number,
        orderId: number,
        totalAmount: number,
        shippingAddress: string,
        paymentMethod: string,
    ): Promise<void> {
        try {
            const user = await this.usersService.findOneById(userId);
            if (!user || !user.email) {
                console.log(
                    `Order ${orderId}: user ${userId} không có email, bỏ qua gửi mail.`,
                );
                return;
            }

            await this.mailService.sendOrderConfirmationEmail(
                user.email,
                user.full_name || 'User',
                {
                    orderId,
                    totalAmount,
                    shippingAddress,
                    paymentMethod,
                },
            );
        } catch (err) {
            console.error(
                `Failed to send order confirmation email for order ${orderId}:`,
                err,
            );
        }
    }
}
