import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  async loadConfig(): Promise<void> {
    try {
      this.config = await lastValueFrom(this.http.get('/assets/config/config.json'));
    } catch (error) {
      console.error('Could not load config.json', error);
    }
  }

  get apiUrl(): string {
    return this.config?.backendUrl || '';
  }
}