import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NavigationService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.navigation.findMany({
      include: {
        categories: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.navigation.findUnique({
      where: { id },
      include: {
        categories: true,
      },
    });
  }

  async create(data: {
    name: string;
    url?: string;
    source_id: string;
    source_url: string;
  }) {
    return this.prisma.navigation.create({
      data,
    });
  }
}
