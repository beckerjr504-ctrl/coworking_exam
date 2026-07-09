import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, dto: { spaceId: number; rating: number; comment?: string }) {
    // Regla de negocio: solo puede reseñar si ya hizo una reserva en ese espacio
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        userId,
        spaceId: dto.spaceId,
        status: { not: 'CANCELLED' },
      },
    });

    if (!reservation) {
      throw new ForbiddenException('Solo puedes reseñar espacios para los que tengas una reserva válida');
    }

    return this.prisma.review.create({
      data: { userId, spaceId: dto.spaceId, rating: dto.rating, comment: dto.comment },
    });
  }

  findBySpace(spaceId: number) {
    return this.prisma.review.findMany({
      where: { spaceId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  remove(id: number) {
    return this.prisma.review.delete({ where: { id } });
  }
}