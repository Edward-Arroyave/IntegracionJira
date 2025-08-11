import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SharedService } from '@app/services/shared.service';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoaderService } from '@app/services/loader/loader.service';

@Component({
    selector: 'app-olvidocontrasena',
    templateUrl: './olvidocontrasena.component.html',
    styleUrls: ['./olvidocontrasena.component.css'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, NgIf, RouterLink, TranslateModule, MatFormFieldModule, MatInputModule]
})

export class OlvidocontrasenaComponent implements OnInit {

  listaSedes: any;
  formulario: FormGroup;
  mostrarformulario = true;

  constructor(
    private router: Router,
    private loaderSvc : LoaderService,
    private formBuilder: FormBuilder,
    private userService: UsuariosService,
    private toastr: ToastrService,
    private translate: TranslateService,

  ) {

  }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      username: ['', [Validators.required]]
    });
  }
  get usernameNoValido() {
    return this.formulario.get('username').invalid && this.formulario.get('username').touched;
  }

  ingresar() {
    if (!this.formulario.invalid) {
    this.loaderSvc.show();
      this.userService.recuperacionContrasena({ username: this.formulario.controls.username.value }, false)
      .pipe(
        finalize(() => this.formulario.reset()),
      )
      .subscribe(data => {
        console.log(data);
        this.toastr.success(data.mensaje);
        this.loaderSvc.hide();
        localStorage.setItem("user", this.formulario.value.username);

        this.router.navigate(['/login/restaurarcontrasena']);
        window.open('#/', '_self');
      }, (error:any)=>{
        this.toastr.error('Fallo al enviar el correo intente en unos minutos!');
      })
}
  }
}
