import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Cuenta } from '../../cuentas/entities/cuenta.entity';
import { DiaSemana } from '../enums/dia-semana.enum';
import { PosicionDiaSemana } from '../enums/posicion-dia-semana.enum';
import { ModoCalculoFecha } from '../enums/modo-calculo-fecha.enum';

@Entity('TarjetaCredito')
export class TarjetaCredito {
  @PrimaryColumn()
  id: number; // mismo valor que Cuenta.id (PK compartida)

  // --- Cierre ---
  @Column({ type: 'varchar', enum: ModoCalculoFecha })
  modoCierre: ModoCalculoFecha; // POSICION_DIA_SEMANA o DIA_FIJO_MES

  @Column({ type: 'varchar', enum: DiaSemana, nullable: true })
  diaSemanaCierre?: DiaSemana; // usado si modoCierre = POSICION_DIA_SEMANA

  @Column({ type: 'varchar', enum: PosicionDiaSemana, nullable: true })
  posicionCierre?: PosicionDiaSemana; // usado si modoCierre = POSICION_DIA_SEMANA

  @Column({ nullable: true })
  diaFijoCierre?: number; // 1-31, usado si modoCierre = DIA_FIJO_MES

  // --- Vencimiento ---
  @Column({ type: 'varchar', enum: ModoCalculoFecha })
  modoVencimiento: ModoCalculoFecha; // POSICION_DIA_SEMANA, DIA_FIJO_MES, o DIAS_DESPUES_CIERRE

  @Column({ type: 'varchar', enum: DiaSemana, nullable: true })
  diaSemanaVencimiento?: DiaSemana; // usado si modoVencimiento = POSICION_DIA_SEMANA

  @Column({ type: 'varchar', enum: PosicionDiaSemana, nullable: true })
  posicionVencimiento?: PosicionDiaSemana; // usado si modoVencimiento = POSICION_DIA_SEMANA

  @Column({ nullable: true })
  diaFijoVencimiento?: number; // 1-31, usado si modoVencimiento = DIA_FIJO_MES

  @Column({ nullable: true })
  diasDespuesCierre?: number; // usado si modoVencimiento = DIAS_DESPUES_CIERRE

  @OneToOne(() => Cuenta)
  @JoinColumn({ name: 'id' })
  cuenta: Cuenta;
}