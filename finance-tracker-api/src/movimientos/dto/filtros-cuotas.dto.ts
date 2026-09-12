import { IsOptional, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrosCuotasDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  cuentaId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mes?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  anio?: number;
}