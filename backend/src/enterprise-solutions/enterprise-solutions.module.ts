import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EnterpriseSolutionsService } from './enterprise-solutions.service';
import { EnterpriseSolutionsController } from './enterprise-solutions.controller';
import {
  EnterpriseSolution,
  EnterpriseSolutionSchema,
} from './schemas/enterprise-solution.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EnterpriseSolution.name, schema: EnterpriseSolutionSchema },
    ]),
  ],
  controllers: [EnterpriseSolutionsController],
  providers: [EnterpriseSolutionsService],
  exports: [EnterpriseSolutionsService],
})
export class EnterpriseSolutionsModule {}

