import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateMediosPagoDto } from './create-medios-pago.dto';

export class UpdateMediosPagoDto extends PartialType(
  OmitType(CreateMediosPagoDto, ['tipo'] as const),
) {}