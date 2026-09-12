import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MovimientoService } from '../../core/services/movimiento.service';
import { MESES, Mes } from '../../core/models/mes.model';
import { Resumen } from '../../core/models/resumen.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  mes: number = new Date().getMonth() + 1;
  anio: number = new Date().getFullYear();
  resumen: Resumen | null = null;
  cuotasProximas: any[] = [];
  totalProximo: number = 0;

  meses: Mes[] = MESES;
  anios: number[] = [];

  constructor(
    private movimientoService: MovimientoService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual - 3; i <= anioActual + 2; i++) {
      this.anios.push(i);
    }
    this.cargarResumen();
    this.cargarCuotasProximas();
  }

  cargarResumen(): void {
    this.movimientoService.getResumen(this.mes, this.anio).subscribe({
      next: (data) => {
        this.resumen = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando resumen:', err),
    });
  }

  cargarCuotasProximas(): void {
    this.movimientoService.getCuotasFuturas().subscribe({
      next: (data: any[]) => {
        this.cuotasProximas = data.slice(0, 5);
        this.totalProximo = data.reduce((acc: number, c: any) => acc + Number(c.monto), 0);
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err),
    });
  }
}