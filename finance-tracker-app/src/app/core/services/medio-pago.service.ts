import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MedioPagoService {
  private apiUrl = `${environment.apiUrl}/medios-pago`;

  constructor(private http: HttpClient) {}

  getAll(tipoCuenta?: string, incluirInactivos = false): Observable<any[]> {
    let params = new HttpParams();
    if (tipoCuenta) params = params.set('tipoCuenta', tipoCuenta);
    if (incluirInactivos) params = params.set('incluirInactivos', true);
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  update(id: number, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}