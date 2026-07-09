import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  // Este método lo usaremos internamente desde otros módulos (ej. al confirmar una reserva)
  create(userId: number, title: string, message: string, type = 'INFO') {
    return this.prisma.notification.create({
      data: { userId, title, message, type },
    });
  }

  findMine(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  markAsRead(userId: number, id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}