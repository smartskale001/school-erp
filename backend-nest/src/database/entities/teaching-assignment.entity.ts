import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';

@Entity('teaching_assignments')
@Unique(['teacherId', 'classId', 'section', 'subjectId', 'academicYearId'])
@Index(['teacherId', 'academicYearId', 'isActive'])
export class TeachingAssignmentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'teacher_id', length: 20 }) teacherId: string;
  @Column({ name: 'class_id', length: 20 }) classId: string;
  @Column({ length: 10 }) section: string;
  @Column({ name: 'subject_id', length: 20 }) subjectId: string;
  @Column({ name: 'academic_year_id', type: 'int' }) academicYearId: number;
  @Column({ name: 'school_id', default: 'school_001', length: 50 }) schoolId: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
