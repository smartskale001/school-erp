import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { SchoolEntity } from './school.entity';
import { UserEntity } from './user.entity';

export enum CircularCategory {
  HOLIDAY = 'Holiday',
  EXAMINATION = 'Examination',
  EVENT = 'Event',
  FEES = 'Fees',
  LIBRARY = 'Library',
  MEETING = 'Meeting',
  GENERAL = 'General',
}

@Entity('circulars')
export class CircularEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', default: CircularCategory.GENERAL })
  category: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'created_by' })
  creator: UserEntity;

  @Index()
  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'created_by_role', length: 50 })
  createdByRole: string;

  @Column({ name: 'is_published', default: true })
  isPublished: boolean;

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
