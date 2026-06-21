import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeworkEntity, HomeworkStatus, HomeworkSubmissionType } from '../database/entities/homework.entity';
import { HomeworkAssignmentEntity, HomeworkAssignmentStatus } from '../database/entities/homework-assignment.entity';
import { HomeworkSubmissionEntity, HomeworkSubmissionStatus } from '../database/entities/homework-submission.entity';
import { TeachingAssignmentEntity } from '../database/entities/teaching-assignment.entity';
import { StudentEntity } from '../database/entities/student.entity';
import { TeacherEntity } from '../database/entities/teacher.entity';
import { SubjectEntity } from '../database/entities/subject.entity';
import { SchoolClassEntity } from '../database/entities/class.entity';
import { AcademicYearsService } from '../academic-years/academic-years.service';
import { AddHomeworkAssignmentsDto, CreateHomeworkDto, HomeworkMonitorQueryDto, ReviewHomeworkSubmissionDto, SubmitHomeworkDto, UpdateHomeworkDto } from './dto/homework.dto';

type UploadedFile = { filename: string; originalname: string; mimetype: string; size: number };

@Injectable()
export class HomeworkService {
  constructor(
    @InjectRepository(HomeworkEntity) private readonly homeworkRepo: Repository<HomeworkEntity>,
    @InjectRepository(HomeworkAssignmentEntity) private readonly assignmentRepo: Repository<HomeworkAssignmentEntity>,
    @InjectRepository(HomeworkSubmissionEntity) private readonly submissionRepo: Repository<HomeworkSubmissionEntity>,
    @InjectRepository(TeachingAssignmentEntity) private readonly teachingRepo: Repository<TeachingAssignmentEntity>,
    @InjectRepository(StudentEntity) private readonly studentRepo: Repository<StudentEntity>,
    @InjectRepository(TeacherEntity) private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(SubjectEntity) private readonly subjectRepo: Repository<SubjectEntity>,
    @InjectRepository(SchoolClassEntity) private readonly classRepo: Repository<SchoolClassEntity>,
    private readonly academicYears: AcademicYearsService,
  ) {}

  async getTeacherContext(teacherId: string) {
    const year = await this.academicYears.getActiveAcademicYear();
    let assignments = await this.teachingRepo.find({ where: { teacherId, academicYearId: year.id, isActive: true } });
    // Teacher profiles predate the section-level teaching assignment table. When
    // a profile has classes and subjects but no explicit rows yet, materialize
    // every section of those classes so existing teachers can publish homework.
    if (!assignments.length) {
      await this.bootstrapProfileAssignments(teacherId, year.id);
      assignments = await this.teachingRepo.find({ where: { teacherId, academicYearId: year.id, isActive: true } });
    }
    const [classes, subjects] = await Promise.all([this.classRepo.find(), this.subjectRepo.find()]);
    const classMap = new Map(classes.map((item) => [item.id, item.name]));
    const subjectMap = new Map(subjects.map((item) => [item.id, item.name]));
    return assignments.map((item) => ({ classId: item.classId, className: classMap.get(item.classId) || item.classId, section: item.section, subjectId: item.subjectId, subjectName: subjectMap.get(item.subjectId) || item.subjectId }));
  }

  async createHomework(dto: CreateHomeworkDto, teacherId: string, file?: UploadedFile) {
    const [year, teacher, schoolClass, subject] = await Promise.all([
      this.academicYears.getActiveAcademicYear(), this.teacherRepo.findOne({ where: { id: teacherId } }),
      this.classRepo.findOne({ where: { id: dto.classId } }), this.subjectRepo.findOne({ where: { id: dto.subjectId } }),
    ]);
    if (!teacher) throw new ForbiddenException('Teacher profile is required to publish homework');
    if (!schoolClass) throw new NotFoundException('Class not found');
    if (!subject) throw new NotFoundException('Subject not found');
    const deadline = this.validateFutureDeadline(dto.deadline);
    const sections = [...new Set(dto.sectionIds)];
    await this.assertTeacherCanTeach(teacherId, dto.classId, dto.subjectId, sections, year.id, schoolClass.sections);
    const fileData = this.fileMetadata(file);

    return this.homeworkRepo.manager.transaction(async (manager) => {
      const homework = await manager.getRepository(HomeworkEntity).save(manager.getRepository(HomeworkEntity).create({
        title: dto.title, description: dto.description, topic: dto.topic || null, priority: dto.priority || 'medium',
        submissionType: dto.submissionType, classId: dto.classId, className: schoolClass.name, subjectId: dto.subjectId,
        subjectName: subject.name, teacherId, teacherName: teacher.name, academicYearId: year.id, status: HomeworkStatus.PUBLISHED,
        schoolId: 'school_001', ...fileData,
      }));
      const assignmentRepo = manager.getRepository(HomeworkAssignmentEntity);
      const assignments = await assignmentRepo.save(sections.map((section) => assignmentRepo.create({ homeworkId: homework.id, section, deadline, publishedAt: new Date(), status: HomeworkAssignmentStatus.PUBLISHED })));
      return { ...homework, assignments };
    });
  }

