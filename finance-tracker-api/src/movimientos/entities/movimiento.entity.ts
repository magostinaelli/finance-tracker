import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Transaccion } from '../../transacciones/entities/transaccion.entity';

@Entity('Movimiento')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column('decimal', { precision: 12, scale: 2 })
  monto: number;

  @Column({ nullable: true })
  descripcion?: string;

  @Column({ nullable: true })
  detalleOtro?: string;

  @Column({ name: 'transaccionId' })
  transaccionId: number;

  @ManyToOne(() => Transaccion, (transaccion) => transaccion.movimientos)
  @JoinColumn({ name: 'transaccionId' })
  transaccion: Transaccion;
}