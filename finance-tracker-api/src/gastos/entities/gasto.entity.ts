import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Cuenta } from '../../cuentas/entities/cuenta.entity';
import { MediosPago } from '../../medios-pago/entities/medios-pago.entity';
import { Transaccion } from '../../transacciones/entities/transaccion.entity';
import { Compra } from '../../compras/entities/compra.entity';
import { Pago } from '../../pagos/entities/pago.entity';
import { TipoGasto } from '../enums/tipo-gasto.enum';

@Entity('Gasto')
export class Gasto {
  @PrimaryColumn()
  id: number; // mismo valor que Transaccion.id (PK compartida)

  @Column({ type: 'varchar', enum: TipoGasto })
  tipoGasto: TipoGasto;

  @Column({ name: 'categoriaId' })
  categoriaId: number;

  @Column({ name: 'cuentaId' })
  cuentaId: number;

  @Column({ name: 'medioPagoId' })
  medioPagoId: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.gastos)
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  @ManyToOne(() => Cuenta, (cuenta) => cuenta.gastos)
  @JoinColumn({ name: 'cuentaId' })
  cuenta: Cuenta;

  @ManyToOne(() => MediosPago, (medioPago) => medioPago.gastos)
  @JoinColumn({ name: 'medioPagoId' })
  medioPago: MediosPago;

  @OneToOne(() => Transaccion, (transaccion) => transaccion.gasto)
  @JoinColumn({ name: 'id' })
  transaccion: Transaccion;

  @OneToOne(() => Compra, (compra) => compra.gasto)
  compra: Compra;

  @OneToOne(() => Pago, (pago) => pago.gasto)
  pago: Pago;
}