import { Module } from '@nestjs/common';
import { NavigationService } from './navigation.service';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [NavigationService],
  exports: [NavigationService],
})
export class NavigationModule {}
