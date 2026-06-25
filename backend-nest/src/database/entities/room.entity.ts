import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SchoolEntity } from './school.entity';

@Entity('rooms')
export class RoomEntity {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 'classroom', length: 30 })
  type: string;

  @Column({ default: 30 })
  capacity: number;

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
