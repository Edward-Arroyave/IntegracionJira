import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export enum ModalColors {
  PURPLE = '#3f2e63',
  CBLUE = 'rgba(0, 160, 236, 1)',
  BLACK = '#575656'
}

@Component({
  selector: 'app-modal-message',
  standalone: true,
  imports: [MatDialogModule, CommonModule ],
  templateUrl: './modal-message.component.html',
  styleUrl: './modal-message.component.css'
})
export class ModalMessageComponent {
  title?: string;
  info?: string;
  info2?: string;
  titleBold:any[]=[false,""];
  titleNormal:any[]=[false,""];
  image?: string;
  color:ModalColors;
  colorLetter:ModalColors
  btn?:string;
  btnP?:string;
  btnColor:string;
  primaryBtn:any[]=[false,""];
  secondBtn:any[]=[false,""];
  automaticClose?:boolean = true;

  @Output() primaryEvent: EventEmitter<void>;
  @Output() secondaryEvent: EventEmitter<void>;

  constructor(public dialogRef: MatDialogRef<ModalMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {
      this.info=this.data?.info;
      this.image=this.data?.image;
      this.title=this.data?.title;
      this.info2=this.data?.info2;
      this.btn=this.data?.btn;
      this.btnP=this.data.btn2==null || this.data.btn2==undefined || this.data.btn2==""?"Aceptar":this.data.btn2;
      this.color=this.data.color;
      this.colorLetter=this.data.colorLetter
      this.titleNormal=this.data?.titleNormal==undefined?this.titleNormal:this.data?.titleNormal
      this.titleBold=this.data?.titleBold==undefined?this.titleBold:this.data?.titleBold
      this.primaryBtn=this.data?.primaryBtn==undefined?this.primaryBtn:this.data?.primaryBtn
      this.secondBtn=this.data?.secondBtn==undefined?this.secondBtn:this.data?.secondBtn
      this.automaticClose=this.data?.automaticClose==undefined ? this.automaticClose : this.data?.automaticClose
      switch(this.data.color){
        case ModalColors.PURPLE:
           this.btnColor = "accent";
           break
         case ModalColors.CBLUE:
            this.btnColor = "primary";
            break

        }
      this.primaryEvent = new EventEmitter<void>();
      this.secondaryEvent = new EventEmitter<void>();
     }

  ngOnInit(): void {


  }

  close(){
    this.secondaryEvent?.emit();
    this.dialogRef.close();
  }

  prevenirEnter(event: any): void {
    event.preventDefault();
  }

  primary(){
    this.primaryEvent?.emit();
    if(this.automaticClose){
      this.dialogRef.close();
    }
  }



}


