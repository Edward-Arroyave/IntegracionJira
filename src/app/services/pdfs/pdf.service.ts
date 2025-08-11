import { Injectable } from '@angular/core';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { AppConstantsPdf } from "../../Constants/imgPdf";
import { Canvas, Cell, Columns, Img, Line, PdfMakeWrapper, Stack, Table, Txt, Ul } from 'pdfmake-wrapper';
import { LaboratoriosService } from '../configuracion/laboratorios.service';
import { content } from 'html2canvas/dist/types/css/property-descriptors/content';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { DatePipe } from '@angular/common';
import { layouts } from 'chart.js';

@Injectable({
  providedIn: 'root'
})

export class PdfService {

  private no_image = AppConstantsPdf.no_image;
  private qc_blanco = AppConstantsPdf.qc_blanco;
  private clienteName: any;
  private clienteNit: any;
  private clienteAddres: any;
  logoSourceToPDF: any;

  private nameUser: string = sessionStorage.getItem('nombres');
  private lastNameUser: string = sessionStorage.getItem('apellidos');

  constructor(private laboratoriosService: LaboratoriosService, private datePipe: DatePipe
  ) {
    this.validarCliente();
    this.getLogoSource();
  }

  get returnQc_blanco() {
    return this.qc_blanco;
  }
  get returnNo_image() {
    return this.no_image;
  }

  get returnNit() {
    return this.clienteNit;
  }
  get returnNameLab() {
    return this.clienteName;
  }
  get returnAddresLab() {
    return this.clienteAddres;
  }

  validarCliente() {
    this.laboratoriosService.getAllAsync().then(lab => {
      this.clienteName = lab[0].name;
      this.clienteNit = lab[0].nit;
      this.clienteAddres = lab[0].addres;
    });
  }

  getLogoSource() {
    this.laboratoriosService.getLogoImage()
      .subscribe(logo => {
        this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;
        if (logo == "") {
          this.logoSourceToPDF = 'data:image/jpg;base64,' + this.no_image;
        }
      })
  }
  async getLogoSourceClient(header: any) {
    sessionStorage.setItem('clientLogo', header);
    try {
      const logo = await this.laboratoriosService.getLogoImageClient(header).toPromise();
      this.logoSourceToPDF = `data:image/jpg;base64,${logo}`;
    } catch (error) {
    } finally {
      sessionStorage.removeItem('clientLogo');
    }
  }

