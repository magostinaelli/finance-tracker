import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsInt,
  IsIn,
  Min,
  Max,
} from 'class-validator';
import { TipoCuenta } from '../enums/tipo-cuenta.enum';
import { DiaSemana, VALORES_DIA_SEMANA } from '../../tarjetas-credito/enums/dia-semana.enum';
import { PosicionDiaSemana } from '../../tarjetas-credito/enums/posicion-dia-semana.enum';
import { ModoCalculoFecha } from '../../tarjetas-credito/enums/modo-calculo-fecha.enum';

export class CreateCuentaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(TipoCuenta)
  tipo: TipoCuenta;

  @IsBoolean()
  activo: boolean;

  // --- Campos de TarjetaCredito: todos opcionales, se pueden cargar después con un update ---

  @IsOptional()
  @IsEnum(ModoCalculoFecha)
  modoCierre?: ModoCalculoFecha;

  @IsOptional()
  @IsIn(VALORES_DIA_SEMANA)
  diaSemanaCierre?: DiaSemana;

  @IsOptional()
  @IsEnum(PosicionDiaSemana)
  posicionCierre?: PosicionDiaSemana;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaFijoCierre?: number;

  @IsOptional()
  @IsEnum(ModoCalculoFecha)
  modoVencimiento?: ModoCalculoFecha;

  @IsOptional()
  @IsIn(VALORES_DIA_SEMANA)
  diaSemanaVencimiento?: DiaSemana;

  @IsOptional()
  @IsEnum(PosicionDiaSemana)
  posicionVencimiento?: PosicionDiaSemana;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  diaFijoVencimiento?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  diasDespuesCierre?: number;
}