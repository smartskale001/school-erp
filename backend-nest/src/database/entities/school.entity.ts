import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Tenant root. Every multi-tenant table carries a `school_id` that points here
 * via a RESTRICT foreign key, so a school can never be deleted while any record
 * still references it. PK is a varchar code (e.g. `school_001`) to preserve the
 * existing `DEFAULT_SCHOOL_ID` values already stored across the schema.
 */
@Entity('schools')
export class SchoolEntity {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
