import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MovimientoService } from '../../core/services/movimiento.service';
import { MESES, Mes } from '../../core/models/mes.model';
import { CategoriaResumen, Resumen, ResumenMensual } from '../../core/models/resumen.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    RouterLink,
    BaseChartDirective,
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

  readonly paletaIngresos = ['#3b7fd6', '#8cc152', '#1fb0c4', '#2f4f9e', '#5fb7ec', '#59b896', '#6fa8dc', '#2f9e6e'];
  readonly paletaGastos = ['#f7d56e', '#9e2f55', '#f0b429', '#dc4f4a', '#ee7d33', '#e8799b', '#f4a58a', '#b8434f'];

  readonly colorBarraIngresos = '#2f9e6e';
  readonly colorBarraGastos = '#dc4f4a';

  private formatoMoneda = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });

  // Gráfico de barras: ingresos vs gastos por mes
  barData: ChartData<'bar'> = { labels: [], datasets: [] };
  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${this.formatoMoneda.format(Number(ctx.parsed.y))}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (valor) => this.formatoMoneda.format(Number(valor)) },
      },
    },
  };

  // Gráficos de torta: ingresos y gastos por categoría
  pieIngresosData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieGastosData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${this.formatoMoneda.format(Number(ctx.parsed))}`,
        },
      },
    },
  };

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
    this.cargarResumenAnual();
    this.cargarCuotasProximas();
  }

  get nombreMes(): string {
    return this.meses.find((m) => m.valor === this.mes)?.nombre ?? '';
  }

  getColor(categoriaId: number, tipo: 'ingreso' | 'gasto'): string {
    const paleta = tipo === 'ingreso' ? this.paletaIngresos : this.paletaGastos;
    return paleta[categoriaId % paleta.length];
  }

  getPorcentaje(valor: number, total: number): string {
    return total > 0 ? `${Math.round((Number(valor) * 100) / total)}%` : '0%';
  }

  cambiarAnio(): void {
    this.cargarResumen();
    this.cargarResumenAnual();
  }

  cargarResumen(): void {
    this.movimientoService.getResumen(this.mes, this.anio).subscribe({
      next: (data: Resumen) => {
        this.resumen = data;
        this.pieIngresosData = this.armarPie(data.categoriasIngresos, 'ingreso');
        this.pieGastosData = this.armarPie(data.categoriasGastos, 'gasto');
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando resumen:', err),
    });
  }

  cargarResumenAnual(): void {
    this.movimientoService.getResumenAnual(this.anio).subscribe({
      next: (data: ResumenMensual[]) => {
        this.barData = {
          labels: data.map(
            (d) => this.meses.find((m) => m.valor === d.mes)?.nombre.slice(0, 3) ?? String(d.mes),
          ),
          datasets: [
            { label: 'Ingresos', data: data.map((d) => Number(d.ingresos)), backgroundColor: this.colorBarraIngresos },
            { label: 'Gastos', data: data.map((d) => Number(d.gastos)), backgroundColor: this.colorBarraGastos },
          ],
        };
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error cargando resumen anual:', err),
    });
  }

  cargarCuotasProximas(): void {
    this.movimientoService.getCuotasFuturas().subscribe({
      next: (data: any[]) => {
        this.cuotasProximas = data.slice(0, 5);
        this.totalProximo = data.reduce((acc: number, c: any) => acc + Number(c.monto), 0);
        this.cdr.markForCheck();
      },
      error: (err: any) => console.error(err),
    });
  }

  private armarPie(categorias: CategoriaResumen[], tipo: 'ingreso' | 'gasto'): ChartData<'pie'> {
    return {
      labels: categorias.map((c) => c.nombre),
      datasets: [
        {
          data: categorias.map((c) => Number(c.total)),
          backgroundColor: categorias.map((c) => this.getColor(c.categoriaId, tipo)),
        },
      ],
    };
  }
}