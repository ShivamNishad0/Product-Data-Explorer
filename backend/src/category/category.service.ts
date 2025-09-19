import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        navigation: true,
        products: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.category.findUnique({
      where: { id },
      include: {
        navigation: true,
        products: true,
      },
    });
  }

  async create(data: { name: string; navigationId: number; source_id: string; source_url: string }) {
    return this.prisma.category.create({
      data,
    });
  }
}
