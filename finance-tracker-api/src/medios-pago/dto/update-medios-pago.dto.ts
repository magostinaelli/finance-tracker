import { PartialType } from '@nestjs/mapped-types';
import { CreateMediosPagoDto } from './create-medios-pago.dto';

export class UpdateMediosPagoDto extends PartialType(CreateMediosPagoDto) {}
