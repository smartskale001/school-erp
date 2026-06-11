import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyllabusEntity } from '../database/entities/syllabus.entity';
import { SyllabusChapterEntity, SyllabusChapterStatus } from '../database/entities/syllabus-chapter.entity';
import { CreateSyllabusDto, UpdateSyllabusDto, CreateSyllabusChapterDto, UpdateSyllabusChapterDto } from './dto/syllabus.dto';
import { AcademicYearsService } from '../academic-years/academic-years.service';

@Injectable()
export class SyllabusService {
  constructor(
    @InjectRepository(SyllabusEntity)
    private syllabusRepo: Repository<SyllabusEntity>,
    @InjectRepository(SyllabusChapterEntity)
    private chapterRepo: Repository<SyllabusChapterEntity>,
    private academicYearService: AcademicYearsService,
  ) {}

  async createSyllabus(dto: CreateSyllabusDto, teacherId: string, teacherName: string) {
    const activeYear = await this.academicYearService.getActiveAcademicYear();

    const existing = await this.syllabusRepo.findOne({
      where: { classId: dto.classId, subjectId: dto.subjectId, academicYearId: activeYear.id }
    });

    if (existing) {
      throw new BadRequestException('Syllabus for this class and subject already exists.');
    }

    const syllabus = this.syllabusRepo.create({
      ...dto,
      teacherId,
      teacherName,
      academicYearId: activeYear.id,
    });
    return this.syllabusRepo.save(syllabus);
  }

  async updateSyllabus(id: string, dto: UpdateSyllabusDto, teacherId: string, isAdmin: boolean) {
    const syllabus = await this.syllabusRepo.findOne({ where: { id } });
    if (!syllabus) throw new NotFoundException('Syllabus not found');

    if (!isAdmin && syllabus.teacherId !== teacherId) {
      throw new ForbiddenException('Cannot update this syllabus');
    }

    if (dto.totalChapters !== undefined && dto.totalChapters < syllabus.completedChapters) {
      throw new BadRequestException('Total chapters cannot be less than completed chapters');
    }

    await this.syllabusRepo.update(id, dto);
    await this.recalculateCompletion(id);
    return this.syllabusRepo.findOne({ where: { id } });
  }

  async getTeacherSyllabus(teacherId: string) {
    const syllabuses = await this.syllabusRepo.find({
      where: { teacherId },
      order: { createdAt: 'DESC' },
    });

    const syllabusIds = syllabuses.map(s => s.id);
    if (syllabusIds.length === 0) return [];

    const chapters = await this.chapterRepo
      .createQueryBuilder('c')
      .where('c.syllabusId IN (:...ids)', { ids: syllabusIds })
      .orderBy('c.chapterNumber', 'ASC')
      .getMany();

    const chaptersMap = chapters.reduce((acc, chapter) => {
      if (!acc[chapter.syllabusId]) acc[chapter.syllabusId] = [];
      acc[chapter.syllabusId].push(chapter);
      return acc;
    }, {});

    return syllabuses.map(s => ({
      ...s,
      chapters: chaptersMap[s.id] || [],
    }));
  }

  async getStudentSyllabus(className: string) {
    if (!className) return [];
    const activeYear = await this.academicYearService.getActiveAcademicYear();
    
    const syllabuses = await this.syllabusRepo.find({
      where: { className, academicYearId: activeYear.id },
      order: { createdAt: 'DESC' },
    });

    const syllabusIds = syllabuses.map(s => s.id);
    if (syllabusIds.length === 0) return [];

    const chapters = await this.chapterRepo
      .createQueryBuilder('c')
      .where('c.syllabusId IN (:...ids)', { ids: syllabusIds })
      .orderBy('c.chapterNumber', 'ASC')
      .getMany();

    const chaptersMap = chapters.reduce((acc, chapter) => {
      if (!acc[chapter.syllabusId]) acc[chapter.syllabusId] = [];
      acc[chapter.syllabusId].push(chapter);
      return acc;
    }, {});

    return syllabuses.map(s => ({
      ...s,
      chapters: chaptersMap[s.id] || [],
    }));
  }

  // --- Chapter operations ---

  async addChapter(syllabusId: string, dto: CreateSyllabusChapterDto, teacherId: string, isAdmin: boolean) {
    const syllabus = await this.syllabusRepo.findOne({ where: { id: syllabusId } });
    if (!syllabus) throw new NotFoundException('Syllabus not found');

    if (!isAdmin && syllabus.teacherId !== teacherId) {
      throw new ForbiddenException('Cannot modify this syllabus');
    }

    const chapter = this.chapterRepo.create({
      ...dto,
      syllabusId,
      status: SyllabusChapterStatus.PENDING,
    });
    const saved = await this.chapterRepo.save(chapter);

    // Auto increment total chapters if needed
    const allChapters = await this.chapterRepo.count({ where: { syllabusId } });
    if (allChapters > syllabus.totalChapters) {
      await this.syllabusRepo.update(syllabusId, { totalChapters: allChapters });
    }
    await this.recalculateCompletion(syllabusId);

    return saved;
  }

  async updateChapter(chapterId: string, dto: UpdateSyllabusChapterDto, teacherId: string, isAdmin: boolean) {
    const chapter = await this.chapterRepo.findOne({ where: { id: chapterId } });
    if (!chapter) throw new NotFoundException('Chapter not found');

    const syllabus = await this.syllabusRepo.findOne({ where: { id: chapter.syllabusId } });
    if (!isAdmin && syllabus.teacherId !== teacherId) {
      throw new ForbiddenException('Cannot modify this syllabus');
    }

    const updates: Partial<SyllabusChapterEntity> = { ...dto };
    if (dto.status === SyllabusChapterStatus.COMPLETED) {
      updates.completedDate = new Date().toISOString().split('T')[0];
    } else if (dto.status === SyllabusChapterStatus.PENDING || dto.status === SyllabusChapterStatus.IN_PROGRESS) {
      updates.completedDate = null;
    }

    await this.chapterRepo.update(chapterId, updates);
    await this.recalculateCompletion(chapter.syllabusId);

    return this.chapterRepo.findOne({ where: { id: chapterId } });
  }

  private async recalculateCompletion(syllabusId: string) {
    const syllabus = await this.syllabusRepo.findOne({ where: { id: syllabusId } });
    if (!syllabus) return;

    const chapters = await this.chapterRepo.find({ where: { syllabusId } });
    const completedChapters = chapters.filter(c => c.status === SyllabusChapterStatus.COMPLETED).length;
    
    // Ensure total chapters is at least the number of actual chapters
    const totalChapters = Math.max(syllabus.totalChapters, chapters.length);
    const completionPercentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    await this.syllabusRepo.update(syllabusId, {
      totalChapters,
      completedChapters,
      completionPercentage,
    });
  }
}
