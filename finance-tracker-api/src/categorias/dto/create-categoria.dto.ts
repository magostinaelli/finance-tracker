import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoCategoria } from '../enums/tipo-categoria.enum';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEnum(TipoCategoria)
  tipo: TipoCategoria;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}