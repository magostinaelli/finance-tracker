import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ResumenAnual')
export class ResumenAnual {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  anio: number;

  @Column('decimal', { precision: 12, scale: 2 })
  ingresos: number;

  @Column('decimal', { precision: 12, scale: 2 })
  gastos: number;

  @Column('decimal', { precision: 12, scale: 2 })
  balance: number;

  @Column({ type: 'datetime' })
  fechaCierre: Date;
}