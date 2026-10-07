import { Controller, Get, Param, Delete, Query } from '@nestjs/common';
import { MovimientosService } from './movimientos.service';
import { ResumenMovimientosDto } from './dto/resumen-movimientos.dto';
import { FiltrosCuotasDto } from './dto/filtros-cuotas.dto';

@Controller('movimientos')
export class MovimientosController {
  constructor(private readonly movimientosService: MovimientosService) {}

  @Get()
  findAll() {
    return this.movimientosService.findAll();
  }

  @Get('resumen')
  getResumen(@Query() filtros: ResumenMovimientosDto) {
    return this.movimientosService.getResumen(filtros);
  }
  @Get('cuotas-futuras')
  getCuotasFuturas(@Query() filtros: FiltrosCuotasDto) {
    return this.movimientosService.getCuotasFuturas(filtros);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.movimientosService.findOne(+id);
  }

  // NOTA: se sacó PATCH (update) por ahora -> actualizar un Movimiento
  // suelto ya no tiene mucho sentido si nace siempre ligado a una Compra/Pago/Ingreso.
  // Lo pensamos con calma más adelante si hace falta.

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.movimientosService.remove(+id);
  }
}