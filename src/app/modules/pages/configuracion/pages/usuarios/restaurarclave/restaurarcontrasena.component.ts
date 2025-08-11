import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { PublicService } from '@app/services/public.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-restaurarcontrasena',
    templateUrl: './restaurarcontrasena.component.html',
    styleUrls: ['./restaurarcontrasena.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgIf, TranslateModule,  MatFormFieldModule, MatInputModule, RouterLink, MatIcon]
})
export class RestaurarcontrasenaComponent implements OnInit {
  dateNow: Date = new Date();
  dateNowISO = this.dateNow.toTimeString();
  recuperarContrasena: FormGroup;
  userNAme:any  = localStorage.getItem("user")
  hide : boolean = true
  hide1 : boolean = true
  hide2 : boolean = true

  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private publicService: PublicService,
    private usuarioService: UsuariosService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
    private datePipe: DatePipe,
    ) { }
  username: string;

  ngOnInit(): void {
    this.formRestaurarContrasena();
    console.log(this.recuperarContrasena.value);

    this.username = this.activatedRoute.snapshot.paramMap.get('username');
  }

  validarQueSeanIguales: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
    const password = control.get('pass');
    const confirmarPassword = control.get('ConfirmPass');

    return password.value === confirmarPassword.value ? null : { 'noSonIguales': true };
  };


  checarSiSonIguales(): boolean {
    return this.recuperarContrasena.hasError('noSonIguales') &&
      this.recuperarContrasena.get('pass').dirty &&
      this.recuperarContrasena.get('ConfirmPass').dirty;
  }


  formRestaurarContrasena(){
   this.recuperarContrasena = this.formBuilder.group({
    passActual: ['', [Validators.required]],
    pass: ['', [Validators.required]],
    ConfirmPass: ['', [Validators.required]],
    username : [this.userNAme ? this.userNAme : '', [Validators.required]]
  },{
    validators: this.validarQueSeanIguales
  });
}
restaurarContrasena(){
  if (!this.recuperarContrasena.invalid) {
    const datos =  {
      pass: this.recuperarContrasena.value.pass,
      username: this.recuperarContrasena.value.username,
      passActual: this.recuperarContrasena.value.passActual,
      ConfirmPass: this.recuperarContrasena.value.ConfirmPass,
    }

    this.usuarioService.restaurarcontrasena(datos).subscribe(respuesta => {
      console.log('respuesta',respuesta);
     this.toastr.success(this.translate.instant(respuesta.mensaje));
     this.router.navigate(['/login/']);
  }, (error)=>{
    console.log(error);

    this.toastr.error(this.translate.instant(error.error.message));
    const Loguser = {
      Fecha: this.datePipe.transform(new Date(), "yyyy-MM-dd"),
      Hora: this.dateNowISO,
      Metodo: this.translate.instant('MODULES.NOTIFICACIONES.METODOLOGCREADO'),
      Datos: JSON.stringify(datos),
      Respuesta: JSON.stringify(error),
      TipoRespuesta: status
    }
    this.usuarioService.createLogAsync(Loguser).then(respuesta => { });

  });
}
}
}