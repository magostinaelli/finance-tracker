import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { CategoriaService } from '../../core/services/categoria.service';
import { MedioPagoService } from '../../core/services/medio-pago.service';
import { Categoria, MedioPago } from '../../core/models/transaccion.model';

@Component({
  selector: 'app-catalogos',
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  templateUrl: './catalogos.component.html',
  styleUrl: './catalogos.component.css',
})
export class CatalogosComponent implements OnInit {
  // Categorías
  categorias: Categoria[] = [];
  nuevaCategoria = { nombre: '', tipo: 'GASTO', activo: true };
  columnasCategoria = ['nombre', 'tipo', 'activo', 'acciones'];
  editandoCategoriaId: number | null = null;
  nombreCategoriaEditado = '';

  tiposCategoria = [
    { valor: 'GASTO', nombre: 'Gasto' },
    { valor: 'INGRESO', nombre: 'Ingreso' },
  ];

  // Medios de pago
  mediosPago: MedioPago[] = [];
  nuevoMedioPago = { nombre: '', tipo: '', activo: true };
  columnasMedioPago = ['nombre', 'tipo', 'activo', 'acciones'];
  editandoMedioPagoId: number | null = null;
  nombreMedioPagoEditado = '';

  tiposMedioPago = [
    { valor: 'EFECTIVO', nombre: 'Efectivo' },
    { valor: 'TARJETA_DEBITO', nombre: 'Tarjeta de débito' },
    { valor: 'TARJETA_CREDITO', nombre: 'Tarjeta de crédito' },
    { valor: 'BILLETERA_VIRTUAL', nombre: 'Billetera virtual' },
  ];

  constructor(
    private categoriaService: CategoriaService,
    private medioPagoService: MedioPagoService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarMediosPago();
  }

  cargarCategorias(): void {
    this.categoriaService.getAll().subscribe({
      next: (data) => { this.categorias = data; this.cdr.markForCheck(); },
      error: (err) => console.error(err),
    });
  }

  cargarMediosPago(): void {
    this.medioPagoService.getAll(undefined, true).subscribe({
      next: (data) => { this.mediosPago = data; this.cdr.markForCheck(); },
      error: (err) => console.error(err),
    });
  }

    // ---- Categorías: editar / activar / borrar ----
  editarCategoria(c: Categoria): void {
    this.editandoCategoriaId = c.id;
    this.nombreCategoriaEditado = c.nombre;
  }

  cancelarEdicionCategoria(): void {
    this.editandoCategoriaId = null;
  }

  guardarEdicionCategoria(c: Categoria): void {
    const nombre = this.nombreCategoriaEditado.trim();
    if (!nombre) {
      this.snackBar.open('El nombre no puede estar vacío', 'OK', { duration: 3000 });
      return;
    }
    this.categoriaService.update(c.id, { nombre }).subscribe({
      next: () => {
        this.snackBar.open('Categoría actualizada', 'OK', { duration: 3000 });
        this.editandoCategoriaId = null;
        this.cargarCategorias();
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Error al actualizar', 'OK', { duration: 4000 }),
    });
  }

  toggleActivoCategoria(c: Categoria, activo: boolean): void {
    this.categoriaService.update(c.id, { activo }).subscribe({
      next: () => this.cargarCategorias(),
      error: (err) => {
        this.snackBar.open(err.error?.message ?? 'Error al actualizar', 'OK', { duration: 4000 });
        this.cargarCategorias();
      },
    });
  }

  eliminarCategoria(c: Categoria): void {
    this.categoriaService.remove(c.id).subscribe({
      next: () => {
        this.snackBar.open('Categoría eliminada', 'OK', { duration: 3000 });
        this.cargarCategorias();
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Error al eliminar', 'OK', { duration: 5000 }),
    });
  }

  // ---- Medios de pago: editar / activar / borrar ----
  editarMedioPago(m: MedioPago): void {
    this.editandoMedioPagoId = m.id;
    this.nombreMedioPagoEditado = m.nombre;
  }

  cancelarEdicionMedioPago(): void {
    this.editandoMedioPagoId = null;
  }

  guardarEdicionMedioPago(m: MedioPago): void {
    const nombre = this.nombreMedioPagoEditado.trim();
    if (!nombre) {
      this.snackBar.open('El nombre no puede estar vacío', 'OK', { duration: 3000 });
      return;
    }
    this.medioPagoService.update(m.id, { nombre }).subscribe({
      next: () => {
        this.snackBar.open('Medio de pago actualizado', 'OK', { duration: 3000 });
        this.editandoMedioPagoId = null;
        this.cargarMediosPago();
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Error al actualizar', 'OK', { duration: 4000 }),
    });
  }

  toggleActivoMedioPago(m: MedioPago, activo: boolean): void {
    this.medioPagoService.update(m.id, { activo }).subscribe({
      next: () => this.cargarMediosPago(),
      error: (err) => {
        this.snackBar.open(err.error?.message ?? 'Error al actualizar', 'OK', { duration: 4000 });
        this.cargarMediosPago();
      },
    });
  }

  eliminarMedioPago(m: MedioPago): void {
    this.medioPagoService.remove(m.id).subscribe({
      next: () => {
        this.snackBar.open('Medio de pago eliminado', 'OK', { duration: 3000 });
        this.cargarMediosPago();
      },
      error: (err) => this.snackBar.open(err.error?.message ?? 'Error al eliminar', 'OK', { duration: 5000 }),
    });
  }

  guardarCategoria(): void {
    if (!this.nuevaCategoria.nombre || !this.nuevaCategoria.tipo) {
      this.snackBar.open('Completá todos los campos', 'OK', { duration: 3000 });
      return;
    }
    this.categoriaService.create(this.nuevaCategoria).subscribe({
      next: () => {
        this.snackBar.open('Categoría creada', 'OK', { duration: 3000 });
        this.nuevaCategoria = { nombre: '', tipo: 'GASTO', activo: true };
        this.cargarCategorias();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al crear categoría', 'OK', { duration: 3000 });
      },
    });
  }

  guardarMedioPago(): void {
    if (!this.nuevoMedioPago.nombre || !this.nuevoMedioPago.tipo) {
      this.snackBar.open('Completá todos los campos', 'OK', { duration: 3000 });
      return;
    }
    this.medioPagoService.create(this.nuevoMedioPago).subscribe({
      next: () => {
        this.snackBar.open('Medio de pago creado', 'OK', { duration: 3000 });
        this.nuevoMedioPago = { nombre: '', tipo: '', activo: true };
        this.cargarMediosPago();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Error al crear medio de pago', 'OK', { duration: 3000 });
      },
    });
  }
}