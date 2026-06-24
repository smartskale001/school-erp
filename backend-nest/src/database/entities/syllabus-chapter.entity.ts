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
import { SyllabusEntity } from './syllabus.entity';

export enum SyllabusChapterStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Entity('syllabus_chapters')
export class SyllabusChapterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => SyllabusEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'syllabus_id' })
  syllabus: SyllabusEntity;

  @Index()
  @Column({ name: 'syllabus_id', type: 'uuid' })
  syllabusId: string;

  @Column({ name: 'chapter_name', length: 255 })
  chapterName: string;

  @Column({ name: 'chapter_number' })
  chapterNumber: number;

  @Column({ type: 'varchar', default: SyllabusChapterStatus.PENDING })
  status: string;

  @Column({ name: 'completed_date', type: 'date', nullable: true })
  completedDate: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
