import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user') 
export class User {
  @PrimaryGeneratedColumn('increment', { name: 'user_id' }) 
  user_id: number;

  @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: false }) 
  full_name: string;

  @Column({ unique: true, nullable: false, length: 100 }) 
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true }) 
  passwordHash: string | null;

  @Column({ name: 'google_id', type: 'varchar', length: 100, unique: true, nullable: true }) 
  googleId: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  @Column({ type: 'date', nullable: true })
  dob: Date | null;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 100, nullable: true })
  refreshTokenHash: string | null; 

  @Column({ type: 'varchar', length: 20, default: 'customer' })
  role: 'customer' | 'admin'; 

  @Column({ name: 'login_method', type: 'varchar', length: 20, default: 'local' })
  loginMethod: 'local' | 'google'; 

  @CreateDateColumn({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // DEFAULT NOW()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }) // DEFAULT NOW()
  updatedAt: Date;
}