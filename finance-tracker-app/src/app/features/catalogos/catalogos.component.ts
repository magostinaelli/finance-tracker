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
  columnasCategoria = ['nombre', 'tipo'];

  tiposCategoria = [
    { valor: 'GASTO', nombre: 'Gasto' },
    { valor: 'INGRESO', nombre: 'Ingreso' },
  ];

  // Medios de pago
  mediosPago: MedioPago[] = [];
  nuevoMedioPago = { nombre: '', tipo: '', activo: true };
  columnasMedioPago = ['nombre', 'tipo'];

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
      next: (data) => { this.categorias = data; this.cdr.detectChanges(); },
      error: (err) => console.error(err),
    });
  }

  cargarMediosPago(): void {
    this.medioPagoService.getAll().subscribe({
      next: (data) => { this.mediosPago = data; this.cdr.detectChanges(); },
      error: (err) => console.error(err),
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