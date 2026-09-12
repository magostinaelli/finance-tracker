import { Column, Entity, PrimaryColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Categoria } from '../../categorias/entities/categoria.entity';
import { Cuenta } from '../../cuentas/entities/cuenta.entity';
import { Transaccion } from '../../transacciones/entities/transaccion.entity';

@Entity('Ingreso')
export class Ingreso {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'categoriaId' })
  categoriaId: number;

  @Column({ name: 'cuentaId' })
  cuentaId: number;

  @ManyToOne(() => Categoria, (categoria) => categoria.ingresos)
  @JoinColumn({ name: 'categoriaId' })
  categoria: Categoria;

  @ManyToOne(() => Cuenta)
  @JoinColumn({ name: 'cuentaId' })
  cuenta: Cuenta;

  @OneToOne(() => Transaccion, (transaccion) => transaccion.ingreso)
  @JoinColumn({ name: 'id' })
  transaccion: Transaccion;
}