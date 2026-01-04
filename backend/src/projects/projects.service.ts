import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { FilterProjectsDto } from './dto/filter-projects.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const createdProject = new this.projectModel(createProjectDto);
    return createdProject.save();
  }

  async findAll(filterDto?: FilterProjectsDto): Promise<Project[]> {
    const query: any = {};

    if (filterDto?.maturityLevel && filterDto.maturityLevel.trim() !== '') {
      query.maturityLevel = filterDto.maturityLevel;
    }

    if (filterDto?.category && filterDto.category.trim() !== '') {
      query.category = filterDto.category;
    }

    if (filterDto?.subcategory && filterDto.subcategory.trim() !== '') {
      query.subcategory = filterDto.subcategory;
    }

    return this.projectModel.find(query).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Project> {
    return this.projectModel.findById(id).exec();
  }

  async update(id: string, updateProjectDto: Partial<CreateProjectDto>): Promise<Project> {
    return this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.projectModel.findByIdAndDelete(id).exec();
  }

  async bulkCreate(projects: CreateProjectDto[]): Promise<void> {
    // Use bulk write for better performance
    const operations = projects.map((project) => ({
      updateOne: {
        filter: { name: project.name },
        update: { $set: project },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await this.projectModel.bulkWrite(operations);
    }
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.projectModel.distinct('category').exec();
    return categories.sort();
  }

  async getMaturityLevels(): Promise<string[]> {
    const levels = await this.projectModel.distinct('maturityLevel').exec();
    return levels.filter(level => level && level.trim() !== '').sort();
  }

  async getSubcategories(category?: string): Promise<string[]> {
    const query: any = {
      subcategory: { $exists: true, $ne: null, $nin: [null, ''] }
    };
    if (category && category.trim() !== '') {
      query.category = category;
    }
    const subcategories = await this.projectModel.distinct('subcategory', query).exec();
    return subcategories.filter(sub => sub && sub.trim() !== '').sort();
  }
}

