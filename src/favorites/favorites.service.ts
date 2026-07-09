import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: number, spaceId: number) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_spaceId: { userId, spaceId } },
    });
    if (existing) {
      throw new ConflictException('Este espacio ya está en tus favoritos');
    }
    return this.prisma.favorite.create({ data: { userId, spaceId } });
  }

  findMine(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { space: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async remove(userId: number, spaceId: number) {
    return this.prisma.favorite.delete({
      where: { userId_spaceId: { userId, spaceId } },
    });
  }
}