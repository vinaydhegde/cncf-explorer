import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EnterpriseSolutionDocument = EnterpriseSolution & Document;

@Schema({ timestamps: true })
export class EnterpriseSolution {
  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  websiteUrl?: string;

  @Prop()
  cncfProjectUsed?: string; // The CNCF project this solution uses (e.g., "OpenTelemetry")

  @Prop()
  additionalInfo?: string; // Any additional information about the solution

  @Prop({ type: [String], default: [] })
  subcategories?: string[]; // Array of subcategories this solution applies to
}

export const EnterpriseSolutionSchema = SchemaFactory.createForClass(EnterpriseSolution);

// Create indexes
EnterpriseSolutionSchema.index({ category: 1 });
EnterpriseSolutionSchema.index({ name: 1 });

