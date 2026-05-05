import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity } from '../database/entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private repo: Repository<NotificationEntity>,
  ) {}

  async create(userId: string, title: string, message: string, type = 'task') {
    return this.repo.save({
      userId,
      title,
      message,
      type,
    });
  }

  async findAllForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    return this.repo.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string) {
    return this.repo.update({ userId, isRead: false }, { isRead: true });
  }
}
