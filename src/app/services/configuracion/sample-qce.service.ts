import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SampleQceService extends ApiService {

  constructor(private http: HttpClient) {
    super(http);
    this.apiURL += 'qce/sampleQce';
  }
// Método para registrar logs de operación
  logOperacionAsync(logData: any): Promise<any> {
    const urlLogs = `${environment.apiUrl}logs`; // ⚠️ Asegúrate que `environment.apiUrl` ya incluya: https://valiqc-backend-general-desarrollo.azurewebsites.net/
    console.log('[logOperacionAsync] Enviando log a:', urlLogs);
    console.log('[logOperacionAsync] Payload:', logData);
    return this.http.post(urlLogs, logData).toPromise();
  }
}
