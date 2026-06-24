import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AttendanceStatus } from '../../attendance/enums/attendance-status.enum';
import { SchoolClassEntity } from './class.entity';
import { TeacherEntity } from './teacher.entity';
import { SubjectEntity } from './subject.entity';
import { PeriodEntity } from './period.entity';
import { StudentEntity } from './student.entity';

@Entity('attendance_records')
@Unique(['studentId', 'date'])
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StudentEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'student_id' })
  student: StudentEntity;

  @Index()
  @Column({ name: 'student_id', type: 'uuid' })
  studentId: string;

  @ManyToOne(() => SchoolClassEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClassEntity;

  @Index()
  @Column({ name: 'class_id', length: 20 })
  classId: string;

  @Column({ length: 10, nullable: true })
  section: string;

  @Index()
  @Column({ type: 'date' })
  date: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @ManyToOne(() => TeacherEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'marked_by_teacher_id' })
  markedByTeacher: TeacherEntity;

  @Index()
  @Column({ name: 'marked_by_teacher_id', length: 20, nullable: true })
  markedByTeacherId: string;

  @ManyToOne(() => SubjectEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject: SubjectEntity;

  @Index()
  @Column({ name: 'subject_id', length: 20, nullable: true })
  subjectId: string;

  @ManyToOne(() => PeriodEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'period_id' })
  period: PeriodEntity;

  @Index()
  @Column({ name: 'period_id', length: 20, nullable: true })
  periodId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
