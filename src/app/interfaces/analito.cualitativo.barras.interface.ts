export interface Concordancia {
    Niveles: Niveles[];
}

export interface Niveles {
    Analito:    string;
    lote:    string;
    seccion:    string;
    equipo:    string;
    Aceptados:  Aceptados;
    Rechazados: Rechazados;
}

export interface Aceptados {
    pctaceptadoslvl1: number;
    pctaceptadoslvl2: number | string;
    pctaceptadoslvl3: number | string;
}

export interface Rechazados {
    pctrechazadoslvl1: number;
    pctrechazadoslvl2: number | string;
    pctrechazadoslvl3: number | string;
}


// Desempeño

export interface Desemp {
    Niveles: NivelesDesemp[];
}

export interface NivelesDesemp {
    Analito:  string;
    DataxMes: DataxMeDesemp [];
}

export interface DataxMeDesemp  {
    Anio:  number;
    Meses: MesesDesemp [];
}

export interface MesesDesemp  {
    Mes:        string;
    Aceptados:  Aceptados;
    Rechazados: Rechazados;
}

// Sigma

export interface DataPorMes {
    Analito:  string;
    DataxMes: DataxMesSigma[];
}

export interface DataxMesSigma {
    Mes:              string;
    validsigma:       Validsigma
}

export interface Validsigma {
    validrojo:      number;
    validamarillo1: number;
    validamarillo2: number;
    validverde1:    number;
    validverde2:    number;
    validazul:      number;
}


