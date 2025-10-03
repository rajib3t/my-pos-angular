import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface AppConfig {
  apiUrl: string;
  mainDomain: string;
  production: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig | null = null;

  constructor(private http: HttpClient) {}

  /**
   * Load configuration from config.json at runtime
   * This should be called during app initialization
   */
  async loadConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      this.config = await firstValueFrom(
        this.http.get<AppConfig>('/config.json')
      );
      return this.config;
    } catch (error) {
      console.error('Failed to load config.json, using defaults', error);
      // Fallback to default values
      this.config = {
        apiUrl: 'http://localhost:8087',
        mainDomain: 'mypos.local',
        production: false
      };
      return this.config;
    }
  }

  /**
   * Get the current configuration
   * Returns null if config hasn't been loaded yet
   */
  getConfig(): AppConfig | null {
    return this.config;
  }

  /**
   * Get API URL
   */
  get apiUrl(): string {
    return this.config?.apiUrl || 'http://localhost:8087';
  }

  /**
   * Get main domain
   */
  get mainDomain(): string {
    return this.config?.mainDomain || 'mypos.local';
  }

  /**
   * Check if running in production
   */
  get isProduction(): boolean {
    return this.config?.production || false;
  }
}
