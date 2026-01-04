import { Controller, Post, Get } from '@nestjs/common';
import { LandscapeService } from './landscape.service';

@Controller('api/landscape')
export class LandscapeController {
  constructor(private readonly landscapeService: LandscapeService) {}

  @Post('sync')
  async syncProjects() {
    const result = await this.landscapeService.syncProjectsToDatabase();
    return {
      message: 'Projects synced successfully',
      ...result,
    };
  }

  @Get('fetch')
  async fetchLandscape() {
    const data = await this.landscapeService.fetchAndParseLandscape();
    return {
      message: 'Landscape YAML data fetched successfully',
      categories: data.landscape?.length || 0,
    };
  }
}

