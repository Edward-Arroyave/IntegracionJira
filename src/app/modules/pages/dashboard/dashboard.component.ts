import { Component, ElementRef, HostListener, OnDestroy, OnInit, signal, TemplateRef, viewChild, ViewChild } from '@angular/core';
import { SidebarService } from '@app/services/general/sidebar.service';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuariosService } from '../../../services/usuarios/usuarios.service';
import { ToastrService } from 'ngx-toastr';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { SendEmailmtoService } from '../../../services/mantenimiento-calibradores/send-mail.service';
import { MantenimientoPreventivoService } from '../../../services/mantenimiento-calibradores/mto-preventive.service';
import { MatDialog } from '@angular/material/dialog';
import { DefaultImagePipe } from '../../core/pipes/default-image.pipe';
import { ImageCdnPipe } from '../../core/pipes/image-cdn.pipe';
import { FooterComponent } from '../../shared/footer/footer.component';
import { BreadcrumbsComponent } from '../../shared/breadcrumbs/breadcrumbs.component';
import { NgClass, NgIf, NgFor, UpperCasePipe, DatePipe, Location } from '@angular/common';
import { MenuComponent } from '@app/modules/shared/menu/menu.component';
import { NavigateService } from '@app/services/general/navigate.service';
import { filter, Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import {MatBadgeModule} from '@angular/material/badge';

interface mtoPreventive {
  idpreventive_mto: number;
  serial: string;
  description: string;
  datepro: string;
  hourpro: string;
  dateexe: string;
  hourexe: string;
  maintenanceissue: string;
  active: boolean;
  serialDetalle: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [MenuComponent, NgClass, NgIf, BreadcrumbsComponent, RouterOutlet,
    FooterComponent, NgFor, FormsModule, ReactiveFormsModule, UpperCasePipe, RouterLink,
    DatePipe, TranslateModule, ImageCdnPipe, DefaultImagePipe, MatTooltipModule, MatSelectModule, MatIcon, MatBadgeModule]
})
export class DashboardComponent implements OnInit, OnDestroy {

  foto: string;
  username: any;
  formEditPerfil: FormGroup;
  spin: boolean = false;
  vantanaModal: BsModalRef;
  ventanaModalSesion: BsModalRef;
  nombreRol = '';
  mostrarModal: boolean = false;
  urltrazabilidad: any;
  time: any;
  time2: any;
  respuestaInactividadFlag: boolean = true;
  //vueltas = new Array(5);
  mantenimientosPorSerialProg: mtoPreventive[] = [];
  imgInterfaz = signal<string>('');


  public subscriber: Subscription;
  flagVisualizarImg: boolean = true;
  flagVerAjustes = signal<boolean>(false);
  @ViewChild('cajustes') eventClickcajustes!: ElementRef;
  @ViewChild('inicioajuste') eventInicioAjuste!: ElementRef;

  constructor(public sidebarservice: SidebarService,
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private sendEmailmtoService: SendEmailmtoService,
    private mantenimientoPreventivoService: MantenimientoPreventivoService,
    private router: Router,
    private modalService: BsModalService,
    private navigateService: NavigateService,
    private location: Location
  ) { }
  @ViewChild('inactividadModal') inactividadModal: TemplateRef<any>;

