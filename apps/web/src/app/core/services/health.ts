import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';


export interface HealthResponse {
  status: 'Ok' | 'degraded' | 'down';
}

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  private http = inject(HttpClient)
  private readonly baseUrl = `${environment.apiUrl}/health`;

  check(): Observable<HealthResponse> {
    return this.http.get<HealthResponse>(this.baseUrl)
  }
}
