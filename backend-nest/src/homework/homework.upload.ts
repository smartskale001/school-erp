import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg', 'image/png', 'image/webp',
]);

export const homeworkUploadOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (_req, file, callback) => callback(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, callback: any) => {
    if (!allowedMimeTypes.has(file.mimetype)) return callback(new BadRequestException('Only PDF, Word, JPEG, PNG, and WebP files are allowed'), false);
    callback(null, true);
  },
};
