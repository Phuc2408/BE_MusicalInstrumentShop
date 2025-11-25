import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartItem } from "./cart-item.entity";

@Entity('carts')
export class Cart { 
    @PrimaryGeneratedColumn() 
    id: number;
    
    @OneToOne(() => User, user => user.cart, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id', nullable: true, unique: true, type: 'integer' }) 
    userId: number;
    
    @Column({ type: 'boolean', default: false })
    is_converted: boolean;
    
    @OneToMany(() => CartItem, item => item.cart, { cascade: true })
    items: CartItem[];
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}