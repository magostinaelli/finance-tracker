import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriasService {

  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(dto: CreateCategoriaDto): Promise<Categoria> {
    const categoria = this.categoriaRepository.create({
      ...dto,
      activo: dto.activo ?? true,
    });
    return this.categoriaRepository.save(categoria);
  }

  findAll() {
    return this.categoriaRepository.find();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({ where: { id } });
    if (!categoria) throw new NotFoundException(`Categoría ${id} no encontrada`);
    return categoria;
  }

  async update(id: number, dto: UpdateCategoriaDto): Promise<Categoria> {
    const categoria = await this.findOne(id);
    if (dto.nombre !== undefined) categoria.nombre = dto.nombre;
    if (dto.activo !== undefined) categoria.activo = dto.activo;
    return this.categoriaRepository.save(categoria);
  }

  async remove(id: number): Promise<void> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id },
      relations: { gastos: true, ingresos: true },
    });
    if (!categoria) throw new NotFoundException(`Categoría ${id} no encontrada`);

    const enUso = categoria.gastos.length + categoria.ingresos.length;
    if (enUso > 0) {
      throw new ConflictException(
        `La categoría está en uso en ${enUso} transacción(es). Reasignalas antes de borrarla.`,
      );
    }

    await this.categoriaRepository.delete(id);
  }
}