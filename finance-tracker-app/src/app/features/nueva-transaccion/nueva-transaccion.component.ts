import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CategoriaService } from '../../core/services/categoria.service';
import { CuentaService } from '../../core/services/cuenta.service';
import { MedioPagoService } from '../../core/services/medio-pago.service';
import { TransaccionService } from '../../core/services/transaccion.service';
import { Categoria, Cuenta, MedioPago } from '../../core/models/transaccion.model';
import { MESES } from '../../core/models/mes.model';
import { ESTADOS_COMPRA, TipoOpcion, TIPOS_SERVICIO, TIPOS_TRANSACCION } from '../../core/models/tipo-transaccion.model';

@Component({
  selector: 'app-nueva-transaccion',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  templateUrl: './nueva-transaccion.component.html',
  styleUrl: './nueva-transaccion.component.css',
})
export class NuevaTransaccionComponent implements OnInit {
  tipo: 'COMPRA' | 'PAGO_SERVICIO' | 'INGRESO' | null = null;

  categorias: Categoria[] = [];
  cuentas: Cuenta[] = [];
  mediosPago: MedioPago[] = [];

  tipos: TipoOpcion[] = TIPOS_TRANSACCION;
  tiposServicio: TipoOpcion[] = TIPOS_SERVICIO;
  estadosCompra: TipoOpcion[] = ESTADOS_COMPRA;

  // Campos comunes
  fecha: Date = new Date();
  monto: number | null = null;
  descripcion: string = '';
  categoriaId: number | null = null;
  cuentaId: number | null = null;
  medioPagoId: number | null = null;

  // Campos de Compra
  cantidadCuotas: number = 1;
  estado: string = 'PENDIENTE';

  // Campos de Pago
  tipoServicio: string | null = null;
  numeroReferencia: string = '';

  cargando = false;

  constructor(
    private categoriaService: CategoriaService,
    private cuentaService: CuentaService,
    private medioPagoService: MedioPagoService,
    private transaccionService: TransaccionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.categoriaService.getAll().subscribe(data => this.categorias = data);
    this.cuentaService.getAll().subscribe(data => this.cuentas = data);
    this.medioPagoService.getAll().subscribe(data => this.mediosPago = data);
  }

  get categoriasFiltradas(): Categoria[] {
    if (!this.tipo) return this.categorias;
    const tipoCategoria = this.tipo === 'INGRESO' ? 'INGRESO' : 'GASTO';
    return this.categorias.filter(c => c.tipo === tipoCategoria);
  }

  formatearFecha(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  guardar(): void {
    const esIngreso = this.tipo === 'INGRESO';  
    if (!this.tipo || !this.fecha || !this.monto || !this.categoriaId || !this.cuentaId || (!esIngreso && !this.medioPagoId)) {
      this.snackBar.open('Completá todos los campos obligatorios', 'OK', { duration: 3000 });
      return;
    }

    this.cargando = true;
    const fechaStr = this.formatearFecha(this.fecha);

    let observable;

    if (this.tipo === 'COMPRA') {
      observable = this.transaccionService.crearCompra({
        descripcion: this.descripcion,
        fecha: fechaStr,
        montoTotal: this.monto,
        cantidadCuotas: this.cantidadCuotas,
        estado: this.estado,
        categoriaId: this.categoriaId,
        cuentaId: this.cuentaId,
        medioPagoId: this.medioPagoId,
      });
    } else if (this.tipo === 'PAGO_SERVICIO') {
      observable = this.transaccionService.crearPago({
        descripcion: this.descripcion,
        fecha: fechaStr,
        monto: this.monto,
        tipoServicio: this.tipoServicio,
        numeroReferencia: this.numeroReferencia || null,
        categoriaId: this.categoriaId,
        cuentaId: this.cuentaId,
        medioPagoId: this.medioPagoId,
      });
    } else {
      observable = this.transaccionService.crearIngreso({
        descripcion: this.descripcion,
        fecha: fechaStr,
        monto: this.monto,
        categoriaId: this.categoriaId,
        cuentaId: this.cuentaId,
        medioPagoId: this.medioPagoId,
      });
    }

    observable.subscribe({
      next: () => {
        this.snackBar.open('Guardado correctamente', 'OK', { duration: 3000 });
        this.router.navigate(['/transacciones']);
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al guardar', 'OK', { duration: 3000 });
        this.cargando = false;
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/transacciones']);
  }
onCuentaChange(): void {
  const cuenta = this.cuentas.find(c => c.id === this.cuentaId);
  if (!cuenta) return;

  // Recargar medios de pago compatibles con esta cuenta
  this.medioPagoService.getAll(cuenta.tipo).subscribe(data => {
    this.mediosPago = data;
    this.cdr.detectChanges();

    // Pre-seleccionar el medio de pago default según el tipo de cuenta
    const defaults: Record<string, string> = {
      'EFECTIVO': 'EFECTIVO',
      'BILLETERA_VIRTUAL': 'BILLETERA_VIRTUAL',
      'TARJETA_DEBITO': 'TARJETA_DEBITO',
      'TARJETA_CREDITO': 'TARJETA_CREDITO',
    };

    const tipoDefault = defaults[cuenta.tipo];
    if (tipoDefault) {
      const medioPorDefecto = data.find(m => m.tipo === tipoDefault);
      this.medioPagoId = medioPorDefecto?.id ?? null;
    }
  });
}


}