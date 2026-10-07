import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(
  OmitType(CreateCategoriaDto, ['tipo'] as const),
) {}