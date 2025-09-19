import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        product_details: true,
        reviews: true,
        view_histories: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        product_details: true,
        reviews: true,
        view_histories: true,
      },
    });
  }

  async create(data: { name: string; categoryId: number; source_id: string; source_url: string; last_scraped_at?: Date }) {
    return this.prisma.product.create({
      data,
    });
  }

  async findManyWithFilters(where: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        product_details: true,
        reviews: true,
        view_histories: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(where: any) {
    return this.prisma.product.count({ where });
  }
}
