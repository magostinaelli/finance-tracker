export interface CategoriaResumen {
  categoriaId: number;
  nombre: string;
  total: number;
}

export interface Resumen {
  mes: number;
  anio: number;
  ingresos: number;
  gastos: number;
  balance: number;
  categoriasIngresos: CategoriaResumen[];
  categoriasGastos: CategoriaResumen[];
}

export interface ResumenMensual {
  mes: number;
  ingresos: number;
  gastos: number;
}