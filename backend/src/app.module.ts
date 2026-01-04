import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';
import { EnterpriseSolutionsModule } from './enterprise-solutions/enterprise-solutions.module';
import { LandscapeModule } from './landscape/landscape.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/cncf-explorer',
    ),
    ProjectsModule,
    EnterpriseSolutionsModule,
    LandscapeModule,
  ],
})
export class AppModule {}

