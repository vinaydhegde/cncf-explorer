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
import { EnterpriseSolutionsService } from './enterprise-solutions.service';
import { CreateEnterpriseSolutionDto } from './dto/create-enterprise-solution.dto';

@Controller('api/enterprise-solutions')
export class EnterpriseSolutionsController {
  constructor(
    private readonly enterpriseSolutionsService: EnterpriseSolutionsService,
  ) {}

  @Post()
  create(@Body() createEnterpriseSolutionDto: CreateEnterpriseSolutionDto) {
    return this.enterpriseSolutionsService.create(createEnterpriseSolutionDto);
  }

  @Get()
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.enterpriseSolutionsService.findByCategory(category);
    }
    return this.enterpriseSolutionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enterpriseSolutionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnterpriseSolutionDto: Partial<CreateEnterpriseSolutionDto>,
  ) {
    return this.enterpriseSolutionsService.update(id, updateEnterpriseSolutionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enterpriseSolutionsService.remove(id);
  }
}

