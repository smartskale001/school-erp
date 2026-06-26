import { join } from 'path';
import { DataSourceOptions } from 'typeorm';
import { SchoolEntity } from './entities/school.entity';
import { UserEntity } from './entities/user.entity';
import { SubjectEntity } from './entities/subject.entity';
import { TeacherEntity } from './entities/teacher.entity';
import { SchoolClassEntity } from './entities/class.entity';
import { SectionEntity } from './entities/section.entity';
import { RoomEntity } from './entities/room.entity';
import { PeriodEntity } from './entities/period.entity';
import { TaskEntity } from './entities/task.entity';
import { TaskAssignmentEntity } from './entities/task-assignment.entity';
import { LeaveApplicationEntity } from './entities/leave-application.entity';
import { ProxyAssignmentEntity } from './entities/proxy-assignment.entity';
import { TimetableEntity } from './entities/timetable.entity';
import { TimetableSettingsEntity } from './entities/timetable-settings.entity';
import { AttendanceEntity } from './entities/attendance.entity';
import { FeeEntity } from './entities/fee.entity';
import { ReportEntity } from './entities/report.entity';
import { NotificationEntity } from './entities/notification.entity';
import { AcademicYearEntity } from './entities/academic-year.entity';
import { TeacherLeaveBalanceEntity } from './entities/teacher-leave-balance.entity';
import { FeedbackEntity } from './entities/feedback.entity';
import { StudentEntity } from './entities/student.entity';
import { CircularEntity } from './entities/circular.entity';
import { MailboxEntity } from './entities/mailbox.entity';
import { AchievementEntity } from './entities/achievement.entity';
import { MessageEntity } from './entities/message.entity';
import { HomeworkEntity } from './entities/homework.entity';
import { HomeworkAssignmentEntity } from './entities/homework-assignment.entity';
import { HomeworkSubmissionEntity } from './entities/homework-submission.entity';
import { TeachingAssignmentEntity } from './entities/teaching-assignment.entity';
import { SyllabusEntity } from './entities/syllabus.entity';
import { SyllabusChapterEntity } from './entities/syllabus-chapter.entity';
import { QuizAnswerEntity } from './entities/quiz-answer.entity';
import { QuizAttemptEntity } from './entities/quiz-attempt.entity';
import { QuizEntity } from './entities/quiz.entity';
import { QuizQuestionEntity } from './entities/quiz-question.entity';
/**
 * Single source of truth for the list of registered entities. Imported by the
 * Nest TypeORM module, the standalone CLI DataSource, and the seed script so
 * the three never drift apart.
 */
export const ALL_ENTITIES = [
  SchoolEntity,
  QuizAnswerEntity,
  QuizAttemptEntity,
  QuizQuestionEntity,
  QuizEntity,
  UserEntity,
  SubjectEntity,
  TeacherEntity,
  SchoolClassEntity,
  SectionEntity,
  RoomEntity,
  PeriodEntity,
  TaskEntity,
  TaskAssignmentEntity,
  LeaveApplicationEntity,
  ProxyAssignmentEntity,
  TimetableEntity,
  TimetableSettingsEntity,
  AttendanceEntity,
  FeeEntity,
  ReportEntity,
  NotificationEntity,
  AcademicYearEntity,
  TeacherLeaveBalanceEntity,
  FeedbackEntity,
  StudentEntity,
  CircularEntity,
  MailboxEntity,
  AchievementEntity,
  MessageEntity,
  HomeworkEntity,
  HomeworkAssignmentEntity,
  HomeworkSubmissionEntity,
  TeachingAssignmentEntity,
  SyllabusEntity,
  SyllabusChapterEntity,
];

type EnvGet = (key: string) => string | undefined;

/**
 * Builds the TypeORM connection options from an environment getter. The same
 * builder backs both runtime (NestJS `ConfigService`) and the CLI/seed
 * (`process.env`), so connection, SSL, entity, and migration config stay in
 * one place.
 *
 * Schema policy:
 * - `synchronize` is OFF by default and can only be opted into for local dev
 *   via `DB_SYNCHRONIZE=true`; it is force-disabled in production.
 * - `migrationsRun` is always `false` — migrations are applied as an explicit
 *   deploy step (`npm run migration:run` / `migration:run:prod`), never on boot.
 */
export function buildDataSourceOptions(get: EnvGet): DataSourceOptions {
  const isProd = get('NODE_ENV') === 'production';
  const url = get('DATABASE_URL');

  const common = {
    type: 'postgres' as const,
    entities: ALL_ENTITIES,
    // Matches both the TS sources (CLI in dev) and compiled JS (runtime/deploy).
    migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    synchronize: !isProd && get('DB_SYNCHRONIZE') === 'true',
    migrationsRun: false,
    // Quiet by default (errors + warnings only). Set DB_LOGGING=true to see every
    // SQL query — useful for debugging, very noisy otherwise.
    logging: get('DB_LOGGING') === 'true' ? true : (['error', 'warn'] as ('error' | 'warn')[]),
    ssl: isProd ? { rejectUnauthorized: false } : false,
  };

  if (url) {
    return { ...common, url };
  }

  return {
    ...common,
    host: get('DB_HOST') ?? 'localhost',
    port: Number(get('DB_PORT') ?? 5432),
    username: get('DB_USERNAME') ?? 'postgres',
    password: get('DB_PASSWORD') ?? 'postgres',
    database: get('DB_NAME') ?? 'school_erp',
  };
}
