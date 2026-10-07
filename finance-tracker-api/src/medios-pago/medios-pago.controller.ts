import { Controller, Get, Post, Patch, Delete,  Body, Param, Query } from '@nestjs/common';
import { MediosPagoService } from './medios-pago.service';
import { TipoCuenta } from '../cuentas/enums/tipo-cuenta.enum';
import { CreateMediosPagoDto } from './dto/create-medios-pago.dto';
import { UpdateMediosPagoDto } from './dto/update-medios-pago.dto';



@Controller('medios-pago')
export class MediosPagoController {
  constructor(private readonly mediosPagoService: MediosPagoService) {}

  @Get()
  findAll(
    @Query('tipoCuenta') tipoCuenta?: TipoCuenta,
    @Query('incluirInactivos') incluirInactivos?: string,
  ) {
    return this.mediosPagoService.findAll(tipoCuenta, incluirInactivos === 'true');
  }

  @Post()
  create(@Body() dto: CreateMediosPagoDto) {
    return this.mediosPagoService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMediosPagoDto) {
    return this.mediosPagoService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mediosPagoService.remove(+id);
  }
}