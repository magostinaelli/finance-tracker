import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResumenMensual } from '../models/resumen.model';

@Injectable({
  providedIn: 'root',
})
export class MovimientoService {
  private apiUrl = `${environment.apiUrl}/movimientos`;

  constructor(private http: HttpClient) {}

  getResumen(mes?: number, anio?: number): Observable<any> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes);
    if (anio) params = params.set('anio', anio);
    return this.http.get<any>(`${this.apiUrl}/resumen`, { params });
  }

  getResumenAnual(anio?: number): Observable<ResumenMensual[]> {
    let params = new HttpParams();
    if (anio) params = params.set('anio', anio);
    return this.http.get<ResumenMensual[]>(`${this.apiUrl}/resumen-anual`, { params });
  }

  getCuotasFuturas(filtros?: { cuentaId?: number; mes?: number; anio?: number }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros?.cuentaId) params = params.set('cuentaId', filtros.cuentaId);
    if (filtros?.mes) params = params.set('mes', filtros.mes);
    if (filtros?.anio) params = params.set('anio', filtros.anio);
    return this.http.get<any[]>(`${this.apiUrl}/cuotas-futuras`, { params });
  }
}