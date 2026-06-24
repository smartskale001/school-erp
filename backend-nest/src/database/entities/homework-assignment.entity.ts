import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { HomeworkEntity } from './homework.entity';

export enum HomeworkAssignmentStatus { PUBLISHED = 'published', CANCELLED = 'cancelled' }

@Entity('homework_assignments')
@Unique(['homeworkId', 'section'])
@Index(['section', 'deadline'])
@Index(['homeworkId'])
export class HomeworkAssignmentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => HomeworkEntity, { onDelete: 'CASCADE', nullable: false }) @JoinColumn({ name: 'homework_id' }) homework: HomeworkEntity;
  @Column({ name: 'homework_id', type: 'uuid' }) homeworkId: string;
  @Column({ length: 10 }) section: string;
  @Column({ type: 'timestamptz' }) deadline: Date;
  @Column({ name: 'published_at', type: 'timestamptz' }) publishedAt: Date;
  @Column({ type: 'varchar', length: 20, default: HomeworkAssignmentStatus.PUBLISHED }) status: HomeworkAssignmentStatus;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
