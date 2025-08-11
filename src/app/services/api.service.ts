import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environment/environment';

export abstract class ApiService {
  public apiURL = environment.apiUrl;
  public apiMongo = environment.apiUrlMongo;
  httpClient: HttpClient;

  constructor(httpClient) {
    this.httpClient = httpClient;
  }

  public async createAsync(entity: any): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return await this.httpClient.post<any>(this.apiURL, entityJson, { headers: reqHeaders }).toPromise();
  }

  public async createLogAsync(entity: any): Promise<any> {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return await this.httpClient.post<any>(this.apiMongo, entityJson, { headers: reqHeaders }).toPromise();
  }

  public createLogsReportes(entity: any, ruta: string): Promise<any> {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return this.httpClient.post<any>(this.apiMongo + '/' + ruta, entityJson, { headers: reqHeaders }).toPromise();
  }
  
  public async updateAsync(entity: any, id: string): Promise<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    const entityJson = JSON.stringify(entity);
    return await this.httpClient.put<any>(this.apiURL + id, entityJson, { headers: reqHeaders }).toPromise();
  }
  public deleteAsync(id: any) {
    return this.httpClient.delete<any>(this.apiURL + id);
  }


  public async getByIdAsync(id: any) {
    return await this.httpClient.get(this.apiURL + '/' + id).toPromise();
  }
  public getByIdAsync2(id: any) {
    return this.httpClient.get(this.apiURL + '/' + id);
  }

  public async gebByIdSeccionMateriasControl(id: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return await this.httpClient.get<any>(`${environment.apiUrl}ControlMaterial/controlmatxsection/${id}`, { headers: reqHeaders });
  }


  public gebByIdSeccionMateriasSedeControl(id: any, idSede: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${environment.apiUrl}ControlMaterial/controlmaterialxsedesection/${id}/${idSede}`, { headers: reqHeaders });
  }

  public async gebByIdMaterialLote(id: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return await this.httpClient.get<any>(`${environment.apiUrl}lots/lotesxctrlmat/${id}`, { headers: reqHeaders });
  }

  public async gebByIdMaterialSedeLote(id: any, idSede: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return await this.httpClient.get<any>(`${environment.apiUrl}Lots/lotesxctrlmatsede/${id}/${idSede}`, { headers: reqHeaders });
  }
  public async getAllAsync(): Promise<any> {
    return await this.httpClient.get<any>(this.apiURL).toPromise();
  }

  public async getProgramasPorCliente(nit: string, idsede: number): Promise<any> {
    return this.httpClient.get<any>(`${environment.apiUrl}qce/ProgramQce/programxclient/${nit}/${idsede}`).toPromise();
  }

  public async getConsultarLote(lote: any): Promise<any> {
    return await this.httpClient.get<any>(`${environment.apiUrl}Lots/infolotsxnumlot/'${lote}'`).toPromise();
  }
  public async getAllAsyncNoDuplicado(): Promise<any> {
    return await this.httpClient.get<any>(`${this.apiURL}/lotclone01`).toPromise();
  }

  public create(entity: any, response?: boolean): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });

    if (response) {
      return this.httpClient.post<any>(`${this.apiURL}`, entity, {
        headers: reqHeaders,
        observe: 'response'
      });
    } else {
      return this.httpClient.post<any>(`${this.apiURL}`, entity, {
        headers: reqHeaders
      });
    }
  }


  // public update(entity: any, id: any): Observable<any> {
  //   const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  //   const entityJson = JSON.stringify(entity);
  //   if (Response)
  //   return this.httpClient.put<any>(`${this.apiURL}/${id}`, entityJson, { headers: reqHeaders,observe: 'response' });
  // }

public update(entity: any, id: any, response: boolean = false): Observable<any> {
  const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
  const entityJson = JSON.stringify(entity);

  if (response) {
    return this.httpClient.put<any>(`${this.apiURL}/${id}`, entityJson, {
      headers: reqHeaders,
      observe: 'response'
    });
  } else {
    return this.httpClient.put<any>(`${this.apiURL}/${id}`, entityJson, {
      headers: reqHeaders
    });
  }
}



  public delete(url: string, id: any, response: boolean = false): Observable<any> {
    if (response) {
      return this.httpClient.delete<any>(`${this.apiURL}/${id}`, {
        observe: 'response'
      });
    } else {
      return this.httpClient.delete<any>(`${this.apiURL}/${id}`);
    }
  }



  public deleteArray(url: string, ids: any[]): Observable<any> {
    // Crear un objeto de opciones para incluir el cuerpo en la solicitud DELETE
    const options = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: ids
    };
    return this.httpClient.delete<any>(`${this.apiURL}/${url}`, options);
  }

  public getAll(url: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/${url}`);
  }

  public obtenerToken() {
    return sessionStorage.getItem('token');
  }

  public getReglas(sede: number, material: number, lote: number, analito: number) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/infowestgardxanalito/${sede}/${material}/${lote}/${analito}`, { headers: reqHeaders }).toPromise();
  }

  // filtro conf por test
  public getBuscadorConfigObjCalidad(datos: any) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/configobjcalidad/${datos}`, { headers: reqHeaders });

  }

  public getTestFiltro(lab: number, sec: number, mat: number, lot: number) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/configqcxtest/${lab}/${sec}/${mat}/${lot}`, { headers: reqHeaders });

  }

  // filtro valores diana
  public getBuscadorConfiDianaValue(datos: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/configdianavaluextest/${datos}`, { headers: reqHeaders }).toPromise();
  }

  public getTestFiltroDianaValues(lab: number, sec: number, mat: number, lot: number) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/configdianavalue/${lab}/${sec}/${mat}/${lot}`, { headers: reqHeaders });

  }

  // filtro config reglas de westgard
  public getBuscadorWestgard(datos: any) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/configwestgardxtest/${datos}`, { headers: reqHeaders });

  }

  public getTestFiltroConfigWestgard(lab: number, sec: number, mat: number, lot: number) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/configwestgard/${lab}/${sec}/${mat}/${lot}`, { headers: reqHeaders });

  }

  // filtro media y ds
  public getBuscadorConfiMediaDS(datos: any) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/configMediadsxtest/${datos}`, { headers: reqHeaders }).toPromise();

  }

  public getTestFiltroMediaDS(lab: number, sec: number, mat: number, lot: number) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/filterconfigMediads/${lab}/${sec}/${mat}/${lot}`, { headers: reqHeaders });

  }

  //-------- filtro ingreso de datos----------
  public getBuscador(datos: any) { // datos para la tabla

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/inforesultsxtest/${datos}`, { headers: reqHeaders }).toPromise();

  }
  public getBuscadorGraficas(datos: any) { // datos para las graficas

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/inforesultsxtestgraphs/${datos}`, { headers: reqHeaders }).toPromise();

  }
  public getBuscadorByDates(fechainicial: string, fechafinal: string, idTest: number) {  // datos para las graficas por fechas

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/inforesultstestsxfechas/${fechainicial}/${fechafinal}/${idTest}`, { headers: reqHeaders }).toPromise();

  }
  // ------------------------------------------------

  public getTestFiltroIngresoDatos(lab: number, sec: number, mat: number, lot: number) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/inforesults/${lab}/${sec}/${mat}/${lot}`, { headers: reqHeaders });

  }

  // filtro ingreso de datos cualitativo
  public getBuscadorCualitativo(datos: any) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/inforesultscualitativextest/${datos}`, { headers: reqHeaders }).toPromise();

  }

  public getTestFiltroIngresoDatosCualitativo(lab: number, sec: number, mat: number, lot: number) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/inforesultscualitative/${lab}/${sec}/${mat}/${lot}`, { headers: reqHeaders });

  }

  // criterios de aceptacion
  public getDataCA(datos: any) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/infoacceptancerequirementsxtest/${datos}`, { headers: reqHeaders });

  }

  public getTestFiltroCA(lab: number, sec: number, mat: number, lot: number) {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/infoacceptancerequirements/${lab}/${sec}/${mat}/${lot}`, { headers: reqHeaders });

  }

  //Consolidado-resultado
  public getfilterConsolidadoResult(idClient: Number, startDate: string, endDate: string, idProgram: number, idHeadQuarters: number) {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/GetTbXParams/${idClient}/'${startDate}'/'${endDate}'/${idProgram}/${idHeadQuarters}`, { headers: reqHeaders });

  }

  public async getfilterClientresult(): Promise<any> {
    return await this.httpClient.get<any>(this.apiURL + '/infoclientresult').toPromise();
  }

  public getDetailsAnalytes() {

    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.get<any>(`${this.apiURL}/detailsanalytes`, { headers: reqHeaders });

  }


  public getObtenerListadoTest(id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL}/testxlote/${id}`);
  }

  public createLote(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${environment.apiUrl}lots`, entity, { headers: reqHeaders });
  }

  public createLoteControl(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${environment.apiUrl}LotControlMaterials`, entity, { headers: reqHeaders });
  }

  public createduplicarLotes(entity: any): Observable<any> {
    const reqHeaders = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.httpClient.post<any>(`${environment.apiUrl}Tests/doubletest`, entity, { headers: reqHeaders });
  }



}




