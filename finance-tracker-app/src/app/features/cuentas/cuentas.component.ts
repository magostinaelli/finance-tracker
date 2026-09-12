import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CuentaService } from '../../core/services/cuenta.service';
import { Cuenta } from '../../core/models/transaccion.model';
import {
  TIPOS_CUENTA,
  MODOS_CALCULO,
  DIAS_SEMANA,
  POSICIONES_DIA,
  OpcionCalculo,
} from '../../core/models/tarjeta-credito.model';

@Component({
  selector: 'app-cuentas',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './cuentas.component.html',
  styleUrl: './cuentas.component.css',
})
export class CuentasComponent implements OnInit {
  cuentas: Cuenta[] = [];
  columnas = ['nombre', 'tipo', 'activo', 'acciones'];

  tiposCuenta: OpcionCalculo[] = TIPOS_CUENTA;
  modosCalculo: OpcionCalculo[] = MODOS_CALCULO;
  diasSemana: OpcionCalculo[] = DIAS_SEMANA;
  posicionesDia: OpcionCalculo[] = POSICIONES_DIA;

  nuevaCuenta = {
    nombre: '',
    tipo: '',
    activo: true,
    modoCierre: null as string | null,
    diaSemanaCierre: null as string | null,
    posicionCierre: null as string | null,
    diaFijoCierre: null as number | null,
    modoVencimiento: null as string | null,
    diaSemanaVencimiento: null as string | null,
    posicionVencimiento: null as string | null,
    diaFijoVencimiento: null as number | null,
    diasDespuesCierre: null as number | null,
  };

  cargando = false;

  constructor(
    private cuentaService: CuentaService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarCuentas();
  }

  get esTarjetaCredito(): boolean {
    return this.nuevaCuenta.tipo === 'TARJETA_CREDITO';
  }

  get modoCierreEsPosicion(): boolean {
    return this.nuevaCuenta.modoCierre === 'POSICION_DIA_SEMANA';
  }

  get modoCierreEsFijo(): boolean {
    return this.nuevaCuenta.modoCierre === 'DIA_FIJO_MES';
  }

  get modoVencimientoEsPosicion(): boolean {
    return this.nuevaCuenta.modoVencimiento === 'POSICION_DIA_SEMANA';
  }

  get modoVencimientoEsFijo(): boolean {
    return this.nuevaCuenta.modoVencimiento === 'DIA_FIJO_MES';
  }

  get modoVencimientoEsDias(): boolean {
    return this.nuevaCuenta.modoVencimiento === 'DIAS_DESPUES_CIERRE';
  }

  cargarCuentas(): void {
    this.cuentaService.getAll().subscribe({
      next: (data) => { this.cuentas = data; this.cdr.detectChanges(); },
      error: (err) => console.error(err),
    });
  }

  guardar(): void {
    if (!this.nuevaCuenta.nombre || !this.nuevaCuenta.tipo) {
      this.snackBar.open('Completá nombre y tipo', 'OK', { duration: 3000 });
      return;
    }

    this.cargando = true;
    this.cuentaService.create(this.nuevaCuenta).subscribe({
      next: (res) => {
        const aviso = res?.aviso;
        if (aviso) {
          this.snackBar.open(aviso, 'OK', { duration: 6000 });
        } else {
          this.snackBar.open('Cuenta creada correctamente', 'OK', { duration: 3000 });
        }
        this.nuevaCuenta = {
          nombre: '', tipo: '', activo: true,
          modoCierre: null, diaSemanaCierre: null, posicionCierre: null, diaFijoCierre: null,
          modoVencimiento: null, diaSemanaVencimiento: null, posicionVencimiento: null,
          diaFijoVencimiento: null, diasDespuesCierre: null,
        };
        this.cargarCuentas();
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al crear cuenta', 'OK', { duration: 3000 });
        this.cargando = false;
      },
    });
  }

  desactivar(cuenta: Cuenta): void {
    this.cuentaService.desactivar(cuenta.id).subscribe({
      next: (res) => {
        let mensaje = `Cuenta "${cuenta.nombre}" desactivada.`;
        if (res.tieneCuotasFuturas) {
          mensaje += ` Tiene ${res.cantidadCuotasFuturas} cuota(s) futura(s) pendiente(s).`;
        }
        if (res.ultimoMovimiento) {
          mensaje += ` Último movimiento: ${new Date(res.ultimoMovimiento).toLocaleDateString('es-AR')}.`;
        }
        this.snackBar.open(mensaje, 'OK', { duration: 8000 });
        this.cargarCuentas();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al desactivar cuenta', 'OK', { duration: 3000 });
      },
    });
  }

  eliminar(cuenta: Cuenta): void {
    this.cuentaService.eliminar(cuenta.id).subscribe({
      next: () => {
        this.snackBar.open(`Cuenta "${cuenta.nombre}" eliminada.`, 'OK', { duration: 3000 });
        this.cargarCuentas();
      },
      error: (err) => {
        const mensaje = err.error?.message ?? 'Error al eliminar cuenta';
        this.snackBar.open(mensaje, 'OK', { duration: 5000 });
      },
    });
  }

  activar(cuenta: Cuenta): void {
  this.cuentaService.activar(cuenta.id).subscribe({
    next: () => {
      this.snackBar.open(`Cuenta "${cuenta.nombre}" activada.`, 'OK', { duration: 3000 });
      this.cargarCuentas();
    },
    error: (err) => {
      console.error(err);
      this.snackBar.open('Error al activar cuenta', 'OK', { duration: 3000 });
    },
  });
}
}