import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root'
})
export class PrecargaService  {

    private urlBase  : string = environment.apiUrl;

    constructor(private http: HttpClient) {}

    guardarPrecarga(data:any){
        return this.http.post(this.urlBase+'PreloadmetQuality',data);
    }
    actualizarPrecarga(id:number,data:any){
        return this.http.put(this.urlBase+'PreloadmetQuality/'+id,data);
    }
    eliminarPrecarga(id:number){
        return this.http.delete(this.urlBase+'PreloadmetQuality/'+id);
    }
    public async obtenerPrecargaPorFuenteAnalitoAsync(idSource:any,idanaytes:any){
        return await this.http.get(this.urlBase+`PreloadmetQuality/InfoPreloadmetQuality/${idSource}/${idanaytes}`).toPromise();
    }
    obtenerPrecargaPorAnalito(IdAnaytes:any){
        return this.http.get(this.urlBase+`PreloadmetQuality/InfoPreloadmetQualityAnalyte/${IdAnaytes}`);
    }
}