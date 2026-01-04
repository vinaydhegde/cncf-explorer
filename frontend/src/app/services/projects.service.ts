import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project } from '../models/project.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  // Use relative URL for API calls (proxied through nginx)
  // In Kubernetes, nginx will proxy /api requests to the backend service
  // For local development, use the full URL
  private apiUrl = (window as any).__BACKEND_API_URL__ || '/api';

  constructor(private http: HttpClient) {}

  getProjects(maturityLevel?: string, category?: string, subcategory?: string): Observable<Project[]> {
    let params = new HttpParams();
    if (maturityLevel && maturityLevel.trim() !== '') {
      params = params.set('maturityLevel', maturityLevel);
    }
    if (category && category.trim() !== '') {
      params = params.set('category', category);
    }
    if (subcategory && subcategory.trim() !== '') {
      params = params.set('subcategory', subcategory);
    }
    return this.http.get<Project[]>(`${this.apiUrl}/projects`, { params });
  }

  getSubcategories(category?: string): Observable<string[]> {
    let params = new HttpParams();
    if (category && category.trim() !== '') {
      params = params.set('category', category);
    }
    return this.http.get<string[]>(`${this.apiUrl}/projects/subcategories`, { params });
  }

  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.apiUrl}/projects/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects/categories`);
  }

  getMaturityLevels(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/projects/maturity-levels`);
  }

  syncLandscape(): Observable<any> {
    return this.http.post(`${this.apiUrl}/landscape/sync`, {});
  }
}

