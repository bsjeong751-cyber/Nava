import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

// 사용자가 지도에서 직접 편집한 최종 장소 순서를 그대로 받아 서버가 시간/이동시간을 재계산한다
// (기획서 13항: 장소 추가/삭제/순서변경 시 전체 루트 자동 재계산).
export class RoutePlaceOrderItemDto {
  @IsOptional()
  @IsString()
  placeId?: string; // 기존 저장된 Place id (없으면 신규 후보 장소 externalId로 취급)

  @IsInt()
  @Min(1)
  dayNumber!: number;

  @IsOptional()
  @IsIn(['PLACE', 'REST', 'MEAL'])
  slotType?: 'PLACE' | 'REST' | 'MEAL';

  @IsOptional()
  @IsInt()
  @Min(5)
  stayMinutes?: number;
}

export class UpdateRoutePlacesDto {
  @IsArray()
  @ArrayMinSize(0)
  @ValidateNested({ each: true })
  @Type(() => RoutePlaceOrderItemDto)
  places!: RoutePlaceOrderItemDto[];
}
