import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { TipoCuenta } from '../enums/tipo-cuenta.enum';
import { Gasto } from 'src/gastos/entities/gasto.entity';
import { Ingreso } from 'src/ingresos/entities/ingreso.entity';

@Entity('Cuenta')
export class Cuenta {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'varchar', enum: TipoCuenta })
  tipo: TipoCuenta;

  @Column()
  activo: boolean;

  @OneToMany(() => Gasto, (gasto) => gasto.cuenta)
  gastos: Gasto[];

}