import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IngresoDatosCualitativoService } from '@app/services/configuracion/ingreso-datos-cualitativo.service';

@Injectable({
  providedIn: 'root'
})
export class GraficosMultiTestService {
datosGraficos:any = []
idLote:number = 0
idTest:number = 0
  constructor(private http: HttpClient, private IDCL: IngresoDatosCualitativoService,) { }
}

