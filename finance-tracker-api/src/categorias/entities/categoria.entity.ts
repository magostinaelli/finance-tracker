import { Column, Entity, PrimaryGeneratedColumn, OneToMany  } from 'typeorm';
import { TipoCategoria } from '../enums/tipo-categoria.enum';
import { Gasto } from 'src/gastos/entities/gasto.entity';
import { Ingreso } from 'src/ingresos/entities/ingreso.entity';

@Entity('Categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', enum: TipoCategoria })
  tipo: TipoCategoria;

  @Column()
  activo: boolean;

  @OneToMany(() => Gasto, (gasto) => gasto.categoria)
  gastos: Gasto[];

  @OneToMany(() => Ingreso, (ingreso) => ingreso.categoria)
  ingresos: Ingreso[];
}