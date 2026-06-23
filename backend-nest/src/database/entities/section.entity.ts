import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SchoolClassEntity } from './class.entity';
import { TeacherEntity } from './teacher.entity';
import { RoomEntity } from './room.entity';

/**
 * A class-section ("Class 1 - A") as a first-class record.
 * Source of truth for class-teacher, homeroom and capacity.
 * The parent class still keeps a denormalized `sections: string[]`
 * mirror so the timetable engine (which keys off `${className}-${section}`)
 * keeps working unchanged.
 */
@Entity('sections')
@Unique('UQ_section_class_name', ['classId', 'name'])
export class SectionEntity {
  @PrimaryColumn({ length: 40 })
  id: string;

  @ManyToOne(() => SchoolClassEntity, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'class_id' })
  class: SchoolClassEntity;

  @Column({ name: 'class_id', length: 20 })
  classId: string;

  @Column({ length: 10 })
  name: string;

  @ManyToOne(() => TeacherEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'class_teacher_id' })
  classTeacher: TeacherEntity;

  @Column({ name: 'class_teacher_id', nullable: true, length: 20 })
  classTeacherId: string;

  @ManyToOne(() => RoomEntity, { eager: true, nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'room_id' })
  room: RoomEntity;

  @Column({ name: 'room_id', nullable: true, length: 20 })
  roomId: string;

  @Column({ default: 40 })
  capacity: number;

  @Column({ name: 'school_id', default: 'school_001', length: 50 })
  schoolId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
