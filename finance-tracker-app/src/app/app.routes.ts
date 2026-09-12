import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TransaccionesComponent } from './features/transacciones/transacciones.component';
import { NuevaTransaccionComponent } from './features/nueva-transaccion/nueva-transaccion.component';
import { CuentasComponent } from './features/cuentas/cuentas.component';
import { CatalogosComponent } from './features/catalogos/catalogos.component';
import { CuotasPendientesComponent } from './features/cuotas-pendientes/cuotas-pendientes.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'transacciones', component: TransaccionesComponent },
  { path: 'nueva-transaccion', component: NuevaTransaccionComponent },
  { path: 'cuentas', component: CuentasComponent },
  { path: 'catalogos', component: CatalogosComponent },
  { path: 'cuotas-pendientes', component: CuotasPendientesComponent },
];