  crearTabla(cabeceros: string[], body: any[]) {
    let relleno = '';
    let header = ''
    let celdas = body.map((x: any, index: number) => {
      x?.Seccion ? header = x.Seccion : header = 'Nivel ' + (index + 1);
      let newarr = [
        new Cell(new Txt(header).bold().end).end,
        new Cell(new Txt((x.totalaceptados + x.totalrechazados)).bold().end).end,
        new Cell(new Txt(x.totalaceptados).bold().end).end,
        new Cell(new Txt(x.totalrechazados).bold().end).end,
        new Cell(new Txt(x.pctaceptados + ' %').bold().end).end,
        new Cell(new Txt(x.pctrechazados + ' %').bold().end).end,
        new Cell(new Txt(x.sigma).bold().end).end
      ]
      return newarr
    })

    return new Table([cabeceros, ...celdas])
      .widths('*')
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          if (rowIndex === 0) {
            relleno = '#9FA7FD'
          } else {
            if (rowIndex! % 2 === 0) {
              relleno = '#ECF3F8'
            } else {
              relleno = 'white'
            }
          }
          return relleno
        },
      })
      .alignment('center')
      .end
  }

  cabecero(infoCabecera: any) {
    console.log(infoCabecera);
    let header: any;
    if (!infoCabecera?.analito) {
      header = new Table([['Fecha desde', '', ''],
      [
        new Cell(new Txt(`${infoCabecera.fechaD}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ],
      ['Fecha Hasta', '', ''],
      [
        new Cell(new Txt(`${infoCabecera.fechaH}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ]
      ]).widths('*')
        .margin([250, 0, 0, 20])
        .layout('noBorders')
        .fontSize(11)
        .end
    } else {
      header = new Table([['Fecha desde', 'N° lote', 'Equipo'],
      [
        new Cell(new Txt(`${infoCabecera.fechaD}`).bold().end).end,
        new Cell(new Txt(`${infoCabecera.lote}`).bold().end).end,
        new Cell(new Txt(`${infoCabecera.equipo}`).bold().end).end,
      ],
      ['Fecha Hasta', '', ''],
      [
        new Cell(new Txt(`${infoCabecera.fechaH}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ],
      ['Sección', 'Analito', ''],
      [
        new Cell(new Txt(`${infoCabecera.seccion}`).bold().end).end,
        new Cell(new Txt(`${infoCabecera.analito}`).bold().end).end,
        new Cell(new Txt(``).bold().end).end,
      ],
      ]).widths('*')
        .margin([250, 0, 0, 20])
        .layout('noBorders')
        .fontSize(11)
        .end
    }
    return header
  }

  // async PdfPlantilla1(arrGraficas: string[], cabeceros: string[], body: any[], infoCabecera: any, titulo?: string, graficaDesempData?: any[]) {
  //   setTimeout(async () => {

  //     PdfMakeWrapper.setFonts(pdfFonts);
  //     const pdf = new PdfMakeWrapper();
  //     pdf.pageSize('B4');
  //     pdf.pageMargins([20, 240, 30, 50]);
  //     pdf.header(
  //       new Stack([
  //         new Canvas([
  //           new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6E6E6E').end,
  //         ]).absolutePosition(-50, 55).end,
  //         //Se retira el footer por petición del cliente fecha realizado 8/11/2024
  //         //await new Img('assets/rutas/pdfs/headerPDF.png').relativePosition(0, 0).width(700).height(100).build(),
  //         await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
  //         '\n',

  //         new Stack([
  //           new Columns([
  //             new Txt(`Cliente : ${this.clienteName}`).width(200).fontSize(11).end,
  //             new Txt(``).fontSize(11).end,
  //             new Txt(``).fontSize(11).end,
  //           ]).end,
  //           new Columns([
  //             new Txt(`Nit : ${this.clienteNit}`).fontSize(11).end,
  //             new Txt(``).fontSize(11).end,
  //             new Txt(``).fontSize(11).end,
  //           ]).end
  //         ]).width(100).relativePosition(20, 140).end,
  //         // new Txt (`Cliente : ${this.clienteName} \nNit : ${this.clienteNit}\nDirección : ${this.clienteAddres}`).relativePosition(60,140).fontSize(11).end,
  //         new Stack([
  //           new Txt('Reporte de Analitos\nCualitativos').margin([250, 0, 0, 20]).bold().fontSize(20).end,
  //           this.cabecero(infoCabecera)
  //         ]).margin(20).end
  //       ]).width('100%').height('auto').alignment('left').end);

  //     pdf.add(
  //       new Stack([
  //         this.crearTabla(cabeceros, body)
  //       ]).margin(20).width('*').alignment('center').end,
  //     )

  //     for (const key in arrGraficas) { //Graficas
  //       pdf.add(
  //         {
  //           alignment: "center",
  //           image: arrGraficas[key],
  //           height: 200,
  //           width: 600,
  //         }
  //       );
  //       // pdf.add('\n');
  //     }

  //     //Se retiro el texto por petición de requerimiento NOV-5 
  //     /*
  //     pdf.add(
  //       new Stack([
  //         new Txt([new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.
  //          `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencia; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.
  //          `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
  //          `, new Txt(`Autorizado Por :`).bold().end, ` ${this.nameUser + ' ' + this.lastNameUser}, especialista de producto`
  //         ]).end
  //       ]).pageBreak("before").end
  //     )
  //       */

  //     async function getBase64ImageFromUrl(imageUrl) {
  //       var res = await fetch(imageUrl);
  //       var blob = await res.blob();

  //       return new Promise((resolve, reject) => {
  //         var reader = new FileReader();
  //         reader.addEventListener("load", function () {
  //           resolve(reader.result);
  //         }, false);

  //         reader.onerror = () => {
  //           return reject(this);
  //         };
  //         reader.readAsDataURL(blob);
  //       })
  //     }
  //     function footerFunc(img) {
  //       pdf.footer(function (page: any, pages: any) {
  //         return {
  //           // margin: [5, 0, 10, 0],
  //           height: 30,
  //           columns: [
  //             {
  //               alignment: "center",
  //               image: img,

  //               fit: [700, 100],
  //               absolutePosition: { x: 10, y: 10 }
  //             },
  //             {
  //               text: [
  //                 { text: 'Pag ' + page.toString() },
  //                 " - ",
  //                 { text: pages.toString() }
  //               ],
  //               color: 'white',
  //               fontSize: 8,
  //               absolutePosition: { x: 640, y: 38 }
  //             },

  //           ],

  //         }
  //       });
  //     }
  //     //Se retira el footer por petición del cliente fecha realizado 8/11/2024
  //     /*
  //     let base64Footer: any = '';
  //     await getBase64ImageFromUrl('assets/rutas/pdfs/footerPDF.png')
  //       .then(result => base64Footer = result)
  //       .catch(err => console.error(err));
  //     footerFunc(base64Footer);
  //     */
  //     pdf.create().open();
  //   }, 3000);
  // }

// async PdfPlantilla1(
//   arrGraficas: string[],
//   cabeceros: string[],
//   body: any[],
//   infoCabecera: any,
//   titulo?: string,
//   graficaDesempData?: any[] // <- nuevo parámetro
// ) {
//   setTimeout(async () => {
//     PdfMakeWrapper.setFonts(pdfFonts);
//     const pdf = new PdfMakeWrapper();
//     pdf.pageSize('B4');
//     pdf.pageMargins([20, 240, 30, 50]);

//     // Header
//     pdf.header(
//       new Stack([
//         new Canvas([
//           new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6E6E6E').end,
//         ]).absolutePosition(-50, 55).end,
//         await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
//         '\n',
//         new Stack([
//           new Columns([
//             new Txt(`Cliente : ${this.clienteName}`).width(200).fontSize(11).end,
//             new Txt(``).fontSize(11).end,
//             new Txt(``).fontSize(11).end,
//           ]).end,
//           new Columns([
//             new Txt(`Nit : ${this.clienteNit}`).fontSize(11).end,
//             new Txt(``).fontSize(11).end,
//             new Txt(``).fontSize(11).end,
//           ]).end
//         ]).width(100).relativePosition(20, 140).end,
//         new Stack([
//           new Txt('Reporte de Analitos\nCualitativos').margin([250, 0, 0, 20]).bold().fontSize(20).end,
//           this.cabecero(infoCabecera)
//         ]).margin(20).end
//       ]).width('100%').height('auto').alignment('left').end
//     );

//     // Tabla principal
//     pdf.add(
//       new Stack([
//         this.crearTabla(cabeceros, body)
//       ]).margin(20).width('*').alignment('center').end,
//     );

//     // Gráficas y ubicación específica para tabla de desempeño
//     for (let i = 0; i < arrGraficas.length; i++) {
//       pdf.add({
//         alignment: "center",
//         image: arrGraficas[i],
//         height: 200,
//         width: 600,
//       });

//       // ✅ Agregar tabla justo después de la segunda gráfica
//       if (i === 1 && graficaDesempData && graficaDesempData.length > 0) {
//         const tablaDesempPorAnio = [
//           [
//             { text: 'Fecha', bold: true },
//             { text: 'Aceptados', bold: true },
//             { text: 'Rechazados', bold: true },
//             { text: '% Aceptados', bold: true },
//             { text: '% Rechazados', bold: true },
//             { text: 'Concordancia', bold: true }
//           ],
//           ...graficaDesempData.map(d => {
//             const aceptados = d.data[0]?.aceptados ?? 0;
//             const rechazados = d.data[0]?.rechazados ?? 0;
//             const porcAceptados = d.data[0]?.porcAceptados ?? 0;
//             const porcRechazados = d.data[0]?.porcRechazados ?? 0;
//             const concordancia = porcAceptados >= 80 ? 'Sí' : 'No';

//             return [
//               d.name || '—',
//               aceptados,
//               rechazados,
//               `${porcAceptados.toFixed(1)} %`,
//               `${porcRechazados.toFixed(1)} %`,
//               concordancia
//             ];
//           })
//         ];

//         pdf.add(
//           new Txt('Tabla de Desempeño por Año').margin([0, 20, 0, 5]).bold().fontSize(13).alignment('center').end
//         );

//         pdf.add(
//           new Table(tablaDesempPorAnio)
//             .layout('lightHorizontalLines')
//             .widths(['*', '*', '*', '*', '*', '*'])
//             .margin([20, 0, 20, 20])
//             .end
//         );
//       }
//     }

//     // Utilidad para convertir imagen externa a base64
//     async function getBase64ImageFromUrl(imageUrl) {
//       var res = await fetch(imageUrl);
//       var blob = await res.blob();
//       return new Promise((resolve, reject) => {
//         var reader = new FileReader();
//         reader.addEventListener("load", function () {
//           resolve(reader.result);
//         }, false);
//         reader.onerror = () => reject(this);
//         reader.readAsDataURL(blob);
//       });
//     }

//     // Footer con paginación (comentado según petición)
//     /*
//     let base64Footer: any = '';
//     await getBase64ImageFromUrl('assets/rutas/pdfs/footerPDF.png')
//       .then(result => base64Footer = result)
//       .catch(err => console.error(err));
//     footerFunc(base64Footer);

//     function footerFunc(img) {
//       pdf.footer(function (page: any, pages: any) {
//         return {
//           height: 30,
//           columns: [
//             {
//               alignment: "center",
//               image: img,
//               fit: [700, 100],
//               absolutePosition: { x: 10, y: 10 }
//             },
//             {
//               text: [
//                 { text: 'Pag ' + page.toString() },
//                 " - ",
//                 { text: pages.toString() }
//               ],
//               color: 'white',
//               fontSize: 8,
//               absolutePosition: { x: 640, y: 38 }
//             },
//           ],
//         };
//       });
//     }
//     */

//     // Crear PDF
//     pdf.create().open();
//   }, 3000);
// }





/**
 * METODO PARA CREAR UN PDF CON LA PLANTILLA 1
 * @param arrGraficas 
 * @param cabeceros 
 * @param body 
 * @param infoCabecera 
 * @param titulo 
 * @param graficaDesempData 
 * @param infoConcordancia 
 * @param xAxis 
 * @param resumenConcordancia 
 * @param sigmaData 
 */
PdfPlantilla1(
  arrGraficas: string[],
  cabeceros: string[],
  body: any[],
  infoCabecera: any,
  titulo?: string,
  graficaDesempData?: any[],
  infoConcordanciaPDF?: { name: string, y: number }[],
  xAxis?: string[],
  resumenConcordancia?: { totalaceptados: number, totalrechazados: number },
  sigmaData?: any[]
) {
  setTimeout(async () => {
    PdfMakeWrapper.setFonts(pdfFonts);
    const pdf = new PdfMakeWrapper();
    pdf.pageSize('B4');
    pdf.pageMargins([20, 240, 30, 50]);

    // CABECERA
    pdf.header(
      new Stack([
        new Canvas([new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6E6E6E').end])
          .absolutePosition(-50, 55).end,
        await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
        '\n',
        new Stack([
          new Columns([new Txt(`Cliente: ${this.clienteName}`).width(200).fontSize(11).end]).end,
          new Columns([new Txt(`Nit: ${this.clienteNit}`).fontSize(11).end]).end
        ]).width(100).relativePosition(20, 140).end,
        new Stack([
          new Txt('Reporte de Analitos\nCualitativos')
            .margin([250, 0, 0, 20]).bold().fontSize(25).color('#9c4d97').end,
          this.cabecero(infoCabecera)
        ]).margin(20).end
      ]).alignment('left').end
    );

    // Tabla Principal
    pdf.add(new Stack([this.crearTabla(cabeceros, body)])
      .margin([0, 20, 0, 40])
      .width('*')
      .alignment('center')
      .end);

    // Gráficas y tablas
    this.agregarResumenConcordancia(pdf, arrGraficas[0], resumenConcordancia, infoConcordanciaPDF);
    this.agregarTablaDesempeno(pdf, arrGraficas[1], graficaDesempData, xAxis);
    this.agregarTablaSigma(pdf, arrGraficas[2], sigmaData);

    // CREACIÓN FINAL DEL PDF
    pdf.create().open();
  }, 3000);
}


private agregarTablaDesempeno(pdf: PdfMakeWrapper, imagen: string, data?: any[], xAxis?: string[]) {
  if (!data || !xAxis?.length) return;

  const serieConcordante = data.find(s => s.name === 'Concordante');
  const serieNoConcordante = data.find(s => s.name === 'No Concordante');
  if (!(serieConcordante && serieNoConcordante)) return;

  // Imagen primero
  if (imagen) {
    pdf.add({ image: imagen, alignment: 'center', height: 200, width: 600, margin: [0, 0, 0, 10] });
  }

  // Luego título y tabla
  pdf.add(new Txt('Tabla de Desempeño por Año').margin([0, 0, 0, 5])
    .bold().fontSize(13).color('#9c4d97').alignment('center').end);

  const tabla = [
    [
      { text: 'Mes/Año', bold: true, fillColor: '#f2e1f5', color: '#9c4d97', alignment: 'center' },
      { text: 'Concordante (%)', bold: true, fillColor: '#f2e1f5', color: '#3F51B5', alignment: 'center' },
      { text: 'No Concordante (%)', bold: true, fillColor: '#f2e1f5', color: '#C62828', alignment: 'center' }
    ],
    ...xAxis.map((fecha, i) => [
      { text: fecha, alignment: 'center' },
      { text: serieConcordante.data[i] ?? '0', alignment: 'center' },
      { text: serieNoConcordante.data[i] ?? '0', alignment: 'center' }
    ])
  ];

  pdf.add(new Table(tabla)
    .widths(['*', '*', '*'])
    .layout({
      fillColor: rowIndex => rowIndex === 0 ? '#f2e1f5' : rowIndex % 2 === 0 ? '#f9f9f9' : null,
      hLineWidth: () => 0.7,
      vLineWidth: () => 0.7,
      hLineColor: () => '#aaa',
      vLineColor: () => '#aaa',
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 5,
      paddingBottom: () => 5
    }).margin([0, 0, 20, 50]).end);
}


private agregarTablaSigma(pdf: PdfMakeWrapper, imagen: string, sigmaData?: any[]) {
  if (!sigmaData?.length) return;

  // Imagen primero
  if (imagen) {
    pdf.add({ image: imagen, alignment: 'center', height: 200, width: 600, margin: [0, 0, 0, 10] });
  }

  // Luego título y tabla
  pdf.add(new Txt('Tabla Métrica Sigma').margin([0, 0, 0, 40])
    .bold().fontSize(13).color('#9c4d97').alignment('center').end);

  const tabla = [
    [
      { text: 'Mes', bold: true, fillColor: '#f2e1f5', color: '#9c4d97', alignment: 'center' },
      { text: 'Menor 3', bold: true, fillColor: '#f2e1f5', color: '#F44336', alignment: 'center' },
      { text: '3-3.99', bold: true, fillColor: '#f2e1f5', color: '#FF9800', alignment: 'center' },
      { text: '4-4.99', bold: true, fillColor: '#f2e1f5', color: '#BDB76B', alignment: 'center' },
      { text: '5-5.99', bold: true, fillColor: '#f2e1f5', color: '#8BC34A', alignment: 'center' },
      { text: 'Mayor a 6', bold: true, fillColor: '#f2e1f5', color: '#4CAF50', alignment: 'center' },
      { text: 'Total', bold: true, fillColor: '#f2e1f5', color: '#607D8B', alignment: 'center' }
    ],
    ...sigmaData.map(item => [
      { text: item.Mes, alignment: 'center' },
      { text: item['Menor 3'] ?? '0', alignment: 'center' },
      { text: item['3-3.99'] ?? '0', alignment: 'center' },
      { text: item['4-4.99'] ?? '0', alignment: 'center' },
      { text: item['5-5.99'] ?? '0', alignment: 'center' },
      { text: item['Mayor a 6'] ?? '0', alignment: 'center' },
      { text: item.Total ?? '0', alignment: 'center' }
    ])
  ];

  pdf.add(new Table(tabla)
    .widths(['*', '*', '*', '*', '*', '*', '*'])
    .layout({
      fillColor: rowIndex => rowIndex === 0 ? '#f2e1f5' : rowIndex % 2 === 0 ? '#f9f9f9' : null,
      hLineWidth: () => 0.7,
      vLineWidth: () => 0.7,
      hLineColor: () => '#aaa',
      vLineColor: () => '#aaa',
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 5,
      paddingBottom: () => 5
    }).margin([0, 0, 20, 30]).end);
}



private agregarResumenConcordancia(
  pdf: PdfMakeWrapper,
  imagen: string,
  resumen?: { totalaceptados: number, totalrechazados: number },
  infoConcordancia?: any[]
) {
  if (!resumen && (!infoConcordancia || infoConcordancia.length === 0)) return;

  // Imagen primero
  if (imagen) {
    pdf.add({ image: imagen, alignment: 'center', height: 200, width: 600, margin: [0, 0, 0, 10] });
  }

  // Título y tabla
  pdf.add(new Txt('Tabla Porcentaje de Concordancia')
    .margin([0, 0, 0, 5])
    .bold().fontSize(13).color('#9c4d97').alignment('center').end);

  const tabla: any[] = [
    [
      { text: 'Indicador', bold: true, fillColor: '#f2e1f5', color: '#9c4d97', alignment: 'center' },
      { text: 'Porcentaje (%)', bold: true, fillColor: '#f2e1f5', color: '#9c4d97', alignment: 'center' }
    ]
  ];

  if (infoConcordancia?.length > 0) {
    for (const item of infoConcordancia) {
      let color = '#000000';
      if (item.name.toLowerCase().includes('no')) {
        color = '#C62828';
      } else if (item.name.toLowerCase().includes('concordante')) {
        color = '#3F51B5';
      }

      tabla.push([
        { text: item.name, alignment: 'center', color },
        { text: `${item.y} %`, alignment: 'center' }
      ]);
    }
  } else {
    tabla.push(
      [
        { text: 'Concordante', alignment: 'center', color: '#3F51B5' },
        { text: `${resumen?.totalaceptados ?? 0} %`, alignment: 'center' }
      ],
      [
        { text: 'No Concordante', alignment: 'center', color: '#C62828' },
        { text: `${resumen?.totalrechazados ?? 0} %`, alignment: 'center' }
      ]
    );
  }

  pdf.add(new Table(tabla)
    .widths(['*', '*'])
    .layout({
      fillColor: rowIndex => rowIndex === 0 ? '#f2e1f5' : rowIndex % 2 === 0 ? '#f9f9f9' : null,
      hLineWidth: () => 0.7,
      vLineWidth: () => 0.7,
      hLineColor: () => '#aaa',
      vLineColor: () => '#aaa',
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 5,
      paddingBottom: () => 5
    }).margin([0, 0, 20, 0]).end);
}

  // REPORTE DESEMPEÑO CUALITATIVO CLIENTE
  async PdfPlantillaCualiCliente(arrGraficas: any, cabeceros: string[], body: any[], cabeceros2: string[], body2: any[], headPuntuacion: any[], puntuacion: any[], infoCabecera: any, idSample?: number, datosParametrizacion?: any, dataReporte?: any, problemsAnalytical?: any) {
    return new Promise(async (resolve, reject) => {
      try {

      PdfMakeWrapper.setFonts(pdfFonts);
      const pdf = new PdfMakeWrapper();
      
      pdf.pageSize({ width: 789, height: 1001 });
      pdf.pageMargins([30, 30, 40, 50]);
      pdf.add(
        new Stack([
          new Canvas([
            new Line([298, 70], [300, 70]).lineWidth(160).lineColor('#6b4b8b').end,
          ]).absolutePosition(-50, 55).end,
          await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(80, 40).build(),
          '\n',
          new Stack([
            new Txt(`Cliente : ${this.clienteName}`).fontSize(11).end,
            new Txt(`Sede : ${infoCabecera.dataSede.desheadquarters} `).fontSize(11).end,
        ]).width(100).relativePosition(10,150).end,
          new Stack([
            new Txt('Resultado del ensayo de aptitud\n(Evaluación externa del desempeño)').color('#6b4b8b').margin([250, 0, 0, 20]).bold().fontSize(20).end,
            new Table([['Programa', 'Ronda', 'Cod Lab'],
            [
              new Cell(new Txt(`${infoCabecera.programa}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.ronda}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.codLab}`).bold().end).end,
            ],
            ['Muestra', 'Condiciones Muestra', 'Tipo Muestra'],
            [
              new Cell(new Txt(`${infoCabecera.sample}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.formStatusSample.sampleConditions}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.formStatusSample.typeSample}`).bold().end).end,
            ],
            ['Fecha Impresión:', 'Fecha Recepción', 'Fecha Final'],
            [
              new Cell(new Txt(`${infoCabecera.fechaImpresion}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.formStatusSample.dateReception.format('YYYY-MM-DD')}`).bold().end).end,
              new Cell(new Txt(`${infoCabecera.fechaFinal}`).bold().end).end,
            ],
            ]).widths('*')
              .margin([260, 0, 0, 20])
              .layout('noBorders')
              .fontSize(11)
              .end,
          ]).margin(20).end,
          new Txt(['Muestras recibidas en buenas condiciones  ', new Txt(`Si :  ${infoCabecera.yes}     No: ${infoCabecera.not}`).bold().end]).margin([0,10,0,0]).end,
        ]).width('100%').height('auto').alignment('left').end);

        pdf.add(
          new Stack([
            new Txt([
               new Txt(`INFORMACIÓN GENERAL`).width('*').alignment('center').bold().fontSize(14).end, `
              `, new Txt('').bold().end, `
              `, new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.\n
              `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencial; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.\n
              `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
              `, new Txt(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n Autorizado Por :`).bold().end, ` ${this.nameUser + ' ' + this.lastNameUser}, Coordinador/a programas de ensayos de aptitud o Especialista de producto.`
            ]).end
          ]).margin([0, 30]).pageBreak("after").end
        );

      pdf.add(
        new Stack([
          new Txt(`Información relacionada con la interpretación del resultado.`).width('*').alignment('center').bold().fontSize(14).end,

          new Txt([`Estimado participante, se sugiere leer atentamente el siguiente instructivo de interpretación de resultados, antes de proceder a su análisis.`,
            new Txt(`PARTE 1: DE LOS RESULTADOS: s SIGLAS E INFORMACIÓN PARA INTERPRETACIÓN DE RESULTADOS. `).bold().end,
            `
            `, new Txt(`N°:`).bold().end, ` El primer cuadro, indica el número de muestra del programa y las representa con código de colores.
            `, new Txt(`Muestra:`).bold().end, ` Identificación de la muestra reportada.
            `, new Txt(`Resultado asignado:`).bold().end, ` Valor esperado como verdadero, de acuerdo con cada uno de los analitos evaluados.
            `, new Txt(`N :`).bold().end, ` Indica el total de laboratorios participantes.
            `, new Txt(`VP :`).bold().end, ` Verdaderos Reactivos Globales.
            `, new Txt(`VN :`).bold().end, ` Verdaderos No Reactivos Globales.
            `, new Txt(`FN :`).bold().end, ` Falsos No Reactivos Globales.
            `, new Txt(`FP :`).bold().end, ` Falsos Reactivos Globales.
            `, new Txt(`I :`).bold().end, ` Indeterminados.
            `, new Txt(`Consenso :`).bold().end, ` Indica el acuerdo consenso de cada una de las muestras del evento, el cual se obtiene a partir de un 80% de concordancia en los resultados obtenidos por todos los laboratorios participantes.
            `, new Txt(`Su Resultado :`).bold().end, ` Indica el resultado que su laboratorio reportó para cada una de las muestras del evento.
            `, new Txt(`C% o Concordancia :`).bold().end, ` Indica el grado de acuerdo existente entre lo reportado por el laboratorio y el consenso de los laboratorios participantes para determinada muestra; sin embargo, al tratarse valores cualitativos (Reactivo o No Reactivo) sólo existen dos posibilidades, o se obtiene 100% de concordancia, o se obtiene 0% de concordancia.
            `, new Txt(`Desempeño :`).bold().end, ` Califica la participación del laboratorio como Satisfactorio (si se tiene 100% de concordancia con el consenso) o Insatisfactorio (Si se tiene 0% de concordancia con el el consenso).
            `, new Txt(`Resultado :`).bold().end, ` Total de Concordancia%: Indica en porcentaje el número de resultados que el laboratorio reportó y que concuerdan 100% con el consenso.
            `, new Txt(`Desempeño :`).bold().end, ` Global: Califica el desempeño del laboratorio como Satisfactorio, si es que el 80% (4 resultados correctos de un total de 5) de los resultados emitidos por el laboratorio concuerdan con los resultados del Consenso, o Insatisfactorio si el consenso frente al grupo es < 80%.
            `, new Txt(`Concordancia con el resultado asignado :`).bold().end, ` Indica si el resultado reportado es concordante o no con el resultado asignado, para cada uno de los analitos evaluados.
            `]).margin([0, 15, 0, 0]).fontSize(12).alignment('left').end,
        ]).fontSize(11).margin([15, 0, 15, 80]).pageBreak('after').end,
      );

      if(problemsAnalytical.length === 0){
        pdf.add(
          new Stack([
            new Txt(`ANALITOS NO EVALUADOS`).width('*').alignment('center').color("#0059ff").bold().fontSize(16).end,
             {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 700, y2: 0,       
                  lineWidth: 0.5,
                  lineColor: '#B0C4DE'
                }
              ],
              margin: [0, 5, 0, 10] 
            },
            new Txt(`Muestra: ${infoCabecera.sample}`).width('*').alignment('left').color("#333333").fontSize(14).italics().end,
            
            new Txt(`No se encontraron analitos reportados con problemas analíticos`).width('*').alignment('left').color("#333333").fontSize(14).italics().end,

          ]).fontSize(11).margin([15, 0, 15, 80]).pageBreak('after').end,
        );
      } else {
        let tableProblems: string[][] = [
          ['Analito','Causa / Problema analítico reportado'],
          ...problemsAnalytical.map(d => [d.desAnalytes, d.descriptionAnalyticalProblems])
        ];

        pdf.add(
          new Stack([
            new Txt(`Analitos no evaluados`).width('*').alignment('center').color("#0059ff").fontSize(16).bold().end,
            new Txt(`Muestra: ${infoCabecera.sample}`).alignment('left').color('#333333').italics().fontSize(14).end,   
             {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 700, y2: 0,       
                  lineWidth: 0.5,
                  lineColor: '#25599cff'
                }
              ],
              margin: [0, 5, 0, 10] 
            },
          ]).margin([15, 0, 15, 80]).end,
        );
        
        pdf.add({
          columns: [
            {
              width: '*',
              alignment: 'center',
              stack: [
                {
                  table: {
                    widths: ['*', '*'],
                    body: tableProblems.map((fila, index) => {
                      
                      const isHeader = index === 0;
                      
                      return fila.map((celda, colIndex) => {
                        let backgroundColor = '';
                        if (!isHeader && index % 2 === 0) {
                          backgroundColor = '#f0f0f0';
                        }

                        return {
                          text: celda,
                          fillColor: backgroundColor,
                          bold: isHeader,
                          alignment: 'center',
                          margin: [5, 5, 5, 5],
                          fontSize: isHeader ? 12 : 10
                        };
                      });
                    })
                  },
                    layout: {
                      fillColor: (rowIndex: number) => {
                        return null;
                      },
                      hLineWidth: (i, node) => 0.5,
                      vLineWidth: (i, node) => 0.5,
                      hLineColor: () => '#ccc',
                      vLineColor: () => '#ccc'
                    }
                  }
                ]
              }
            ]
          });
          
          pdf.add(new Txt('').pageBreak("after").end);
      }

      let cabTablaConcordancia = ['Resultado','Resultado Asignado','Concordancia','Desempeño']
      let dataResumenMuestra = dataReporte.filter(x=>x.IdSample === idSample);
      let dataHoja = body.filter(x=>x.IdSample === idSample);
      

      let listForeachAnalytes = Array.from(
        new Map(dataHoja.map(item => [`${item.IdAnalytes}-${item.IdAnalyzer}-${item.IdSample}-${item.IdMethods}-${item.IdReactivo}-${item.IdUnits}`, item])).values()
      );

      listForeachAnalytes.forEach(async (x: any) => {
        let cabeceroHoja = datosParametrizacion.find(z=>z.idAnalytes === x.IdAnalytes 
                                                      && z.id_Analyzer === x.IdAnalyzer
                                                      && z.idMethod === x.IdMethods
                                                      && z.idUnit === x.IdUnits
                                                      && z.idReagents === x.IdReactivo
                                                      && z.idSample === x.IdSample
                                                    );

        pdf.add(
          [
            [
              new Txt([`Analito: `, new Txt(cabeceroHoja.desAnalytes).color('#333333')       
                .fontSize(14)
                .italics()
                .end])
                .bold()
                .color('#3850EB')       
                .fontSize(14)
                .margin([0, 0, 5, 0])  
                .end,
            ],
            // Línea decorativa inferior
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 700, y2: 0,       
                  lineWidth: 0.5,
                  lineColor: '#B0C4DE'
                }
              ],
              margin: [0, 5, 0, 10] 
            }
          ]
        );

        pdf.add(
          new Stack([
            new Txt([`Equipo: `, new Txt(cabeceroHoja.name_Analyzer).color('#0059ff').end ,
                   `    Metodo: `, new Txt(cabeceroHoja.desMethods).color('#0059ff').end ,
                   `    Reactivo: `, new Txt(cabeceroHoja.desReagents).color('#0059ff').end ,
                   `    Unidades: `, new Txt(cabeceroHoja.desunit).color('#0059ff').end ,` `
                  ]).width('*').alignment('left').bold().margin([0, 0, 0, 0]).fontSize(11).end,
          ]).end
        );

        //Tabla concordancia de resultado - valor asignado
          let dataAnalitos: any = body.filter(y=>y.IdAnalytes === x.IdAnalytes && y.IdSample === idSample);
          let datosTabla: any = [];
          if(dataAnalitos){
            datosTabla = dataAnalitos.map(dt => [
                dt.Resultado,
                dt.ValueAssign,
                dt.zscore,
                dt.Desempeno,
            ]);
          }
          
          let columnas = [100,100,100,100];
          let tabla = this.crearTablaGenerales(cabTablaConcordancia, datosTabla, columnas);
          
          let tableDev: string[][] = [
            ['Muestra','Analito','%DEV'],
            ...dataAnalitos.map(d => [d.Sample, d.DesAnalytes, d.zscoredev])
          ];

          //Buscando la imagen de zscore concordante o no concordante
          let imagenDev = arrGraficas.lineas.filter(y=>y.idAnalytes === x.IdAnalytes);
          let imagenZscore = arrGraficas.zscore.filter(y=>y.idAnalytes === x.IdAnalytes);

            pdf.add({
              columns: [
                {
                  width: '*', 
                  alignment: 'center',
                  stack: [
                    new Txt('CONCORDANCIA DE RESULTADOS - RESULTADO ASIGNADO\n\n')
                    .margin([0, 15, 0, 0])
                    .fontSize(15)
                    .alignment('center')
                    .bold()
                    .color('#6b4b8b').end,
                    {
                      alignment: 'center',
                      ...tabla
                    }
                  ]
                },
              ]
            });
            
             pdf.add({
              columns: [
                {
                  width: '*', 
                  alignment: 'center',
                  stack: [
                    new Txt('Grafica Zscore')
                  .margin([0,10, 0, 0])
                  .fontSize(15)
                  .alignment('center')
                  .bold()
                  .color('#6b4b8b')
                  .end,
                {
                  image: imagenZscore[0].grafica,
                  height: 320,
                  width: 320,
                  margin: [0, 0, 0, 0]
                }
              ]
            },
          ]
        });
        
        let tablaInterpretation: string[][] = [
            ['Interpretación','Resultado Laboratorio','Valor Esperado'],
            ['Verdadero Positivo','Positivo','Positivo'],
            ['Verdadero Negativo','Negativo','Negativo'],
            ['Indeterminado','Indeterminado','Positivo'],
            ['Falso Positivo','Positivo','Negativo'],
            ['Falso Negativo','Negativo','Positivo']
          ];

            pdf.add({
              columns: [
                {
                  width: 'auto',
                  stack: [
                    new Txt('Grafica %DEV')
                  .margin([0, 10, 0, 0])
                  .fontSize(15)
                  .alignment('center')
                  .bold()
                  .color('#6b4b8b')
                  .end,
                {
                  image: imagenDev[0].grafica,
                  fit: [320, 320],
                  margin: [0, 0, 0, 0]
                }
              ]
            },
            {
              stack:[
                {
                  table: {
                    widths: ['*', '*', '*'],
                    body: tableDev
                  },
                  layout: 'lightHorizontalLines',
                  margin: [15, 75, 0, 0]
                },
                {
                  table: {
                    widths: ['*', '*', '*'],
                    body: tablaInterpretation
                  },
                  margin: [15, 40, 0, 0] 
                }
              ]
            }
          ]
        });
        
        if (x !== listForeachAnalytes[listForeachAnalytes.length - 1]) {
          pdf.add(new Txt('').pageBreak("after").end);
        }
    });
    
    pdf.add(new Txt('').pageBreak("after").end);

    //Armando tabla de concordancia de resultados
    let datosTablaConcordanciaResultados: any = [];
      if(dataHoja){
        datosTablaConcordanciaResultados = dataHoja.map(dt => {
          return {
          n: dt.N,
          sample: dt.Sample,
          tvp: dt.TVP,
          tvn: dt.TVN,
          tfp: dt.TFP,
          tfn: dt.TFN,
          ti: dt.TI,
          consenso: dt.Consenso,
          resultado: dt.Resultado,
          c: dt.C,
          desempeno: dt.Desempeno
          }
      });
      }

    
    pdf.add(
      new Stack([
        new Canvas([
          new Line([-40, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
        ]).relativePosition(0, 0).end,
        new Canvas([
          new Line([200, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
        ]).relativePosition(0, 0).end,
        new Txt(`Concordancia de resultados`).margin([0, 15, 0, 10]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
        this.crearTablaCualiCiente(cabeceros, datosTablaConcordanciaResultados).end
      ]).margin([0, 0, 20, 0]).width(70).end,
    );
    
    //tabla desempeño global
    pdf.add(
      new Stack([
        this.crearTablaCualiCiente2(cabeceros2, body2)
      ]).margin([0, 10, 20, 0]).width(50).alignment('center').end,
    );
    
    pdf.add(
      new Stack([
        new Canvas([
          new Line([-40, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
        ]).relativePosition(0, 0).end,
        new Canvas([
          new Line([130, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
        ]).relativePosition(0, 0).end,
          new Txt(`Desempeño global`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          this.crearColumnas(arrGraficas.barras)
        ]).margin([0, 0, 20, 0]).pageBreak('after').width(70).end,
      );

      pdf.add(
        new Stack([
          new Canvas([
            new Line([-40, 25], [-10, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Canvas([
            new Line([140, 25], [750, 25]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Txt(`Resultado consenso`).margin([0, 15, 0, 0]).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          this.crearColumnas(arrGraficas.torta)
        ]).margin([0, 0, 20, 20]).pageBreak('after').width(70).end,
      );

      /*
      pdf.add(
        new Stack([
          new Canvas([
            new Line([-40, 11], [-11, 11]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,
          new Canvas([
            new Line([130, 11], [750, 11]).lineColor('#6b4b8b').lineWidth(2).lineCap('round').end,
          ]).relativePosition(0, 0).end,

          new Txt(`Puntuación SCORE`).fontSize(15).alignment('left').bold().color('#6b4b8b').end,
          new Columns([
            this.crearTablaPuntuacion(headPuntuacion, puntuacion),
            await new Img(arrGraficas.lineas).fit([500, 180]).width(500).build(),
          ]).alignment('center').end
        ]).margin([0, 0, 20, 10]).width('100%').end,
      );
      */

      let cabTablaResumenMuestra = ['IT','Analito','Result Lab','Result Asig', 'Concordancia','Z-score','Desempeño','Z-score (%DEV)']
      //Resumen de muestra
      let datosTablaRM = dataResumenMuestra.map((dt, index) => [
          index + 1,
          dt.DesAnalytes,
          dt.Resultado,
          dt.ValueAssign,
          dt.concordancia,
          dt.zscore,
          dt.Desempeno,
          dt.zscoredev,
        ]);
      
      let columnasRM = [10,100,100,100,70,40,80,60];
      let tablaRM = this.crearTablaGenerales(cabTablaResumenMuestra, datosTablaRM, columnasRM);

        pdf.add(
          [
            [
              new Txt('Resumen de muestra')
                .bold()
                .color('#3850EB')    
                .alignment('center')   
                .fontSize(14)
                .italics()
                .margin([0, 0, 5, 0])  
                .end,
            ],
            // Línea decorativa inferior
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 700, y2: 0,       
                  lineWidth: 2,
                  lineColor: '#B0C4DE'
                }
              ],
              margin: [0, 5, 0, 10] 
            }
          ]
        )
      
      pdf.add(
        new Stack([
          tablaRM,
        ]).pageBreak('after').end,
      )

      let cabTablaResumenRonda = ['IT','MX','Analito','Result Lab','Result Asig', 'Concordancia','Z-score','Desempeño','Z-score (%DEV)']
      //Resumen de ronda
      let datosTablaRR = dataReporte.map((dt, index) => [
          index + 1,
          dt.nroSample,
          dt.DesAnalytes,
          dt.Resultado,
          dt.ValueAssign,
          dt.concordancia,
          dt.zscore,
          dt.Desempeno,
          dt.zscoredev,
        ]);
      
      let columnasRR = [10,30,100,70,70,70,40,80,60];
      let tablaRR = this.crearTablaGenerales(cabTablaResumenRonda, datosTablaRR, columnasRR);
      
      pdf.add(
        [
          [new Txt('Resumen de ronda')
                .bold()
                .color('#3850EB')    
                .alignment('center')   
                .fontSize(14)
                .italics()
                .margin([0, 0, 5, 0])  
                .end,
            ],
            // Línea decorativa inferior
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 700, y2: 0,       
                  lineWidth: 2,
                  lineColor: '#B0C4DE'
                }
              ],
              margin: [0, 5, 0, 10] 
            },
            tablaRR
          ]
        )

      async function footerFunc(img:string) {
        pdf.footer(function (page: any, pages: any) {
          return {
            margin: [5, 0, 10, 0],
            height: 30,
            columns: [
              {
                canvas: [{ type: 'line', x1: 0, y1: 100, x2: 0, y2: 0, lineWidth: 2000, lineColor: '#0040FF' }],
                absolutePosition: { x: 0, y: 0 },
              },
              {
                alignment: "center",
                image: img,
                height: 30,
                width: 100,
                margin: [0, 10, 0, 0],
              },
              {
                alignment: "right",
                text: [
                  { text: 'Pag ' + page.toString() },
                  " - ",
                  { text: pages.toString() }
                ],
                color: 'white',
                margin: [0, 20, 20, 0],
              },

            ],

          }
        });
      }
      await footerFunc('data:image/png;base64,' + this.qc_blanco);

      const definition = pdf.getDefinition();
      
      pdfMake.createPdf(definition).getDataUrl(function (dataUrl) {
        
        let base64Content = dataUrl.split(',')[1];  
        const byteCharacters = atob(base64Content);
        const byteArrays = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
        const byteArray = new Uint8Array(byteArrays);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        let fechaGeneral = new Date();
        let dateGenerate = fechaGeneral.toLocaleDateString();
        a.download = 'reporteDesempeñoCualitativo' + `_${dateGenerate}`;
        a.click();
        URL.revokeObjectURL(url);
        resolve(base64Content); 
      });
    } catch (error) {
      reject(error);
    }
  });
}


  crearColumnas(graf, titulos?: any): any[] {
    let newArray = [];
    let arregloDeArreglos = [];
    let arregloDeTitulos = [];
    const long = 3; // Partir en arreglo de 4
    for (let i = 0; i < graf.length; i += long) {
      let itemArr = graf.slice(i, i + long);
      arregloDeArreglos.push(itemArr);

      if (titulos != undefined) {
        let titleArr = titulos.slice(i, i + long);
        arregloDeTitulos.push(titleArr);
      }
    }

    arregloDeArreglos.map((x: any, index: number) => {
      newArray[index] = new Stack([
        new Columns([
          new Stack([
            titulos != undefined ? '' : '',
            { alignment: "center", image: x[0], height: 200, width: 200 }
          ]).end,
          new Stack([
            x[1] != undefined ? { alignment: "center", image: x[1], height: 200, width: 200 } : ''
          ]).end,
          new Stack([
            x[2] != undefined ? { alignment: "center", image: x[2], height: 200, width: 200 } : ''
          ]).end
        ]).columnGap(5).alignment('center').fontSize(11).margin([0, 10, 0, 10]).width('90%').end
      ]).end
    });
    return newArray
  }

  crearTablaGenerales(cabeceros: string[], body: any[], columnas: number[]) {
    
    const blueBase = '#3850EB';        
    const lightBlue1 = '#E3E7FD';      
    const lightBlue2 = '#F1F3FE';       
    
    let relleno = '';
    let head = cabeceros.map((x: any) => 
      new Cell(new Txt(x).bold().color('white').end).end,
    );

    return new Table([head, ...body])
      .widths(columnas)
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
      fillColor: (rowIndex: number) => {
          if (rowIndex === 0) return blueBase;         // Encabezado
          return rowIndex % 2 === 0 ? lightBlue1 : lightBlue2; // Intercalado
        },
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#D6DBE9',
          vLineColor: () => '#D6DBE9',
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 6,
          paddingBottom: () => 6
      })
      .alignment('center')
      .end;
  }

  crearTablaCualiCiente(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('white').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.n).bold().end).end,
        new Cell(new Txt(x.sample).bold().end).end,
        new Cell(new Txt(x.tvp).bold().end).end,
        new Cell(new Txt(x.tvn).bold().end).end,
        new Cell(new Txt(x.tfp).bold().end).end,
        new Cell(new Txt(x.tfn).bold().end).end,
        new Cell(new Txt(x.ti).bold().end).end,
        new Cell(new Txt(x.consenso).bold().end).end,
        new Cell(new Txt(x.resultado).bold().end).end,
        new Cell(new Txt(x.c).bold().end).end,
        new Cell(new Txt(x.desempeno).bold().end).end
      ]
      return newarr
    })

    return new Table([head, ...celdas])
      .widths([20, 90, 20, 20, 20, 20, 20, 70, 70, 60, 90])
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          relleno = rowIndex === 0 ? '#3850EB' : rowIndex! % 2 === 0 ? '#ECF3F8' : 'white';
          return relleno;
        },
        hLineColor: () => '#C5C5C5',
        vLineColor(rowIndex, node, columnIndex) {
          return 'C5C5C5';
        },
      })
      .alignment('center')

  }


  crearTablaCualiCiente2(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('white').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.resultConcor).bold().end).end,
        new Cell(new Txt(x.desempeGlobal).bold().end).end,
      ]
      return newarr
    })

    return new Table([head, ...celdas])
      .widths([100, 100])
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          relleno = rowIndex === 0 ? '#3850EB' : rowIndex! % 2 === 0 ? '#ECF3F8' : 'white';
          return relleno;
        },
        hLineColor: () => '#C5C5C5',
        vLineColor(rowIndex, node, columnIndex) {
          return 'C5C5C5';
        },
      })
      // .alignment('center')
      .end
  }

  crearTablaPuntuacion(cabeceros: string[], body: any[]) {
    let relleno = '';
    let head = cabeceros.map((x: any) => {
      let newarr = [
        new Cell(new Txt(x).bold().color('white').end).end,
      ]
      return newarr
    })
    let celdas = body.map((x: any, index: number) => {
      let newarr = [
        new Cell(new Txt(x.cod).bold().end).end,
        new Cell(new Txt(x.dev).bold().end).end,
      ]
      return newarr
    })

    return new Table([head, ...celdas])
      .widths([70, 70])
      .heights(rowIndex => rowIndex === 0 ? 25 : 0)
      .fontSize(11)
      .layout({
        fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
          relleno = rowIndex === 0 ? '#3850EB' : rowIndex! % 2 === 0 ? '#ECF3F8' : 'white';
          return relleno;
        },
        hLineColor: () => '#C5C5C5',
        vLineColor(rowIndex, node, columnIndex) {
          return 'C5C5C5';
        },
      })
      .dontBreakRows(true)
      .margin([0, 20])
      // .alignment('center')
      .end
  }


  definirColor(titulo:string,dato1:number,dato2:number){
    if(titulo === 'Z-score'){
      return dato1 === dato2 && dato1 ? '' :''
    }
  }

  // Reporte cuantitativo externo

  crearTablaExternoCuantitativo(cabeceros: string[], body: any,posicionIndex:number, ancho: any = '*') {
    let relleno = '';
    let color:string='';
    if(body !== undefined){

      let celdas: any[] = body.map((datos: any, index: number) => {
        let newObj = [];
        Object.keys(datos).map((x2: any, index2: number) => {
          color='black';
  
          if (posicionIndex !== 0 && index2 === 0){
            datos[x2] = '#' + (index+1) + ' - ' + datos[x2];
          }
  
          // Las posicion de colores en la primera tabla la cual inicia en 5 ---- en caso de ser resumen de muestra o ronda
          if (posicionIndex === 6 && index2 === 6){
              if (datos[x2] > -2 && datos[x2] < 2) {
                color = 'green';
              } else if ((datos[x2] >= 2 && datos[x2] <= 3) || (datos[x2] <= -2 && datos[x2] >= -3)) {
                color = '#FFD700';
              } else if (datos[x2] > 3 || datos[x2] < -3) {
                color = 'red';
              }
            }
          if (posicionIndex === 8 && index2 === 8){
  
            if (datos[x2] > -2 && datos[x2] < 2) {
              color = 'green';
            } else if ((datos[x2] >= 2 && datos[x2] <= 3) || (datos[x2] <= -2 && datos[x2] >= -3)) {
              color = '#FFD700';
            } else if (datos[x2] > 3 || datos[x2] < -3) {
              color = 'red';
            }
          }
          newObj.push(new Cell(new Txt(datos[x2]).color(color).bold().end).border([false]).end)
        })
        return newObj
      })
  
      const divisor = ancho !== '*'?456:650
      const anchoCeldas =  cabeceros.map(x => divisor/cabeceros.length ) ;
  
      return new Table([cabeceros.map(x => new Cell(new Txt(x).bold().color('white').end).border([false]).end), ...celdas])
        .width(ancho)
        .widths(anchoCeldas)
        .fontSize(11)
        .layout({
          fillColor: (rowIndex: number | undefined, node: any, columnIndex: number | undefined) => {
            if (rowIndex === 0) {
              relleno = '#3850eb'
            } else {
              if (rowIndex! % 2 === 0) {
                relleno = '#ECF3F8'
              } else {
                relleno = 'white'
              }
            }
            return relleno
          },
        })
        .margin([0, 10, 0, 10])
        .alignment('center')
        .dontBreakRows(false)
        .end
    }
  }

  async PdfExternoCuantitativo(arrInformacionPDF: any[], infoCabero: any, resumenMuestras: any[], cabecerosResumen: any[],resumenRonda: any[],imagenesRonda:any[] ,clienteInfo:any, sedes:any, problemsAnalytical?: any[]): Promise<string>{

    return new Promise(async (resolve, reject) => {
      try {

        if (clienteInfo.isClient) {
          await this.getLogoSourceClient(clienteInfo.header);
          this.clienteName = clienteInfo.nameClient;
        }
    
        PdfMakeWrapper.setFonts(pdfFonts);
        const pdf = new PdfMakeWrapper();
        pdf.pageSize({ width: 789, height: 1001 });
        pdf.pageMargins([30, 30, 40, 50]);
        pdf.add(
          new Stack([
            new Canvas([
              new Line([298, 70], [300, 70]).lineWidth(200).lineColor('#6E6E6E').end,
            ]).absolutePosition(-20, 75).end,
            await new Img('assets/rutas/pdfs/headerPDF.png').absolutePosition(0, 0).width(789).height(100).build(),
            await new Img(this.logoSourceToPDF).width(100).height(100).relativePosition(60, 10).build(),
            '\n',
            new Stack([
                new Txt(`Cliente : ${this.clienteName}`).fontSize(11).end,
                new Txt(`Sede : ${sedes.desheadquarters} `).fontSize(11).end,
                new Txt(``).fontSize(11).end,
            ]).width(100).relativePosition(0, 120).end,
            new Stack([
              new Txt('Reporte de control de \ncalidad externo cuantitativo').bold().fontSize(20).end,
              {
                canvas: [{ type: 'line', x1: 0, y1: 10, x2: 250, y2: 10, lineWidth: 2, lineColor: '#6E6E6E' },]
              },
              new Txt('Evaluación externa de la calidad / ensayo de aptitud').margin([0, 5, 0, 5]).color('#0059ff').bold().fontSize(11).end,
              new Txt('Codigo Sede: ' + `${sedes.codheadquarters}`).margin([0, 5, 0, 5]).color('#0059ff').bold().fontSize(9).end,
              new Table([
                        ['Programa', 'Ronda','Cod. Lab'],
                        [
                          new Cell(new Txt(`${infoCabero.programa}`).bold().end).end,
                          new Cell(new Txt(`${infoCabero.ronda}`).bold().end).end,
                          new Cell(new Txt(`${infoCabero.cod}`).bold().end).end,
                        ],
                        [ 'Muestra','Condiciones de la muestra', 'Tipo de muestra:'],
                        [
                          new Cell(new Txt(`${infoCabero.muestra}`).bold().end).end,
                          new Cell(new Txt(`${infoCabero.condicionesmuestra}`).bold().end).end,
                          new Cell(new Txt(`${infoCabero.tipomuestra}`).bold().end).end,
                        ],
                        ['Fecha de impresion', 'Fecha de Recepción','Fecha final'],
                        [
                          new Cell(new Txt(`${infoCabero.fecha}`).bold().end).end,
                          new Cell(new Txt(`${infoCabero.fecharecepcion}`).bold().end).end,
                          new Cell(new Txt(`${infoCabero.fechaFinal}`).bold().end).end,
                        ]
              ]).widths('*')
                .layout('noBorders')
                .fontSize(11)
                .end,
                new Txt(['Muestras recibidas en buenas condiciones  ', new Txt(`Si :  ${infoCabero.si}     No: ${infoCabero.no}`).bold().end]).margin([0,10,0,0]).end
            ]).margin([280, 0, 0, 0]).end
          ]).margin([0, 0, 0, 0]).width('100%').height('auto').alignment('left').end);
    
        pdf.add(
          new Stack([
            new Txt([
               new Txt(`INFORMACIÓN GENERAL`).width('*').alignment('center').bold().fontSize(14).end, `
              `, new Txt('').bold().end, `
              `, new Txt(`Homogeneidad y estabilidad:`).bold().end, ` La información relacionada con la homogeneidad y estabilidad de esta muestra ha sido declarada por el fabricante.\n
              `, new Txt(`Confidencialidad:`).bold().end, ` El informe presentado a continuación presenta información de caracter confidencial; la divulgación del mismo se realiza únicamente con el participante al cual corresponde; en caso que alguna autoridad requiera la socialización del mismo, esta solo se realiza con autorización expresa del participante.\n
              `, new Txt(`Subcontratación:`).bold().end, ` Annar Health Technologies no realiza la subcontratación de actividades relacionadas con la planificación, análisis y emisión de los reportes de resultados relacionados con los reportes de control de calidad externo.
              `, new Txt(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n Autorizado Por :`).bold().end, ` ${this.nameUser + ' ' + this.lastNameUser}, Coordinador/a programas de ensayos de aptitud o Especialista de producto. `
            ]).end
          ]).margin([0, 30]).pageBreak("after").end
        );
    
        pdf.add(
          new Stack([
            new Txt([
                new Txt('CRITERIOS DE EVALUACIÓN').width('*').alignment('center').bold().margin([ 0, 0, 30, 0]).fontSize(14).end, `
              `, new Txt(`\nCada uno de los analitos contemplados en el informe se evaluan frente al criterio de evaluación:\n`).bold().end, `
              `, new Txt(`Z-score:`).bold().end, ` El resultado es evaluado contra un grupo de comparación seleccionado: Equipo-método, método o Todos los resultados: \n
              `, new Txt(`Aceptable. Z score entre z > -2 y < 2.0`).bold().end, `
              `, new Txt(`Señal de advertencia. Z score entre 2.1 y 3.0 ; -2.1 y -3.0`).bold().end, `
              `, new Txt(`Inaceptable < -3 y > 3.0`).bold().end, `
              `, new Txt(`Interpretación del informe:\n`).bold().end, `
              `, new Txt(`Convenciones:\n`).bold().end, `
              `, new Txt(`NE:`).bold().end, ` No evaluado.
              `, new Txt(`DS:`).bold().end, ` Desviación Estándar.
              `, new Txt(`CV:`).bold().end, ` Coeficiente de variación.
              `, new Txt(`Um:`).bold().end, ` Incertidumbre.
              `, new Txt(`ZS:`).bold().end, ` Z-score.\n
              `, new Txt(`M:`).bold().end, ` Método.
              `, new Txt(`EM:`).bold().end, ` Equipo método.
              `, new Txt(`T:`).bold().end, ` Todos los resultados`
            ]).end
          ]).margin([0, 0]).pageBreak("after").end
        );

         if(problemsAnalytical.length === 0){
        pdf.add(
          new Stack([
            new Txt(`ANALITOS NO EVALUADOS`).width('*').alignment('center').color("#0059ff").bold().fontSize(16).end,
             {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 700, y2: 0,       
                  lineWidth: 0.5,
                  lineColor: '#B0C4DE'
                }
              ],
              margin: [0, 5, 0, 10] 
            },
            new Txt(`Muestra: ${infoCabero.muestra}`).width('*').alignment('left').color("#333333").fontSize(14).italics().end,
            
            new Txt(`No se encontraron analitos reportados con problemas analíticos`).width('*').alignment('left').color("#333333").fontSize(14).italics().end,

          ]).fontSize(11).margin([15, 0, 15, 80]).pageBreak('after').end,
        );
      } else {
         let tableProblems: string[][] = [
          ['Analito','Causa / Problema analítico reportado'],
          ...problemsAnalytical.map(d => [d.desAnalytes, d.descriptionAnalyticalProblems])
        ];

        pdf.add(
          new Stack([
            new Txt(`Analitos no evaluados`).width('*').alignment('center').color("#0059ff").fontSize(16).bold().end,
            new Txt(`Muestra: ${infoCabero.muestra}`).alignment('left').color('#333333').italics().fontSize(14).end,   
             {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 0,
                  x2: 700, y2: 0,       
                  lineWidth: 0.5,
                  lineColor: '#25599cff'
                }
              ],
              margin: [0, 5, 0, 10] 
            },
          ]).margin([15, 0, 15, 80]).end,
        );
        
        pdf.add({
          columns: [
            {
              width: '*',
              alignment: 'center',
              stack: [
                {
                  table: {
                    widths: ['*', '*'],
                    body: tableProblems.map((fila, index) => {
                      
                      const isHeader = index === 0;
                      
                      return fila.map((celda, colIndex) => {
                        let backgroundColor = '';
                        if (!isHeader && index % 2 === 0) {
                          backgroundColor = '#f0f0f0';
                        }

                        return {
                          text: celda,
                          fillColor: backgroundColor,
                          bold: isHeader,
                          alignment: 'center',
                          margin: [5, 5, 5, 5],
                          fontSize: isHeader ? 12 : 10
                        };
                      });
                    })
                  },
                    layout: {
                      fillColor: (rowIndex: number) => {
                        return null;
                      },
                      hLineWidth: (i, node) => 0.5,
                      vLineWidth: (i, node) => 0.5,
                      hLineColor: () => '#ccc',
                      vLineColor: () => '#ccc'
                    }
                  }
                ]
              }
            ]
          });
          
          pdf.add(new Txt('').pageBreak("after").end);
      }
    
        //Se comentarea el RMZs por no utilización por el momento
        //`, new Txt(`RMZs:`).bold().end, ` Acumulado Z-score, a partir de la sexta muestra.

        arrInformacionPDF.forEach((x: any, j) => {
          let i = 0;
          const arrGraficas: any[] = x[0];
          const cabecerosTablas: any[] = x[2];
          
          const arrTablas: any[] = x[1];
          const cabeceroDocumento: any = x[3];
    
          pdf.add(
            new Stack([
              new Txt('Analito: ' + cabeceroDocumento.analito).width('*').alignment('left').bold().margin([0, 0, 0, 0]).fontSize(18).end,
              new Txt([`Equipo: `, new Txt(cabeceroDocumento.equipo).decoration('underline').color('#0059ff').end ,
                     `    Metodo: `, new Txt(cabeceroDocumento.metodo).decoration('underline').color('#0059ff').end ,
                     `    Reactivo: `, new Txt(cabeceroDocumento.reactivo).decoration('underline').color('#0059ff').end ,
                     `    Unidades: `, new Txt(cabeceroDocumento.unidades).decoration('underline').color('#0059ff').end ,` `
                    ]).width('*').alignment('left').bold().margin([0, 0, 0, 0]).fontSize(10).end,
              new Txt('\nEstadística General').color('#0059ff').width('*').bold().fontSize(17).end,
              { canvas: [{ type: 'line', x1: -30, y1: 10, x2: 780, y2: 10, lineWidth: 2, lineColor: '#0059ff', }] },
            ]).end
          );
    
          for (const key in arrGraficas) {
            let img: any[] = []
            //Graficas
            /*
            if (typeof arrGraficas[key] !== 'string') {
              img = arrGraficas[key];
            } else {
              img = [arrGraficas[key]];
            }
            */
    
            img = arrGraficas[key];
    
            let retornarGrafica = () => {
              if(img === null ) return new Txt('').end
              let imagenes = img.map(x => {
                return {
                  alignment: "center",
                  image: x,
                  height: 220,
                  width: 800,
                  margin:[0,0,0,20]
                }
              })
              return new Stack([...imagenes]).alignment('center').end
            }
    
            const tablaReturn = () => {
              let nuevoObj: any[] = [];
              let titulo = ''
              if(arrGraficas[key] === arrGraficas[0]){
                titulo = 'Estadística de Comparación';
    
              }
              // switch (arrGraficas[key]) {
              //   case arrGraficas[0]:
              //     break;
              //     //Por requerimiento de quitar el valor asignado y zcore se cambia el 1 por el 0
              //     // case arrGraficas[1]:
              //   // case arrGraficas[0]:
              //   //   titulo = 'Evaluación de Procedimiento';
              //   //   break;
              //   default:
              //     break;
              // }
    
              if (arrGraficas[key] !== arrGraficas[2]) {
                let tituloEstilo = [
                  new Txt(titulo).width('*').alignment('left').bold().margin([0, 25, 0, 0]).decoration('underline').color('#0059ff').fontSize(15).end,
                  //Descomentarear una vez se pida que vuelva a ponerse el valor asignado
                  //arrGraficas[key] === arrGraficas[0] ? new Txt('Valor asignado : ' + cabeceroDocumento.valorAsign).width('*').alignment('left').bold().margin([0, 10, 0, 0]).fontSize(11).end:'',
                  arrGraficas[key] === arrGraficas[0] ? new Txt('Muestra : ' + infoCabero.muestra).width('*').alignment('left').bold().margin([0, 10, 0, 0]).fontSize(10).end : '',
                ];
                nuevoObj.push(...tituloEstilo);
              }
    
              //Se salta la posición uno donde son guardadas las graficas de indices de desvio.
              //Esto es nuevo con el requerimiento de Leidy Paola, por favor quitarlo una vez se agregue el indice de desvio y zcore
              let e = 1;
              if (i === 1){
                e++;
              }
              else{
                e = i;
              }
    
              //Antes
              //let tablaTitulo = arrGraficas[key] === arrGraficas[1] ?'Comparación Valor Asignado':arrGraficas[key] === arrGraficas[2] ?'Comparación Z-score':null;
              //tablaTitulo === null? tablaTitulo = '':'';
              //nuevoObj.push(
              //  new Stack([
              //    new Txt(tablaTitulo).width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(14).end,
              //    new Columns([
              //      this.crearTablaExternoCuantitativo(cabecerosTablas[i], arrTablas[i],0, '*')
              //    ]).columnGap(20).end
              //  ]).end);
              //return nuevoObj
              //}
    
              //Req Leidy Paola
              //Ahora
    
              let dddd = Number(e);
              if (dddd <= arrTablas.length){
                let tablaTitulo = arrGraficas[key] === arrGraficas[2] ?'Comparación Z-score':null;
                tablaTitulo === null? tablaTitulo = '':'';
                nuevoObj.push(
                  new Stack([
                    new Txt(tablaTitulo).width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(14).end,
                    new Columns([
                      this.crearTablaExternoCuantitativo(cabecerosTablas[e], arrTablas[e],0, '*')
                    ]).columnGap(20).end
                  ]).end);
                return nuevoObj
              }
            }
    
            pdf.add(
              new Stack([
                new Stack([
                  tablaReturn()
                ]).end,
                retornarGrafica()
              ]).end
            );
            i++;
          }
    
          if (x !== arrInformacionPDF[arrInformacionPDF.length - 1]) {
            pdf.add(new Txt('').pageBreak("after").end);
          }
        })
    
        //Req Leidy Paola
        //Eliminar por el momento el indice de desvio y valor asignado.
    
        const iterarResumenMuestra = resumenMuestras.filter(x => x.resultado !== '');
        iterarResumenMuestra.forEach(el => delete el.indiceDesvio && delete el.valorAsignado);
    
        if(iterarResumenMuestra.length !== 0 ){
          pdf.add(new Txt('').pageBreak("after").end);
          pdf.add(
            new Stack([
              new Txt('Resumen de muestra').width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(20).end,
              { canvas: [{ type: 'line', x1: -30, y1: 10, x2: 780, y2: 10, lineWidth: 2, lineColor: '#0059ff', }]},
              new Stack([
                new Columns([
                  this.crearTablaExternoCuantitativo(cabecerosResumen[0], iterarResumenMuestra,6, '*')
                ]).columnGap(20).end,
    
                 await new Img(imagenesRonda[0]).width(600).alignment('center').build(),
                //Req Leidy Paola
                //await new Img(imagenesRonda[1]).width(600).alignment('center').build()
              ]).end
            ]).end
          )
        }

        let aceptable:number= 0;
        let advertencia:number= 0;
        let Inaceptable:number= 0;
        resumenMuestras.forEach(element => {
          let valor = element['zScore'];
          if (valor > -2 && valor < 2) {
            aceptable++; 
            return 'green'; 
          } else if ((valor >= 2.0 && valor <= 3) || (valor <= -2.0 && valor >= -3)) {
            advertencia++;
            return 'yellow'; 
          } else if (valor > 3 || valor < -3) {
            Inaceptable++;
            return 'red'; 
          }
        });
    
        pdf.add(
          new Stack([
            new Txt('Aceptable => Cuándo el Z-score > -2 y < 2').width('*').alignment('center').bold().margin([0, 10, 0, 0]).color('#3d4fce').fontSize(12).end,
            new Txt('Advertencia => Cuándo el Z-score >= 2.1 y <= 3 / Z-score <= -2.1 y >= -3').width('*').alignment('center').bold().margin([0, 10, 0, 0]).color('#3d4fce').fontSize(12).end,
            new Txt('Inaceptable => Cuándo el Z-score > 3 o < -3').width('*').alignment('center').bold().margin([0, 10, 0, 0]).color('#3d4fce').fontSize(12).end,

            new Txt('Conteo Datos: \n______________________________________').width('*').alignment('center').bold().margin([0, 25, 0, 0]).color('#8C8989').fontSize(14).end,
            new Txt('Aceptable = ' + aceptable).width('*').alignment('center').bold().margin([0, 10, 0, 0]).color('#B3B1B1').fontSize(12).end,
            new Txt('Advertencia = ' + advertencia).width('*').alignment('center').bold().margin([0, 10, 0, 0]).color('#B3B1B1').fontSize(12).end,
            new Txt('Inaceptable = ' + Inaceptable).width('*').alignment('center').bold().margin([0, 10, 0, 0]).color('#B3B1B1').fontSize(12).end,
            new Txt('Total = ' + resumenMuestras.length).width('*').alignment('center').bold().margin([0, 10, 0, 0]).color('#B3B1B1').fontSize(12).end
          ]).end
        )
    
        //Req Leidy Paola
        //Se quita el indice de desvio
        resumenRonda.forEach(el => delete el.IndiceDesv);
    
        pdf.add(new Txt('').pageBreak("after").end);
        pdf.add(
          new Stack([
            new Txt('Resumen de ronda').width('*').alignment('left').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(20).end,
            { canvas: [{ type: 'line', x1: -30, y1: 10, x2: 780, y2: 10, lineWidth: 2, lineColor: '#0059ff', }]},
            new Stack([
              new Columns([
                this.crearTablaExternoCuantitativo(cabecerosResumen[1], resumenRonda.filter(x => x.Result !== ''),8,'*')
              ]).columnGap(20).end
            ]).end
          ]).end
        )

        pdf.add(
          new Stack([
            new Txt(`Fin del reporte`).width('*').alignment('center').bold().margin([0, 25, 0, 0]).color('#0059ff').fontSize(10).end,
            { canvas: [{ type: 'line', x1: -30, y1: 10, x2: 780, y2: 10, lineWidth: 2, lineColor: '#0059ff', }]},
          ]).end
        )
    
        async function getBase64ImageFromUrl(imageUrl) {
          var res = await fetch(imageUrl);
          var blob = await res.blob();
    
            return await new Promise((resolve, reject) => {
              var reader = new FileReader();
              reader.addEventListener("load", function () {
                resolve(reader.result);
              }, false);
              reader.onerror = () => {
                return reject(this);
              };
              reader.readAsDataURL(blob);
            });
        }
    
        function footerFunc(img) {
          pdf.footer(function (page: any, pages: any) {
            return {
              height: 40,
              columns: [
                {
                  alignment: "center",
                  image: img,
                  fit: [789, 150],
                  absolutePosition: { x: 10, y: 10 }
                },
                {
                  text: [
                    { text: 'Pag ' + page.toString() },
                    " - ",
                    { text: pages.toString() }
                  ],
                  color: 'white',
                  fontSize: 8,
                  absolutePosition: { x: 640, y: 38 }
                },
    
              ],
    
            }
          });
        }
    
        await getBase64ImageFromUrl('assets/rutas/pdfs/footerPDF.png')
          .then(result => footerFunc(result))
          .catch(err => console.error(err));
          
          const definition = pdf.getDefinition();

          pdfMake.createPdf(definition).getDataUrl(function (dataUrl) {
            
            let base64Content = dataUrl.split(',')[1];  
            const byteCharacters = atob(base64Content);
            
            const byteArrays = new Uint8Array([...byteCharacters].map(char => char.charCodeAt(0)));
            
            const byteArray = new Uint8Array(byteArrays);
            
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = "reporteCuantitativo_" + clienteInfo.nameClient + "_" + infoCabero.muestra;
            a.click();

            URL.revokeObjectURL(url);

            resolve(base64Content); 
        });
      
      } catch (error) {
        reject(error);
      }
  });
}

}
