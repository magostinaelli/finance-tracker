import { Controller, Get, Param } from '@nestjs/common';
import { GastosService } from './gastos.service';

@Controller('gastos')
export class GastosController {
  constructor(private readonly gastosService: GastosService) {}

  @Get()
  findAll() {
    return this.gastosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gastosService.findOne(+id);
  }
}