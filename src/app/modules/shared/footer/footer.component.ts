import { Component, OnInit } from '@angular/core';
import { UsuariosService } from '@app/services/usuarios/usuarios.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css'],
    standalone: true,
    imports: [NgIf]
})
export class FooterComponent implements OnInit {

  constructor(
    public userService: UsuariosService
    ) {
  }
  public config: {version: string};
  /*
  ngOnInit(): void {
    let dataClientes = import.meta.env.NG_APP_CLIENTS;
    let clientes = JSON.parse(dataClientes);
    this.config = clientes;
  }
    */

  ngOnInit(): void {
    this.config = require("../../../../assets/config.json");
  }

  showMenu() {
    if (this.userService.obtenerToken() != null) {
      return true;
    } else {
      return false;
    }
  }
}
