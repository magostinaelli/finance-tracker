import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TransaccionService } from '../../core/services/transaccion.service';
import { CategoriaService } from '../../core/services/categoria.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { MedioPagoService } from '../../core/services/medio-pago.service';
import { Transaccion, Categoria, Cuenta, MedioPago } from '../../core/models/transaccion.model';
import { MESES, Mes } from '../../core/models/mes.model';
import { TIPOS_TRANSACCION, TipoOpcion } from '../../core/models/tipo-transaccion.model';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-transacciones',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './transacciones.component.html',
  styleUrl: './transacciones.component.css',
})
export class TransaccionesComponent implements OnInit {
  transacciones: Transaccion[] = [];
  categorias: Categoria[] = [];
  cuentas: Cuenta[] = [];
  mediosPago: MedioPago[] = [];

  mes: number | null = new Date().getMonth() + 1;
  anio: number | null = new Date().getFullYear();
  tipo: string | null = null;
  cuentaId: number | null = null;
  categoriaId: number | null = null;
  medioPagoId: number | null = null;

  meses: Mes[] = MESES;
  anios: number[] = [];
  tipos: TipoOpcion[] = TIPOS_TRANSACCION;

  columnas = ['fecha', 'tipo', 'descripcion', 'categoria', 'cuenta', 'medioPago', 'monto', 'acciones'];

  constructor(
    private transaccionService: TransaccionService,
    private categoriaService: CategoriaService,
    private cuentaService: CuentaService,
    private medioPagoService: MedioPagoService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    const anioActual = new Date().getFullYear();
    for (let i = anioActual - 3; i <= anioActual + 2; i++) {
      this.anios.push(i);
    }
    this.cargarCatalogos();
    this.cargarTransacciones();
  }

  cargarCatalogos(): void {
    this.categoriaService.getAll().subscribe(data => {
      this.categorias = data;
      this.cdr.markForCheck();
    });
    this.cuentaService.getAll().subscribe(data => {
      this.cuentas = data;
      this.cdr.markForCheck();
    });
    this.medioPagoService.getAll().subscribe(data => {
      this.mediosPago = data;
      this.cdr.markForCheck();
    });
  }

  cargarTransacciones(): void {
    const filtros: any = {};
    if (this.mes) filtros.mes = this.mes;
    if (this.anio) filtros.anio = this.anio;
    if (this.tipo) filtros.tipo = this.tipo;
    if (this.cuentaId) filtros.cuentaId = this.cuentaId;
    if (this.categoriaId) filtros.categoriaId = this.categoriaId;
    if (this.medioPagoId) filtros.medioPagoId = this.medioPagoId;
    filtros.mostrarCanceladas = this.mostrarCanceladas;

    this.transaccionService.getAll(filtros).subscribe({
      next: (data) => {
        this.transacciones = data;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error:', err),
    });
  }

  limpiarFiltros(): void {
    this.mes = null;
    this.anio = null;
    this.tipo = null;
    this.cuentaId = null;
    this.categoriaId = null;
    this.medioPagoId = null;
    this.cargarTransacciones();
    this.mostrarCanceladas = false;
  }

  getTipo(t: Transaccion): string {
    if (t.ingreso) return 'Ingreso';
    if (t.gasto?.compra) return 'Compra';
    return 'Pago';
  }

  getDescripcion(t: Transaccion): string {
    return t.movimientos?.[0]?.descripcion ?? '-';
  }

  getCategoria(t: Transaccion): string {
    return t.gasto?.categoria?.nombre ?? t.ingreso?.categoria?.nombre ?? '-';
  }

  getCuenta(t: Transaccion): string {
    return t.gasto?.cuenta?.nombre ?? t.ingreso?.cuenta?.nombre ?? '-';
  }

  getMonto(t: Transaccion): number {
    return t.movimientos?.reduce((acc, m) => acc + Number(m.monto), 0) ?? 0;
  }

  esIngreso(t: Transaccion): boolean {
    return !!t.ingreso;
  }

  getMedioPago(t: Transaccion): string {
    return t.gasto?.medioPago?.nombre ?? '-';
  }

  mostrarCanceladas: boolean = false;


 

  cancelar(t: Transaccion): void {
    if (!t.gasto?.compra) return;
    this.transaccionService.cancelarCompra(t.gasto.compra.id).subscribe({
      next: () => {
        this.snackBar.open('Compra cancelada', 'OK', { duration: 3000 });
        this.cargarTransacciones();
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Error al cancelar', 'OK', { duration: 4000 }),
    });
  }

  eliminar(t: Transaccion): void {
    let observable;
    if (t.gasto?.compra) {
      observable = this.transaccionService.eliminarCompra(t.gasto.compra.id);
    } else if (t.gasto?.pago) {
      observable = this.transaccionService.eliminarPago(t.gasto.pago.id);
    } else if (t.ingreso) {
      observable = this.transaccionService.eliminarIngreso(t.ingreso.id);
    } else return;

    observable.subscribe({
      next: () => {
        this.snackBar.open('Eliminado correctamente', 'OK', { duration: 3000 });
        this.cargarTransacciones();
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Error al eliminar', 'OK', { duration: 4000 }),
    });
  }

  esCancelada(t: Transaccion): boolean {
    return t.gasto?.compra?.estado === 'CANCELADA';
  }
getCategoriaId(t: Transaccion): number | null {
  return t.gasto?.categoriaId ?? t.ingreso?.categoriaId ?? null;
}

getCategoriasDisponibles(t: Transaccion): Categoria[] {
  const tipo = t.ingreso ? 'INGRESO' : 'GASTO';
  return this.categorias.filter(c => c.tipo === tipo);
}

cambiarCategoria(t: Transaccion, categoriaId: number): void {
  let observable;
  if (t.gasto?.compra) {
    observable = this.transaccionService.actualizarCategoriaCompra(t.gasto.compra.id, categoriaId);
  } else if (t.gasto?.pago) {
    observable = this.transaccionService.actualizarCategoriaPago(t.gasto.pago.id, categoriaId);
  } else if (t.ingreso) {
    observable = this.transaccionService.actualizarCategoriaIngreso(t.ingreso.id, categoriaId);
  } else return;

  observable.subscribe({
    next: () => {
      this.snackBar.open('Categoría actualizada', 'OK', { duration: 3000 });
      this.cargarTransacciones();
    },
    error: (err) => {
      this.snackBar.open(err.error?.message ?? 'Error al actualizar', 'OK', { duration: 4000 });
      this.cargarTransacciones();
    },
  });
}

}