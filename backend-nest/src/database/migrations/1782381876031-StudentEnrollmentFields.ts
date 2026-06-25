import { MigrationInterface, QueryRunner } from "typeorm";

export class StudentEnrollmentFields1782381876031 implements MigrationInterface {
    name = 'StudentEnrollmentFields1782381876031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" ADD "roll_no" integer`);
        await queryRunner.query(`ALTER TABLE "students" ADD "date_of_birth" date`);
        await queryRunner.query(`CREATE TYPE "public"."students_gender_enum" AS ENUM('male', 'female', 'other')`);
        await queryRunner.query(`ALTER TABLE "students" ADD "gender" "public"."students_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "students" ADD "admission_date" date`);
        await queryRunner.query(`ALTER TABLE "students" ADD "guardian_name" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "students" ADD "guardian_phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "students" ADD "guardian_email" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "students" ADD "contact_phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "students" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "students" ADD "blood_group" character varying(5)`);
        await queryRunner.query(`CREATE TYPE "public"."students_status_enum" AS ENUM('active', 'inactive', 'graduated', 'transferred')`);
        await queryRunner.query(`ALTER TABLE "students" ADD "status" "public"."students_status_enum" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "students" ADD "must_change_password" boolean NOT NULL DEFAULT false`);
        // Widen the admission-number column in place (preserves existing data + unique constraint).
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "studentId" TYPE character varying(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" ALTER COLUMN "studentId" TYPE character varying(5)`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "must_change_password"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."students_status_enum"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "blood_group"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "guardian_email"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "guardian_phone"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "guardian_name"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "admission_date"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "gender"`);
        await queryRunner.query(`DROP TYPE "public"."students_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "date_of_birth"`);
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "roll_no"`);
    }

}
