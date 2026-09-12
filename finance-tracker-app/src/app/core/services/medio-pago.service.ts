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

  getAll(tipoCuenta?: string): Observable<any[]> {
    let params = new HttpParams();
    if (tipoCuenta) params = params.set('tipoCuenta', tipoCuenta);
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  create(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}