import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AmenitiesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; icon?: string }) {
    return this.prisma.amenity.create({ data });
  }

  findAll() {
    return this.prisma.amenity.findMany();
  }

  remove(id: number) {
    return this.prisma.amenity.delete({ where: { id } });
  }
}