  async getTeacherHomework(teacherId: string) {
    const records = await this.homeworkRepo.find({ where: { teacherId }, order: { createdAt: 'DESC' } });
    const assignments = await this.assignmentRepo.find();
    return records.map((record) => ({ ...record, assignments: assignments.filter((item) => item.homeworkId === record.id) }));
  }

  async getHomeworkWithAssignments(id: string, teacherId?: string) {
    const homework = await this.homeworkRepo.findOne({ where: { id } });
    if (!homework) throw new NotFoundException('Homework not found');
    if (teacherId && homework.teacherId !== teacherId) throw new ForbiddenException('You cannot access this homework');
    const assignments = await this.assignmentRepo.find({ where: { homeworkId: id }, order: { deadline: 'ASC' } });
    return { ...homework, assignments };
  }

  async updateHomework(id: string, dto: UpdateHomeworkDto, teacherId: string) {
    const homework = await this.getOwnedHomework(id, teacherId);
    Object.assign(homework, dto);
    return this.homeworkRepo.save(homework);
  }

  async addAssignments(id: string, dto: AddHomeworkAssignmentsDto, teacherId: string) {
    const homework = await this.getOwnedHomework(id, teacherId);
    if (homework.status !== HomeworkStatus.PUBLISHED) throw new BadRequestException('Only published homework can receive new assignments');
    const [year, schoolClass] = await Promise.all([this.academicYears.getActiveAcademicYear(), this.classRepo.findOne({ where: { id: homework.classId } })]);
    if (!schoolClass) throw new NotFoundException('Class not found');
    const deadline = this.validateFutureDeadline(dto.deadline);
    const sections = [...new Set(dto.sectionIds)];
    await this.assertTeacherCanTeach(teacherId, homework.classId, homework.subjectId, sections, year.id, schoolClass.sections);
    const existing = await this.assignmentRepo.find({ where: { homeworkId: id } });
    if (sections.some((section) => existing.some((assignment) => assignment.section === section))) throw new BadRequestException('Homework is already assigned to one or more selected sections');
    await this.assignmentRepo.save(sections.map((section) => this.assignmentRepo.create({ homeworkId: id, section, deadline, publishedAt: new Date(), status: HomeworkAssignmentStatus.PUBLISHED })));
    return this.getHomeworkWithAssignments(id, teacherId);
  }

