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
import { SectionEntity } from './section.entity';
import { EnrollmentStatus } from '../../students/enums/enrollment-status.enum';
import { Gender } from '../../students/enums/gender.enum';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * School-visible Admission Number (permanent, unique). Auto-generated on
   * enrollment, e.g. "JS-2026-0042". Doubles as the student login identifier.
   * (Property kept named `studentId` for back-compat with auth/attendance.)
   */
  @Column({ unique: true, length: 20 })
  studentId: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ unique: true, length: 255, nullable: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ length: 100 })
  className: string;

  @Column({ length: 10 })
  section: string;

  /** Per-section roll number (can change yearly). */
  @Column({ name: 'roll_no', type: 'int', nullable: true })
  rollNo: number;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ name: 'admission_date', type: 'date', nullable: true })
  admissionDate: string;

  @Column({ name: 'guardian_name', length: 255, nullable: true })
  guardianName: string;

  @Column({ name: 'guardian_phone', length: 20, nullable: true })
  guardianPhone: string;

  @Column({ name: 'guardian_email', length: 255, nullable: true })
  guardianEmail: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true })
  contactPhone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'blood_group', length: 5, nullable: true })
  bloodGroup: string;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.ACTIVE })
  status: EnrollmentStatus;

  @Column({ name: 'must_change_password', type: 'boolean', default: false })
  mustChangePassword: boolean;

  @ManyToOne(() => SectionEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'section_id' })
  section_ref: SectionEntity;

  @Index()
  @Column({ name: 'section_id', nullable: true, length: 40 })
  sectionId: string;

  @Column({ name: 'refresh_token_hash', nullable: true, type: 'text' })
  refreshTokenHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
