import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Polymorphic recipient: users.id (staff) OR students.id (students). Both PKs
  // are uuid, but because the target spans two tables there is intentionally NO
  // FK here (same rationale as messages.sender_id/receiver_id).
  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ default: 'task' })
  type: string;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
