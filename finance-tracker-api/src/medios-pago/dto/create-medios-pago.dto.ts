import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoMedioPago } from '../enums/tipo-medio-pago.enum';

export class CreateMediosPagoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(TipoMedioPago)
  tipo: TipoMedioPago;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}