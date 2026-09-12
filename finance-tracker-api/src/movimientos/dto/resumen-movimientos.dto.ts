import { Type } from 'class-transformer';
import { IsOptional, IsInt } from 'class-validator';

export class ResumenMovimientosDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mes?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  anio?: number;
}