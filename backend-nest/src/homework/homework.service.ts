import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeworkEntity, HomeworkStatus } from '../database/entities/homework.entity';
import { StudentHomeworkEntity, StudentHomeworkStatus } from '../database/entities/student-homework.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { CreateHomeworkDto, UpdateHomeworkDto, UpdateStudentHomeworkStatusDto } from './dto/homework.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { AcademicYearsService } from '../academic-years/academic-years.service';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(HomeworkEntity)
    private homeworkRepo: Repository<HomeworkEntity>,
    @InjectRepository(StudentHomeworkEntity)
    private studentHomeworkRepo: Repository<StudentHomeworkEntity>,
    @InjectRepository(StudentEntity)
    private studentRepo: Repository<StudentEntity>,
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private notificationsService: NotificationsService,
    private academicYearService: AcademicYearsService,
  ) {}

  async createHomework(dto: CreateHomeworkDto, teacherId: string, teacherName: string) {
    const activeYear = await this.academicYearService.getActiveAcademicYear();

    const homework = this.homeworkRepo.create({
      ...dto,
      teacherId,
      teacherName,
      status: HomeworkStatus.ACTIVE,
      academicYearId: activeYear.id,
    });
    const savedHomework = await this.homeworkRepo.save(homework);

    // Get all students for the class
    const students = await this.studentRepo.find({ where: { className: dto.className } }); // Note: Using className as proxy for classId based on entity structure

    if (students.length > 0) {
      const studentHomeworks = students.map(student => 
        this.studentHomeworkRepo.create({
          homeworkId: savedHomework.id,
          studentId: student.id,
          status: StudentHomeworkStatus.PENDING,
        })
      );
      await this.studentHomeworkRepo.save(studentHomeworks);

      // Trigger Notifications
      for (const student of students) {
        if (!student.email) continue;
        const user = await this.userRepo.findOne({ where: { email: student.email } });
        if (user) {
          await this.notificationsService.create(
            user.id,
            'New Homework Assigned',
            `New homework assigned in ${dto.subjectName}: ${dto.title}`,
            'task' // using 'task' as it routes to /tasks
          ).catch(() => {});
        }
      }
    }

    return savedHomework;
  }

  async updateHomework(id: string, dto: UpdateHomeworkDto, teacherId: string, isAdmin: boolean) {
    const homework = await this.homeworkRepo.findOne({ where: { id } });
    if (!homework) throw new NotFoundException('Homework not found');

    if (!isAdmin && homework.teacherId !== teacherId) {
      throw new ForbiddenException('Cannot update this homework');
    }

    await this.homeworkRepo.update(id, dto);
    return this.homeworkRepo.findOne({ where: { id } });
  }

  async deleteHomework(id: string, teacherId: string, isAdmin: boolean) {
    const homework = await this.homeworkRepo.findOne({ where: { id } });
    if (!homework) throw new NotFoundException('Homework not found');

    if (!isAdmin && homework.teacherId !== teacherId) {
      throw new ForbiddenException('Cannot delete this homework');
    }

    await this.studentHomeworkRepo.delete({ homeworkId: id });
    await this.homeworkRepo.delete(id);
    return { success: true };
  }

  async getTeacherHomework(teacherId: string) {
    return this.homeworkRepo.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });
  }

  async getClassHomework(classId: string) {
    return this.homeworkRepo.find({
      where: { classId },
      order: { createdAt: 'DESC' },
    });
  }

  // --- Student operations ---

  async getStudentHomework(studentId: string) {
    const studentHomeworks = await this.studentHomeworkRepo.find({
      where: { studentId },
      order: { createdAt: 'DESC' },
    });

    if (studentHomeworks.length === 0) return [];

    const homeworkIds = studentHomeworks.map(sh => sh.homeworkId);
    const homeworks = await this.homeworkRepo
      .createQueryBuilder('h')
      .where('h.id IN (:...ids)', { ids: homeworkIds })
      .getMany();

    const homeworkMap = Object.fromEntries(homeworks.map(h => [h.id, h]));

    return studentHomeworks.map(sh => ({
      ...sh,
      homework: homeworkMap[sh.homeworkId] || null,
    }));
  }

  async updateStudentHomeworkStatus(homeworkId: string, studentId: string, dto: UpdateStudentHomeworkStatusDto) {
    const studentHomework = await this.studentHomeworkRepo.findOne({
      where: { homeworkId, studentId }
    });

    if (!studentHomework) throw new NotFoundException('Student homework not found');

    const updates: Partial<StudentHomeworkEntity> = { status: dto.status };
    if (dto.status === StudentHomeworkStatus.COMPLETED) {
      updates.completedAt = new Date();
    }
    if (dto.remarks) {
      updates.remarks = dto.remarks;
    }

    await this.studentHomeworkRepo.update(studentHomework.id, updates);
    return this.studentHomeworkRepo.findOne({ where: { id: studentHomework.id } });
  }

  async getStudentStats(studentId: string) {
    const studentHomeworks = await this.studentHomeworkRepo.find({ where: { studentId } });
    
    return {
      total: studentHomeworks.length,
      pending: studentHomeworks.filter(h => h.status === StudentHomeworkStatus.PENDING).length,
      completed: studentHomeworks.filter(h => h.status === StudentHomeworkStatus.COMPLETED).length,
      overdue: studentHomeworks.filter(h => h.status === StudentHomeworkStatus.OVERDUE).length,
    };
  }

  async markOverdueHomework() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const activeHomeworks = await this.homeworkRepo.find({
      where: { status: HomeworkStatus.ACTIVE }
    });

    const overdueHomeworkIds = activeHomeworks
      .filter(h => h.dueDate < today)
      .map(h => h.id);

    if (overdueHomeworkIds.length === 0) return { marked: 0 };

    const result = await this.studentHomeworkRepo
      .createQueryBuilder()
      .update(StudentHomeworkEntity)
      .set({ status: StudentHomeworkStatus.OVERDUE })
      .where('homeworkId IN (:...ids)', { ids: overdueHomeworkIds })
      .andWhere('status = :status', { status: StudentHomeworkStatus.PENDING })
      .execute();

    return { marked: result.affected || 0 };
  }
}
