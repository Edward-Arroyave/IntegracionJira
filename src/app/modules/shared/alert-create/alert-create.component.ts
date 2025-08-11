import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-alert-create',
    templateUrl: './alert-create.component.html',
    styleUrls: ['./alert-create.component.css'],
    standalone: true,
    imports: [TranslateModule]
})
export class AlertCreateComponent {

  constructor() { }

}
