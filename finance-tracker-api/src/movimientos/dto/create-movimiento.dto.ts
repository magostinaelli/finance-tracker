import { IsDateString, IsNumber, IsString, IsOptional, Min, MaxLength, MinLength, IsPositive } from 'class-validator';

export class CreateMovimientoDto {
  @IsDateString()
  fecha: Date;

  @IsNumber()
  @Min(0.01)
  monto: number;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  descripcion: string;

  @IsNumber()
  medioPagoId: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  detalleOtro?: string;

  @IsNumber()
  @IsPositive()
  categoriaId: number;

  @IsNumber()
  @IsPositive()
  cuentaId: number;
}