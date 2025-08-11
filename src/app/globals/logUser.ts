import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from "../services/api.service";

export class createLog {
  Loguser: any = {};
  constructor(
    private datePipe: DatePipe,
    private translate: TranslateService,
    private apiService :ApiService
  ) { }

  public logObj(modulo, subModulo, item, metodo, detailObj: any, resp: any, tResp: any, DAtn?: any) {
    this.Loguser = {
      Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      hora: this.datePipe.transform(Date.now(), "shortTime"),
      Modulo: modulo,
      Submodulo: subModulo,
      Item: item,
      metodo: this.getMetodo(metodo),
      datos: JSON.stringify(detailObj),
      DatosAnteriores: DAtn,
      Respuesta: resp,
      TipoRespuesta:tResp,
      Usuario: sessionStorage.getItem('nombres') + ' ' + sessionStorage.getItem('apellidos'),
      executionTime: null,
      endpoint: null,
      userAgent: null
    }

    this.apiService.createLogAsync(this.Loguser);
  }

  getMetodo(metodo) {
    if(metodo == 'c') return "creación"
    if(metodo == 'a') return "actualización"
    if(metodo == 'e') return "eliminación"
  }

}
