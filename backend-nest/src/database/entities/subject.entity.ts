import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { TeacherEntity } from './teacher.entity';
import { SchoolEntity } from './school.entity';

@Entity('subjects')
export class SubjectEntity {
  @OneToMany(() => TeacherEntity, (teacher) => teacher.subject)
  teachers: TeacherEntity[];

  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  code: string;

  @Column({ name: 'periods_per_week' })
  periodsPerWeek: number;

  @Column({ name: 'is_elective', default: false })
  isElective: boolean;

  @Column({ type: 'int', default: 5 })
  difficulty: number;

  @Column('text', { array: true, name: 'grade_level', default: [] })
  gradeLevel: string[];

  @ManyToOne(() => SchoolEntity, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: SchoolEntity;

  @Index()
  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
