import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EnterpriseSolution } from '../models/enterprise-solution.model';

@Injectable({
  providedIn: 'root'
})
export class EnterpriseSolutionsService {
  // Use relative URL for API calls (proxied through nginx)
  // In Kubernetes, nginx will proxy /api requests to the backend service
  // For local development, use the full URL
  private apiUrl = (window as any).__BACKEND_API_URL__ || '/api';

  constructor(private http: HttpClient) {}

  getEnterpriseSolutions(category?: string): Observable<EnterpriseSolution[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<EnterpriseSolution[]>(`${this.apiUrl}/enterprise-solutions`, { params });
  }

  getEnterpriseSolution(id: string): Observable<EnterpriseSolution> {
    return this.http.get<EnterpriseSolution>(`${this.apiUrl}/enterprise-solutions/${id}`);
  }

  createEnterpriseSolution(solution: EnterpriseSolution): Observable<EnterpriseSolution> {
    return this.http.post<EnterpriseSolution>(`${this.apiUrl}/enterprise-solutions`, solution);
  }

  updateEnterpriseSolution(id: string, solution: Partial<EnterpriseSolution>): Observable<EnterpriseSolution> {
    return this.http.patch<EnterpriseSolution>(`${this.apiUrl}/enterprise-solutions/${id}`, solution);
  }

  deleteEnterpriseSolution(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/enterprise-solutions/${id}`);
  }
}

