import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

@Entity('password_reset_tokens')
export class PasswordResetToken{
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    token: string;
    
    @Column({ name: 'user_id' })
    userId: number; 

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
    user: User;
    
    @Column({ type: 'timestamp' })
    expiresAt: Date;
    
    @Column({ type: 'boolean', default: false })
    used: boolean;
    
    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}