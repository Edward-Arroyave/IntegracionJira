import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewChecked, AfterViewInit, Component, HostListener, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PublicService } from '@app/services/public.service';
import { SharedService } from '@app/services/shared.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { AppConfig } from '../../../services/config.service';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgIf, NgFor } from '@angular/common';
import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';
import { MatInputModule } from '@angular/material/input';
import {  MatIconModule } from '@angular/material/icon';
import { LoaderService } from '@app/services/loader/loader.service';
import { environment } from '@environment/environment';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: true,
    imports: [ FormsModule, ReactiveFormsModule, NgIf, MatFormFieldModule, MatSelectModule, MatOptionModule, NgFor, MatTooltipModule, RouterLink, TranslateModule, RecaptchaModule, MatInputModule, MatIconModule, NgxMatSelectSearchModule],
    providers: [
      {
        provide: RECAPTCHA_SETTINGS,
        useValue: {
          //siteKey: '6Ldr4fspAAAAAEIuBOTnxFshGKDqsXTMxaaTwBZD', //Test, dev, demo, localhost
          siteKey: '6LcAgQAqAAAAAOaBfZckpE9d3DGzcQtqdFF_OyFf',  //Prod
        }
      },
    ],
})

export class LoginComponent implements OnInit {

  listaSedes: any;
  listaSedesFilter: any;
  login: FormGroup;
  submit: boolean;
  mostrarLogin = true;
  claveIncorrecta: boolean = false;
  usuarioNoExiste: boolean = false;
  noSede: boolean = false;
  caducado: boolean = false;
  inactivo: boolean = false;

  hide : boolean = true;
  recaptcha: boolean = false;
  filterHeadquarters = new FormControl('');

  constructor(

    private router: Router,
    private loaderSvc : LoaderService,
    private formBuilder: FormBuilder,
    private userService: UsuariosService,
    private publicService: PublicService,
    private modalService: BsModalService
  ) {


  }

  public config: { version: string };

  isVisible = true;

  closeInformative() {
    this.isVisible = false;
  }

  /*
  ngOnInit(): void {

    this.recaptcha = environment.recaptcha;
    let dataClientes = import.meta.env.NG_APP_CLIENTS;
    let clientes = JSON.parse(dataClientes);

    this.config = clientes;

    if (this.userService.estaLogueado()) {
      this.router.navigate(['panel/inicio']);
    }

    this.loaderSvc.show();
    this.crearFormularioLogin();
    this.cargarSedes();
    this.userWriting()
    this.loaderSvc.hide();
  }
  */

   ngOnInit(): void {
    this.recaptcha = environment.recaptcha;
    this.config = require("../../../../assets/config.json");

    if (this.userService.estaLogueado()) {
      this.router.navigate(['panel/inicio']);
    }
     this.filtrosAutocomplete();
    this.loaderSvc.show();
    this.crearFormularioLogin();
    this.cargarSedes();
    this.userWriting()
    this.loaderSvc.hide();
  }

  filtrosAutocomplete() {
    this.filterHeadquarters.valueChanges.subscribe(word => {
      if (word) {
        this.listaSedes = this.listaSedesFilter.filter((item: any) => {
          return item.desheadquarters.toLowerCase().includes(word.toLowerCase());
        });
      } else {
        this.listaSedes = this.listaSedesFilter;
      }
    });
  }
  userWriting(){
    this.login.get('username').valueChanges.subscribe(r=>{
      this.caducado = false;
      this.usuarioNoExiste = false;
      this.inactivo = false;
    })
    this.login.get('pass').valueChanges.subscribe(r=>{
      this.claveIncorrecta = false;

    })
  }

  crearFormularioLogin() {
    this.login = this.formBuilder.group({
      username: [localStorage.getItem('username'), [Validators.required]],
      pass: ['', [Validators.required]],
      sede: ['', [Validators.required]],
      recaptcha: ['', [Validators.required]],
      remember :  [localStorage.getItem('rememberUser')],
    });

    if(this.recaptcha === false){
      this.login.removeControl('recaptcha');
    }
  }
  async cargarSedes() {
    this.listaSedes = await this.publicService.obtenerSedes();
    this.listaSedesFilter = await this.publicService.obtenerSedes();
  }

  ingresar() {
    this.submit = true;
    this.loaderSvc.show();
    this.loaderSvc.text.emit({text:'Iniciando sesión...'})
    if (this.login.invalid) {
      this.loaderSvc.hide();
      return;
    } else {
      if(this.login.get('remember').value){
        localStorage.setItem('username',this.login.get('username').value)
        localStorage.setItem('rememberUser',this.login.get('remember').value)
      }
      this.userService.autenticacionUsuario(this.login.controls).then((data: any) => {
        sessionStorage.setItem('sede', data.sede);
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('id', data.id);
        sessionStorage.setItem('interno', AppConfig.settings.controlinterno);
        sessionStorage.setItem('externo', AppConfig.settings.controlexterno);
        this.userService.detalleAsistente(data.id).then(detalle => {
          sessionStorage.setItem('userid', detalle.userid);
          sessionStorage.setItem('rolid', detalle.rolid);
          sessionStorage.setItem('asistente', detalle.name + ' ' + detalle.lastname);
          sessionStorage.setItem('nombres', detalle.name);
          sessionStorage.setItem('apellidos', detalle.lastname);
          sessionStorage.setItem('telefonocontacto', detalle.phone);
          sessionStorage.setItem('email', detalle.email);
          sessionStorage.setItem('imagenuser', detalle.imagenuser);
          sessionStorage.setItem('sede', data.sede);

          this.login.reset();
          this.submit = false;
          this.loaderSvc.hide();
          this.router.navigate(['panel/inicio']);
        });
      },
        (err: HttpErrorResponse) => {

          this.loaderSvc.hide();
          this.claveIncorrecta = false;
          this.usuarioNoExiste = false;
          this.noSede = false;
          this.caducado = false;
          this.inactivo = false;

          let error: string = err.error.message;

          // si está caducado
          if (error.toLowerCase().indexOf('caducado') != -1) {

            this.caducado = true;

            // si no existe
          } else if (error.toLowerCase().indexOf('incorrectos') != -1) {

            this.usuarioNoExiste = true;
          } 
            // si está inactivo
            else if (error.toLowerCase().indexOf('inactivo') != -1) {

            this.inactivo = true;

            // no tiene sede
          } else {

            this.noSede = true;

          }

        });
    }
  }


  resolved(captchaResponse: string) {
    this.login.get("recaptcha").setValue(captchaResponse);
  }

}