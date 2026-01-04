import { Module } from '@nestjs/common';
import { LandscapeService } from './landscape.service';
import { LandscapeController } from './landscape.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [LandscapeController],
  providers: [LandscapeService],
  exports: [LandscapeService],
})
export class LandscapeModule {}

