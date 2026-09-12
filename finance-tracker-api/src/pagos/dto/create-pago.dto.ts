import { IsString, IsNotEmpty, IsDateString, IsNumber, IsPositive, IsInt, IsOptional } from 'class-validator';
import { TipoServicio } from '../enums/tipo-servicio.enum';

export class CreatePagoDto {
  // --- Campos que van a Gasto ---
  @IsInt()
  categoriaId: number;

  @IsInt()
  cuentaId: number;

  @IsInt()
  medioPagoId: number;

  // --- Campos que van a Movimiento ---
  @IsDateString()
  fecha: string;

  @IsNumber()
  @IsPositive()
  monto: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  // --- Campos propios de Pago ---
  @IsString()
  @IsNotEmpty()
  tipoServicio: TipoServicio;

  @IsOptional()
  @IsString()
  numeroReferencia?: string;

  @IsOptional()
  @IsString()
  detalleOtro?: string;

  @IsOptional()
  @IsInt()
  cuentaTarjetaId?: number;

}