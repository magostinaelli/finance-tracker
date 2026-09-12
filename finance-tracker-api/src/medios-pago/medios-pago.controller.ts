import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MediosPagoService } from './medios-pago.service';
import { TipoCuenta } from '../cuentas/enums/tipo-cuenta.enum';
import { CreateMediosPagoDto } from './dto/create-medios-pago.dto';



@Controller('medios-pago')
export class MediosPagoController {
  constructor(private readonly mediosPagoService: MediosPagoService) {}

  @Get()
  findAll(@Query('tipoCuenta') tipoCuenta?: TipoCuenta) {
    return this.mediosPagoService.findAll(tipoCuenta);
  }

  @Post()
  create(@Body() dto: CreateMediosPagoDto) {
    return this.mediosPagoService.create(dto);
  }
}