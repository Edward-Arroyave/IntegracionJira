export interface GrupalAnalitos {
    sede?:    string;
    analito?: string;
    data?:    Valores[];
}

export interface Valores {
    sede:   string;
    lineas: Lineas;
}

export interface Lineas {
    indiceDesvio: IndiceDesvio[];
    zScore:       IndiceDesvio[];
}

export interface IndiceDesvio {
    name: string;
    type: string;
    data: any[];
}