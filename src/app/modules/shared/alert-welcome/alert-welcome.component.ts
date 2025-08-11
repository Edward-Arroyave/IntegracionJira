import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-alert-welcome',
    templateUrl: './alert-welcome.component.html',
    styleUrls: ['./alert-welcome.component.css'],
    standalone: true,
    imports: [TranslateModule]
})
export class AlertWelcomeComponent {

  constructor() { }
}
