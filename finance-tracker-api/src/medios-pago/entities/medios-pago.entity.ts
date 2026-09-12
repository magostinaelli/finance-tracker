import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Gasto } from '../../gastos/entities/gasto.entity';
import { TipoMedioPago } from '../enums/tipo-medio-pago.enum';

@Entity('MedioPago')
export class MediosPago {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', enum: TipoMedioPago })
  tipo: TipoMedioPago;

  @Column()
  activo: boolean;

  @OneToMany(() => Gasto, (gasto) => gasto.medioPago)
  gastos: Gasto[];
}