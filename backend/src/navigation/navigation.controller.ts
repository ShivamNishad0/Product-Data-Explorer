import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NavigationService } from './navigation.service';
import { NavigationResponseDto } from './dto/navigation.dto';

@ApiTags('navigations')
@Controller('navigations')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all navigation headings' })
  @ApiResponse({
    status: 200,
    description: 'List of navigation headings',
    type: [NavigationResponseDto],
  })
  async findAll(): Promise<NavigationResponseDto[]> {
    return this.navigationService.findAll();
  }
}
