export interface Sedes {
    Sede:      string;
    Programas: Programa[];
    Equipo:      string;
    Unidad:      string;
    Programa:     string;
    Reactivo:     string;
}

export interface Programa {
    Programa: string;
    Equipo:   string;
    Analitos: AnalitoElement[];
}

export interface AnalitoElement {
    Error:        string;
    Analito:      string;
    IndiceDesvio: number;
    Zscore:       number;
    Sede?:           any;
}

export interface Sede {
    Sede: string;
    analitos: AnalitoElement[];
}

export interface GroupedAnalitos {
    Sede: string;
    Analitos: {
      [key: string]: AnalitoElement[]
    };
  }


export interface TablaAnalitos {
    analito: string;
    lineas:  Linea[];
    base64Grafica: string[],
}

export interface Linea {
    sede:     string;
    unidad:   string;
    programa: string;
    equipo:   string;
    reactivo:   string;
    lineas:   Lineas;
}

export interface Lineas {
    desvio: Desvio;
    zScore: Desvio;
    barra:  Barra[];
}

export interface Barra {
    value:     number;
    itemStyle: string;
    label:     Label;
}


export interface Label {
    show:     boolean;
    position: string;
    color:    string;
}

export interface Desvio {
    name: string;
    type: string;
    data: number[];
}

  