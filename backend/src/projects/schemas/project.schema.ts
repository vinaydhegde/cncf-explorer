import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProjectDocument = Project & Document;

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  category: string;

  @Prop()
  subcategory?: string;

  @Prop({ required: true })
  maturityLevel: string; // Sandbox, Incubating, Graduated

  @Prop()
  githubStars?: number;

  @Prop()
  lastUpdated?: Date;

  @Prop()
  homepageUrl?: string;

  @Prop()
  repoUrl?: string;

  @Prop()
  logo?: string;

  @Prop()
  description?: string;

  @Prop({
    type: {
      github: String,
      url: String,
      twitter: String,
    },
    required: false,
  })
  extra?: {
    github?: string;
    url?: string;
    twitter?: string;
  };
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Create indexes for better query performance
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ subcategory: 1 });
ProjectSchema.index({ maturityLevel: 1 });
ProjectSchema.index({ name: 1 });