  async getAssignmentSubmissions(assignmentId: string, teacherId: string) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Homework assignment not found');
    await this.getOwnedHomework(assignment.homeworkId, teacherId);
    const [submissions, students] = await Promise.all([this.submissionRepo.find({ where: { homeworkAssignmentId: assignmentId }, order: { updatedAt: 'DESC' } }), this.studentRepo.find()]);
    const studentMap = new Map(students.map((student) => [student.id, student]));
    return submissions.map((submission) => ({ ...submission, studentName: studentMap.get(submission.studentId)?.fullName || 'Unknown student', studentCode: studentMap.get(submission.studentId)?.studentId || null }));
  }

  async reviewSubmission(id: string, dto: ReviewHomeworkSubmissionDto, teacherId: string) {
    const submission = await this.submissionRepo.findOne({ where: { id } });
    if (!submission) throw new NotFoundException('Homework submission not found');
    const assignment = await this.assignmentRepo.findOne({ where: { id: submission.homeworkAssignmentId } });
    if (!assignment) throw new NotFoundException('Homework assignment not found');
    await this.getOwnedHomework(assignment.homeworkId, teacherId);
    submission.marksObtained = dto.marksObtained ?? submission.marksObtained;
    submission.teacherFeedback = dto.teacherFeedback ?? submission.teacherFeedback;
    submission.status = HomeworkSubmissionStatus.REVIEWED;
    return this.submissionRepo.save(submission);
  }

  async getStudentHomework(studentId: string) {
    const { student, schoolClass } = await this.resolveStudentClass(studentId);
    if (!schoolClass) return [];
    const year = await this.academicYears.getActiveAcademicYear();
    const homeworks = await this.homeworkRepo.find({ where: { classId: schoolClass.id, academicYearId: year.id, status: HomeworkStatus.PUBLISHED }, order: { createdAt: 'DESC' } });
    const assignments = await this.assignmentRepo.find({ where: { section: student.section, status: HomeworkAssignmentStatus.PUBLISHED } });
    const activeAssignments = assignments.filter((assignment) => homeworks.some((homework) => homework.id === assignment.homeworkId));
    const submissions = await this.submissionRepo.find({ where: { studentId } });
    const homeworkMap = new Map(homeworks.map((homework) => [homework.id, homework]));
    const submissionMap = new Map(submissions.map((submission) => [submission.homeworkAssignmentId, submission]));
    return activeAssignments.map((assignment) => this.studentResponse(homeworkMap.get(assignment.homeworkId)!, assignment, submissionMap.get(assignment.id)));
  }

  async getStudentAssignment(id: string, studentId: string) {
    const { student, schoolClass } = await this.resolveStudentClass(studentId);
    const assignment = await this.assignmentRepo.findOne({ where: { id, section: student.section, status: HomeworkAssignmentStatus.PUBLISHED } });
    if (!assignment || !schoolClass) throw new NotFoundException('Homework assignment not found');
    const homework = await this.homeworkRepo.findOne({ where: { id: assignment.homeworkId, classId: schoolClass.id, status: HomeworkStatus.PUBLISHED } });
    if (!homework) throw new NotFoundException('Homework assignment not found');
    const submission = await this.submissionRepo.findOne({ where: { homeworkAssignmentId: id, studentId } });
    return this.studentResponse(homework, assignment, submission || undefined);
  }

  async submitHomework(assignmentId: string, dto: SubmitHomeworkDto, studentId: string, file?: UploadedFile) {
    const detail = await this.getStudentAssignment(assignmentId, studentId);
    if (!detail.isSubmissionOpen) throw new BadRequestException('Deadline passed. Submission is closed.');
    const existing = await this.submissionRepo.findOne({ where: { homeworkAssignmentId: assignmentId, studentId } });
    const text = dto.submissionText?.trim() || existing?.submissionText || null;
    const fileData: Partial<HomeworkSubmissionEntity> = file ? this.submissionFileMetadata(file) : {};
    const fileUrl = fileData.fileUrl || existing?.fileUrl || null;
    this.validateSubmission(detail.homework.submissionType, text, fileUrl);
    const now = new Date();
    if (!existing) return this.submissionRepo.save(this.submissionRepo.create({ homeworkAssignmentId: assignmentId, studentId, submissionText: text, ...fileData, submittedAt: now, status: HomeworkSubmissionStatus.SUBMITTED }));
    existing.submissionText = text;
    Object.assign(existing, fileData);
    existing.submittedAt = now;
    existing.submissionVersion += 1;
    existing.status = HomeworkSubmissionStatus.SUBMITTED;
    existing.marksObtained = null;
    existing.teacherFeedback = null;
    return this.submissionRepo.save(existing);
  }

  async monitor(query: HomeworkMonitorQueryDto) {
    let homeworks = await this.homeworkRepo.find({ order: { createdAt: 'DESC' } });
    if (query.classId) homeworks = homeworks.filter((item) => item.classId === query.classId);
    if (query.subjectId) homeworks = homeworks.filter((item) => item.subjectId === query.subjectId);
    if (query.teacherId) homeworks = homeworks.filter((item) => item.teacherId === query.teacherId);
    if (query.status) homeworks = homeworks.filter((item) => item.status === query.status);
    const assignments = await this.assignmentRepo.find();
    const submissions = await this.submissionRepo.find();
    return homeworks.map((homework) => {
      let rows = assignments.filter((item) => item.homeworkId === homework.id);
      if (query.section) rows = rows.filter((item) => item.section === query.section);
      if (query.deadlineFrom) rows = rows.filter((item) => item.deadline >= new Date(query.deadlineFrom!));
      if (query.deadlineTo) rows = rows.filter((item) => item.deadline <= new Date(query.deadlineTo!));
      const assignmentIds = rows.map((item) => item.id);
      const relevant = submissions.filter((item) => assignmentIds.includes(item.homeworkAssignmentId));
      if (query.submissionStatus && !relevant.some((item) => item.status === query.submissionStatus)) return null;
      return { ...homework, assignments: rows, submissionCount: relevant.length, reviewedCount: relevant.filter((item) => item.status === HomeworkSubmissionStatus.REVIEWED).length };
    }).filter(Boolean);
  }

  async updateStatus(id: string, status: HomeworkStatus) {
    if (![HomeworkStatus.ARCHIVED, HomeworkStatus.CANCELLED].includes(status)) throw new BadRequestException('Admin may only archive or cancel homework');
    const homework = await this.homeworkRepo.findOne({ where: { id } });
    if (!homework) throw new NotFoundException('Homework not found');
    homework.status = status;
    return this.homeworkRepo.save(homework);
  }

  private async getOwnedHomework(id: string, teacherId: string) {
    const homework = await this.homeworkRepo.findOne({ where: { id } });
    if (!homework) throw new NotFoundException('Homework not found');
    if (homework.teacherId !== teacherId) throw new ForbiddenException('You cannot modify this homework');
    return homework;
  }

  private validateFutureDeadline(value: string) {
    const deadline = new Date(value);
    if (Number.isNaN(deadline.getTime()) || deadline <= new Date()) throw new BadRequestException('Deadline must be a future date and time');
    return deadline;
  }

  private async assertTeacherCanTeach(teacherId: string, classId: string, subjectId: string, sections: string[], academicYearId: number, classSections: string[]) {
    if (sections.some((section) => !classSections.includes(section))) throw new BadRequestException('Every selected section must belong to the selected class');
    const permitted = await this.teachingRepo.find({ where: { teacherId, classId, subjectId, academicYearId, isActive: true } });
    const permittedSections = new Set(permitted.map((item) => item.section));
    if (sections.some((section) => !permittedSections.has(section))) throw new ForbiddenException('You are not assigned to teach this subject in one or more selected sections');
  }

  private async bootstrapProfileAssignments(teacherId: string, academicYearId: number) {
    const [teacher, classes] = await Promise.all([this.teacherRepo.findOne({ where: { id: teacherId } }), this.classRepo.find()]);
    if (!teacher || !teacher.gradeLevel?.length) return;
    const subjectIds = [...new Set([...(teacher.subjectIds || []), teacher.subjectId].filter(Boolean))];
    if (!subjectIds.length) return;
    const profileClasses = classes.filter((schoolClass) => teacher.gradeLevel.includes(schoolClass.name));
    const rows = profileClasses.flatMap((schoolClass) => schoolClass.sections.flatMap((section) => subjectIds.map((subjectId) => ({
      teacherId,
      classId: schoolClass.id,
      section,
      subjectId,
      academicYearId,
      schoolId: 'school_001',
      isActive: true,
    }))));
    if (rows.length) await this.teachingRepo.upsert(rows, ['teacherId', 'classId', 'section', 'subjectId', 'academicYearId']);
  }

  private async resolveStudentClass(studentId: string) {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    const schoolClass = await this.classRepo.findOne({ where: { name: student.className } });
    return { student, schoolClass };
  }

  private studentResponse(homework: HomeworkEntity, assignment: HomeworkAssignmentEntity, submission?: HomeworkSubmissionEntity) {
    const isSubmissionOpen = homework.status === HomeworkStatus.PUBLISHED && assignment.status === HomeworkAssignmentStatus.PUBLISHED && new Date() < assignment.deadline;
    return { homework, assignment, submission: submission || null, submissionStatus: submission?.status || 'not_submitted', isSubmissionOpen };
  }

  private validateSubmission(type: HomeworkSubmissionType, text: string | null, fileUrl: string | null) {
    if (type === HomeworkSubmissionType.TEXT && !text) throw new BadRequestException('A text answer is required');
    if (type === HomeworkSubmissionType.FILE && !fileUrl) throw new BadRequestException('A file upload is required');
    if (type === HomeworkSubmissionType.BOTH && !text && !fileUrl) throw new BadRequestException('A text answer or file upload is required');
  }

  private fileMetadata(file?: UploadedFile) {
    if (!file) return {};
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return { attachmentUrl: `${baseUrl}/uploads/${file.filename}`, attachmentName: file.originalname, attachmentMimeType: file.mimetype, attachmentSize: file.size };
  }

  private submissionFileMetadata(file: UploadedFile) {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:4000';
    return { fileUrl: `${baseUrl}/uploads/${file.filename}`, fileName: file.originalname, fileMimeType: file.mimetype, fileSize: file.size };
  }
}
