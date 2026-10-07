import { Controller, Post, Param, ParseIntPipe } from '@nestjs/common';
import { CierreAnualService } from './cierre-anual.service';

@Controller('cierre-anual')
export class CierreAnualController {
  constructor(private readonly cierreAnualService: CierreAnualService) {}

  @Post(':anio')
  cerrarAnio(@Param('anio', ParseIntPipe) anio: number) {
    return this.cierreAnualService.cerrarAnio(anio);
  }
}