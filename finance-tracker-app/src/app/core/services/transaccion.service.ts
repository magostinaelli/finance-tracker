import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getAll(filtros?: any): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.mes) params = params.set('mes', filtros.mes);
    if (filtros?.anio) params = params.set('anio', filtros.anio);
    if (filtros?.tipo) params = params.set('tipo', filtros.tipo);
    if (filtros?.cuentaId) params = params.set('cuentaId', filtros.cuentaId);
    if (filtros?.categoriaId) params = params.set('categoriaId', filtros.categoriaId);
    if (filtros?.medioPagoId) params = params.set('medioPagoId', filtros.medioPagoId);
    return this.http.get<any[]>(`${this.apiUrl}/transacciones`, { params });
  }

  crearCompra(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/compras`, data);
  }

  crearPago(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/pagos`, data);
  }

  crearIngreso(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/ingresos`, data);
  }

  cancelarCompra(id: number): Observable<any> {
  return this.http.patch(`${this.apiUrl}/compras/${id}/cancelar`, {});
}

eliminarCompra(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/compras/${id}`);
}

eliminarPago(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/pagos/${id}`);
}

eliminarIngreso(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/ingresos/${id}`);
}
}
