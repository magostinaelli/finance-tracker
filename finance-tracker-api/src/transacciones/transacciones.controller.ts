import { Controller, Get, Param, Query } from '@nestjs/common';
import { TransaccionesService } from './transacciones.service';
import { FiltrosTransaccionDto } from './dto/filtros-transaccion.dto';

@Controller('transacciones')
export class TransaccionesController {
  constructor(private readonly transaccionesService: TransaccionesService) {}

  @Get()
  findAll(@Query() filtros: FiltrosTransaccionDto) {
    return this.transaccionesService.findAll(filtros);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transaccionesService.findOne(+id);
  }
}