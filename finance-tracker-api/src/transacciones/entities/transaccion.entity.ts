import { Column, Entity, PrimaryGeneratedColumn, OneToMany, OneToOne } from 'typeorm';
import { Movimiento } from '../../movimientos/entities/movimiento.entity';
import { Gasto } from '../../gastos/entities/gasto.entity';
import { Ingreso } from '../../ingresos/entities/ingreso.entity';

@Entity('Transaccion')
export class Transaccion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.transaccion)
  movimientos: Movimiento[];

  @OneToOne(() => Gasto, (gasto) => gasto.transaccion)
  gasto: Gasto;

  @OneToOne(() => Ingreso, (ingreso) => ingreso.transaccion)
  ingreso: Ingreso;
}