import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";

export enum OrderStatus {
    PENDING = 'PENDING',       // Chờ thanh toán (dành cho VNPAY)
    CONFIRMED = 'CONFIRMED',   // Đã xác nhận (dành cho COD hệ thống tự thay đổi)
    PAID = 'PAID',             // Đã thanh toán thành công (VNPAY Callback)
    SHIPPED = 'SHIPPED',       // Đang giao hàng (admin sẽ thay đổi thành trạng thái này)
    COMPLETED = 'COMPLETED',   // Đã hoàn thành (admin sẽ thay đổi thành trạng thái này)
    CANCELLED = 'CANCELLED',   // Bị hủy (do Cron Job hoặc Admin)
}

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    total_amount: number;

    @Column({ type: 'enum', enum: ['COD', 'VNPAY'], default: 'COD' })
    payment_method: 'COD' | 'VNPAY';

    @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
    status: OrderStatus;

    @Column({ type: 'text' })
    shipping_address: string;

    @Column({ type: 'varchar', length: 20 })
    phone: string; // Số điện thoại người nhận

    @OneToMany(() => OrderItem, item => item.order, { cascade: true })
    items: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}