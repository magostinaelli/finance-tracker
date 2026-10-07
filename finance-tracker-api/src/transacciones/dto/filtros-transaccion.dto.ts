import { IsOptional, IsInt, IsDateString, IsIn, IsBoolean } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FiltrosTransaccionDto {
  // Fecha: mes/anio O rango, no ambos. Si vienen los dos, se usa mes/anio.
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  mes?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  anio?: number;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  // Filtros combinables libremente
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  cuentaId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  categoriaId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  medioPagoId?: number;

  @IsOptional()
  @IsIn(['COMPRA', 'PAGO_SERVICIO', 'INGRESO'])
  tipo?: 'COMPRA' | 'PAGO_SERVICIO' | 'INGRESO';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === undefined ? undefined : value === 'true' || value === true,
  )
  mostrarCanceladas?: boolean;
}