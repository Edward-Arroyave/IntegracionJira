import { TemplateRef } from "@angular/core";
import { ModalColors } from "@app/modules/shared/modals/modal-message/modal-message.component";

export class ModalData{
  title?:string;
  titleBold?:any[];
  titleNormal?:any[];
  primerInicio?: boolean;
  info?: string;
  info2?:string;
  image?: string;
  content?: TemplateRef<any>;
  btn?:string;
  btn2?:string;
  color?:ModalColors;
  colorLetter?:ModalColors
  showBtn3?:boolean;
  primaryBtn?:any[];
  secondBtn?:any[];
  thirdBtn?:any[];
  automaticClose?:boolean;
  footer?:boolean;
  message?:string;
}
