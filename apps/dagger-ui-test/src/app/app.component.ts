import { Component } from '@angular/core';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
    selector: 'dagger-ui-test-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [NxWelcomeComponent],
})
export class AppComponent {
  title = 'dagger-ui-test';
}
