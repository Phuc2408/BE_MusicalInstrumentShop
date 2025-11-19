import { Product } from "src/product/entities/product.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Cart } from "./cart.entity";

@Entity('cart_items')
export class CartItem { 
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ type: 'integer' }) 
    product_id: number; 

    @Column({ type: 'int', default: 1 })
    quantity: number;
    
    @ManyToOne(() => Cart, cart => cart.items)
    @JoinColumn({ name: 'cart_id' })
    cart: Cart;
    
    @ManyToOne(() => Product, product => product.cartItems)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @Column({ type: 'integer' }) 
    cart_id: number;
}