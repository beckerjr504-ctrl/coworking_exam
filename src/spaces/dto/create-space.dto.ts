import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  location: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsIn(['SALA', 'ESCRITORIO', 'AUDITORIO'])
  type: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}