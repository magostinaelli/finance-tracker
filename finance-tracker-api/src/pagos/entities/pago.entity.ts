import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Gasto } from '../../gastos/entities/gasto.entity';
import { TipoServicio } from '../enums/tipo-servicio.enum';
import { Cuenta } from 'src/cuentas/entities/cuenta.entity';

@Entity('Pago')
export class Pago {
  @PrimaryColumn()
  id: number; // mismo valor que Gasto.id

  @Column({ type: 'varchar', enum: TipoServicio })
  tipoServicio: TipoServicio;

  @Column({ nullable: true })
  numeroReferencia?: string;

  @Column({ nullable: true })
  detalleOtro?: string;
  @Column({ nullable: true })
  cuentaTarjetaId?: number;

  @ManyToOne(() => Cuenta, { nullable: true })
  @JoinColumn({ name: 'cuentaTarjetaId' })
  cuentaTarjeta?: Cuenta;

  @OneToOne(() => Gasto, (gasto) => gasto.pago)
  @JoinColumn({ name: 'id' })
  gasto: Gasto;
}