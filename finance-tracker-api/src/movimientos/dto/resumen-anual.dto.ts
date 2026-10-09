import { IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class ResumenAnualDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  anio?: number;
}