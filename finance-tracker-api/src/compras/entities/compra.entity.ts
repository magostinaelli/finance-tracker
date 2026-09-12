import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Gasto } from '../../gastos/entities/gasto.entity';
import { EstadoCompra } from '../enums/estado-compra.enum';

@Entity('Compra')
export class Compra {
  @PrimaryColumn()
  id: number; // mismo valor que Gasto.id

  @Column()
  cantidadCuotas: number;

  @Column({ type: 'varchar', enum: EstadoCompra })
  estado: EstadoCompra;

  @Column({ nullable: true })
  detalleOtro?: string;

  @OneToOne(() => Gasto, (gasto) => gasto.compra)
  @JoinColumn({ name: 'id' })
  gasto: Gasto;
}