  @HostListener('document:mousemove')
  @HostListener('document:keypress')
  @HostListener('document:click')
  @HostListener('document:wheel')
  inactividad() {
    if (this.router.url.includes('panel')) {
      this.respuestaInactividadFlag = true;
      clearTimeout(this.time);
      this.time = setTimeout(() => {
        if (this.ventanaModalSesion === undefined) {
          this.ventanaModalSesion = this.modalService.show(this.inactividadModal, { backdrop: 'static', keyboard: false });
          clearTimeout(this.time2);
          this.time2 = setTimeout(() => {
            this.modalService.hide();
            this.ventanaModalSesion.hide();
            this.modalService.hide();
            this.usuariosService.alerta();
          }, 3000000);
        }
      }, 3000000);
    }

  }

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.eventClickcajustes.nativeElement.contains(event.target);
    const clickedInside2 = this.eventInicioAjuste.nativeElement.contains(event.target);
    if (!clickedInside2) {
      if (!clickedInside && this.flagVerAjustes()) this.flagVerAjustes.set(false);
    }
  }


  cambiarEstado(){
    this.flagVerAjustes() ? this.flagVerAjustes.set(false) : this.flagVerAjustes.set(true);
  }

  onPageLoad(event) {
    const element = event.target as HTMLElement;
    element.scrollTop > 70 ? this.flagVisualizarImg = false : this.flagVisualizarImg = true;
  }

  ngOnDestroy(): void {
    clearTimeout(this.time);
    clearTimeout(this.time2);
  }

  cerrarSesion() {
    this.ventanaModalSesion.hide();
    this.usuariosService.alerta();
  }
  continuarSesion() {
    this.ventanaModalSesion.hide();
    this.ventanaModalSesion = undefined;
    clearTimeout(this.time);
    clearTimeout(this.time2);
  }

  ngOnInit(): void {
    this.getDataUser();
    this.EditFormularioPerfil('');
    this.foto = sessionStorage.getItem('imagenuser') || '';
    this.urltrazabilidad = this.sidebarservice.apiURL;
    this.cargarNotificaciones();
    this.inactividad();

    let arrRuta = this.location.path().split('/');
    let ruta = arrRuta[arrRuta.length - 1];
    this.filtrarImagenes(ruta);

    this.subscriber = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      arrRuta = event['url'].split('/');
      ruta = arrRuta[arrRuta.length - 1];
      this.filtrarImagenes(ruta);

    });
    // this.usuariosService.RenovationToken();
  }

  filtrarImagenes(ruta: string) {

    if (ruta === 'datos-aberrantes') ruta = 'diccionario-resultados';
    if (ruta === 'cuali-multi') ruta = 'gestion-test';
    if (ruta === 'reporte-semicuantitativo-cliente') ruta = 'reporte-semicuantitativo';
    if (ruta === 'indicadores-reportes' || ruta == 'inicio' || ruta == 'reporte-cuantitativo') {
      this.imgInterfaz.set('');
      return
    };

    this.imgInterfaz.set('assets/rutas/' + ruta + '.png');
  }

  toggleSidebar() {
    this.sidebarservice.setSidebarState(!this.sidebarservice.getSidebarState());
  }
  toggleBackgroundImage() {
    this.sidebarservice.hasBackgroundImage = !this.sidebarservice.hasBackgroundImage;
  }
  getSideBarState() {
    return this.sidebarservice.getSidebarState();
  }
  hideSidebar() {
    this.sidebarservice.setSidebarState(true);
  }


  async cargarNotificaciones() {

    const notifications: any[] = await this.sendEmailmtoService.getAllAsync().then(res => res).catch(err => []);
    const serials = [... new Set(notifications.map(item => item.serial))];
    let mantenimientos = [];
    serials.forEach(element => {
      this.mantenimientoPreventivoService.getInfoPreventivo(element)
        .subscribe((mtosPreventivos: mtoPreventive[]) => {

          mtosPreventivos.forEach(item => {
            mantenimientos.push(item);
          });

          this.mantenimientosPorSerialProg = mantenimientos.filter(item => new Date(item.datepro).getTime() > new Date().getTime());

        });
    });

  }


  getDataUser() {

    let idUser: number = parseInt(sessionStorage.getItem('userid'));

    this.usuariosService.getUser(idUser).then((user: any) => {

      this.EditFormularioPerfil(user);

    })

  }

  getFoto(foto: File) {

    if (foto != undefined) {

      this.spin = true;
      var reader = new FileReader();
      var base64: any;
      reader.readAsDataURL(foto);
      reader.onload = function () {

        base64 = reader.result;

      };

      setTimeout(() => {

        this.spin = false;
        this.foto = base64.substr(base64.indexOf(',') + 1);

      }, 3000)

    }

  }

  EditFormularioPerfil(datos: any) {

    datos.rolid == 1 ? this.nombreRol = 'Administrador' : datos.rolid == 2 ? this.nombreRol = 'Coordinador' : datos.rolid == 3 ? this.nombreRol = 'Bacteriologo' : this.nombreRol = 'Cliente';

    this.formEditPerfil = this.fb.group({

      userid: [datos.userid],
      typeid: [datos.typeid],
      name: [datos.name, [Validators.required]],
      lastname: [datos.lastname],
      username: [datos.username],
      pass: [''],
      idparametro: [datos.idparametro],
      nrodoc: [datos.nrodoc],
      phone: [datos.phone, [Validators.required]],
      birthdate: [datos.birthdate],
      tarprof: [datos.tarprof],
      email: [datos.email, [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      rolid: [datos.rolid],
      active: [datos.active],
      superusersede: [datos.superusersede],
      datecreate: [datos.datecreate],
      dateexp: [datos.dateexp],
      ativeexp: [datos.ativeexp],

    });

  }

  EditarPerfilUsuario() {

    if (this.formEditPerfil.valid) {

      var data = this.formEditPerfil.value;

      const imagen = {
        imagenuser: this.foto
      }

      const datos = Object.assign(data, imagen);

      this.usuariosService.updateAsync(datos, this.formEditPerfil.value.userid).then(_ => {

        sessionStorage.removeItem('imagenuser');
        sessionStorage.setItem('imagenuser', this.foto);
        window.location.reload();

      });

      this.username = this.formEditPerfil.value.name + this.formEditPerfil.value.lastname;
      this.toastr.success(this.translate.instant('MODULES.NOTIFICACIONES.USUARIO_ACTUALIZADO'));

    }

  }
  verModal() {
    setTimeout(() => {
      this.mostrarModal ? this.mostrarModal = false : this.mostrarModal = true;
    }, 100);
  }
  hideModal() {
    this.mostrarModal = false;
  }
  closeVentana(): void {
    this.vantanaModal.hide();
  }

  interceptarUrl() {

  }

  async logout() {
    this.usuariosService.logout();
    this.navigateService.goToLogin();
  }

}
