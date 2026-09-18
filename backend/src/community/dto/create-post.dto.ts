import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePostDto {
  @IsString()
  tripId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
