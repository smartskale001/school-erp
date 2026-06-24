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
import { Role } from '../../common/enums/role.enum';
import { SchoolEntity } from './school.entity';
import { TeacherEntity } from './teacher.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', default: Role.STUDENT })
  role: Role;

  @ManyToOne(() => TeacherEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'teacher_id' })
  teacher: TeacherEntity;

  @Index()
  @Column({ name: 'teacher_id', nullable: true, length: 20 })
  teacherId: string;

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @Column({ name: 'refresh_token_hash', nullable: true, type: 'text' })
  refreshTokenHash: string;

  @Column({ name: 'fcm_token', nullable: true, type: 'text' })
  fcmToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
