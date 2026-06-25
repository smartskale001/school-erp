import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { SchoolEntity } from './school.entity';
import { TeacherEntity } from './teacher.entity';
import { SchoolClassEntity } from './class.entity';
import { SubjectEntity } from './subject.entity';
import { AcademicYearEntity } from './academic-year.entity';

@Entity('teaching_assignments')
@Unique(['teacherId', 'classId', 'section', 'subjectId', 'academicYearId'])
@Index(['teacherId', 'academicYearId', 'isActive'])
export class TeachingAssignmentEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @ManyToOne(() => TeacherEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'teacher_id' }) teacher: TeacherEntity;
  @Column({ name: 'teacher_id', length: 20 }) teacherId: string;
  @ManyToOne(() => SchoolClassEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'class_id' }) class: SchoolClassEntity;
  @Index() @Column({ name: 'class_id', length: 20 }) classId: string;
  @Column({ length: 10 }) section: string;
  @ManyToOne(() => SubjectEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'subject_id' }) subject: SubjectEntity;
  @Index() @Column({ name: 'subject_id', length: 20 }) subjectId: string;
  @ManyToOne(() => AcademicYearEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'academic_year_id' }) academicYear: AcademicYearEntity;
  @Index() @Column({ name: 'academic_year_id', type: 'int' }) academicYearId: number;
  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false }) @JoinColumn({ name: 'school_id' }) school: SchoolEntity;
  @Index() @Column({ name: 'school_id', default: 'school_001', length: 50 }) schoolId: string;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
