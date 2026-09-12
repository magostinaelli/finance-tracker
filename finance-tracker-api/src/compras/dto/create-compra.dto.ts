import { IsString, IsNotEmpty, IsDateString, IsNumber, IsPositive, IsInt, IsEnum, IsOptional } from 'class-validator';
import { EstadoCompra } from '../enums/estado-compra.enum';

export class CreateCompraDto {

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsDateString()
  fecha: Date;

  @IsNumber()
  @IsPositive()
  montoTotal: number;

  @IsInt()
  categoriaId: number;

  @IsInt()
  cuentaId: number;

  @IsInt()
  medioPagoId: number;

  
  @IsInt()
  @IsPositive()
  cantidadCuotas: number;

  @IsEnum(EstadoCompra)
  estado: EstadoCompra;

  @IsOptional()
  @IsString()
  detalleOtro?: string;
}