import { IsDateString, IsNumber, IsPositive, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateIngresoDto {
  @IsInt()
  categoriaId: number;

  @IsInt()
  cuentaId: number;

  @IsDateString()
  fecha: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsString()
  descripcion?: string;
}