import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Inject, Output, output, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export enum ModalColors {
  TOMATO = 'rgba(209, 62, 73, 1)',
  BLUE = '#006EA1',
  YELLOW = '#FFB703',
  GREEN = '#129C8D',
  WHITE = '#FFFFFF',
  PURPLE = '#6379D8',
  CBLUE = 'rgba(0, 160, 236, 1)'
}

@Component({
  selector: 'app-modal-general',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './modal-general.component.html',
  styleUrl: './modal-general.component.css'
})
export class ModalGeneralComponent {



  content?: TemplateRef<any>;
  btn?: string;
  btn2?: string;
  permiso?: boolean;
  error?: boolean;
  footer?: boolean;
  type?: string;
  color?: ModalColors.CBLUE;
  title?: string;
  image?: string;
  message:string;

  @Output() primaryEvent: EventEmitter<void>;
  @Output() secondaryEvent: EventEmitter<void>;

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  constructor(
    public dialogRef: MatDialogRef<ModalGeneralComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly changeDetectorRef: ChangeDetectorRef) {
    this.content = this.data?.content;
    this.btn = this.data?.btn;
    this.title = this.data?.title;
    this.image = this.data?.image;
    this.btn2 = this.data?.btn2;
    this.error = this.data?.error;
    this.type = this.data?.type;
    this.message = this.data?.message;
    this.footer = this.data?.footer !== undefined ? this.data?.footer : true;
    this.color = this.data?.color !== undefined ? this.data?.color : ModalColors.CBLUE;
    this.primaryEvent = new EventEmitter<void>();
    this.secondaryEvent = new EventEmitter<void>();
    if(this.title === 'Editar') this.image='assets/rutas/iconos/editar.png';
    if(this.title === 'Crear') this.image='assets/rutas/iconos/crear.png';
    if(this.title === 'Eliminar') this.image='assets/rutas/iconos/pregunta.png';
  }

  ngOnInit(): void {

  }

  public close() {
    this.dialogRef.close();
  }

  second() {
    this.secondaryEvent?.emit();
  }
  primary() {
    this.primaryEvent?.emit();
  }

}
