import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterProjectsDto) {
    return this.projectsService.findAll(filterDto);
  }

  @Get('categories')
  getCategories() {
    return this.projectsService.getCategories();
  }

  @Get('maturity-levels')
  getMaturityLevels() {
    return this.projectsService.getMaturityLevels();
  }

  @Get('subcategories')
  getSubcategories(@Query('category') category?: string) {
    return this.projectsService.getSubcategories(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: Partial<CreateProjectDto>) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}

