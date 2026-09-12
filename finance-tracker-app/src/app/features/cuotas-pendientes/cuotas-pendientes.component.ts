import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MovimientoService } from '../../core/services/movimiento.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { Cuenta } from '../../core/models/transaccion.model';
import { MESES, Mes } from '../../core/models/mes.model';

@Component({
  selector: 'app-cuotas-pendientes',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './cuotas-pendientes.component.html',
  styleUrl: './cuotas-pendientes.component.css',
})
export class CuotasPendientesComponent implements OnInit {
  cuotas: any[] = [];
  cuentas: Cuenta[] = [];

  cuentaId: number | null = null;
  mes: number | null = null;
  anio: number | null = null;

  meses: Mes[] = MESES;
  anios: number[] = [];

  totalFuturo: number = 0;

  columnas = ['fecha', 'descripcion', 'categoria', 'cuenta', 'monto'];

  constructor(
    private movimientoService: MovimientoService,
    private cuentaService: CuentaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual; i <= anioActual + 2; i++) {
      this.anios.push(i);
    }
    this.cuentaService.getAll().subscribe(data => this.cuentas = data);
    this.cargarCuotas();
  }

  cargarCuotas(): void {
    const filtros: any = {};
    if (this.cuentaId) filtros.cuentaId = this.cuentaId;
    if (this.mes) filtros.mes = this.mes;
    if (this.anio) filtros.anio = this.anio;

    this.movimientoService.getCuotasFuturas(filtros).subscribe({
      next: (data) => {
        this.cuotas = data;
        this.totalFuturo = data.reduce((acc, c) => acc + Number(c.monto), 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  limpiarFiltros(): void {
    this.cuentaId = null;
    this.mes = null;
    this.anio = null;
    this.cargarCuotas();
  }

  getCategoria(c: any): string {
    return c.transaccion?.gasto?.categoria?.nombre ?? '-';
  }

  getCuenta(c: any): string {
    return c.transaccion?.gasto?.cuenta?.nombre ?? '-';
  }
}