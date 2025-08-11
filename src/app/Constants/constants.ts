export class AppConstants {

    /*
    * NO DEBE AÑADIRSE VARIABLES DE IDIOMA, SÓLO DE CONFIGURACIÓN
    * COMO COLORES U OTROS 
    */
    public static get CIERRE_SESION_BOTON_COLOR(): string { return '#3850eb'; }
    public static get CANCELBUTTONCOLOR(): string {return '#d33';}
    public static get CONFIMRBUTTONCOLOR(): string {return '#3850eb';}

    public static get PATH_LOGIN(): string { return 'login'; }
    public static get PATH_TIPO_USUARIO(): string { return 'panel/tipo-usuario'; }
    public static get PATH_PANEL_INICIO(): string { return 'panel/inicio'; }

    public static get UNO(): number { return 1; }    
    public static get CUATRO(): number { return 4; }
    public static get CINCO(): number { return 5; }
    public static get SEIS(): number { return 6; }
    public static get TREINTA(): number { return 30; }


    public static get LISTAINGRESODAROS(): Array<any> { return [{ value: 'A',text: 'Aprueba'},{value: 'R',text: 'Rechaza'}]; }
    public static get LISTATIPODATOS(): Array<any> { return [{ value: 'manual',text: 'Manual'},{value: 'fecha',text: 'fecha'}]; }

    // colores

    public static get NEGRO()    : string { return '#000000' }
    public static get AMARILLO() : string { return '#FBF424' }
    public static get VERDE()    : string { return '#008B63' }
    public static get VERDE2()   : string { return '#67CA7B' }
    public static get AZUL()     : string { return '#3850EC' }
    public static get NARANJA_1(): string { return '#F7B150' }
    public static get NARANJA_2(): string { return '#F77700' }
    public static get NARANJA_3(): string { return '#DF4E1E' }
    public static get ROJO()     : string { return '#CE141B' }
    public static get ROJO_2()   : string { return '#D96B66' }
    public static get BLANCO()   : string { return '#FFF' }
    public static get MORADO()   : string { return '#800080' }

    // parámetros servicios

    public static get dianacalculate(): number { return 365 }

    public static get LISTATIPOMES(): Array<any> { return [{ value: 'treintaDias',text: 'Media movil de 30 dias'},{value: 'seisMeses',text: 'Media movil de 6 meses'},{value: 'mediaAcumulada', text: 'Media acumulada'},{value: 'mediaFija', text: 'Media fija'},{value: 'estadoArte', text: 'Estado del arte'}]; }
}
