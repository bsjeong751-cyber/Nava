import { Budget, Mobility, TravelPace } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  @MaxLength(50)
  destination!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(15)
  interests!: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  @IsOptional()
  mustVisit?: string[];

  @IsEnum(Budget)
  budget!: Budget;

  @IsOptional()
  @IsInt()
  @Min(0)
  budgetAmount?: number;

  @IsEnum(TravelPace)
  pace!: TravelPace;

  @IsArray()
  @IsEnum(Mobility, { each: true })
  mobility!: Mobility[];

  @IsOptional()
  @IsString()
  @MaxLength(80)
  title?: string;
}
