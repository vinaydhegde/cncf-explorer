import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EnterpriseSolution,
  EnterpriseSolutionDocument,
} from './schemas/enterprise-solution.schema';
import { CreateEnterpriseSolutionDto } from './dto/create-enterprise-solution.dto';

@Injectable()
export class EnterpriseSolutionsService {
  constructor(
    @InjectModel(EnterpriseSolution.name)
    private enterpriseSolutionModel: Model<EnterpriseSolutionDocument>,
  ) {}

  async create(
    createEnterpriseSolutionDto: CreateEnterpriseSolutionDto,
  ): Promise<EnterpriseSolution> {
    const createdSolution = new this.enterpriseSolutionModel(
      createEnterpriseSolutionDto,
    );
    return createdSolution.save();
  }

  async findAll(category?: string): Promise<EnterpriseSolution[]> {
    const query = category ? { category } : {};
    return this.enterpriseSolutionModel.find(query).sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<EnterpriseSolution> {
    return this.enterpriseSolutionModel.findById(id).exec();
  }

  async findByCategory(category: string): Promise<EnterpriseSolution[]> {
    return this.enterpriseSolutionModel.find({ category }).sort({ name: 1 }).exec();
  }

  async update(
    id: string,
    updateEnterpriseSolutionDto: Partial<CreateEnterpriseSolutionDto>,
  ): Promise<EnterpriseSolution> {
    return this.enterpriseSolutionModel
      .findByIdAndUpdate(id, updateEnterpriseSolutionDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<void> {
    await this.enterpriseSolutionModel.findByIdAndDelete(id).exec();
  }
}

