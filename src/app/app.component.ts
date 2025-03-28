import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { UserSideMenuComponent } from '@app/components/user-side-menu/user-side-menu.component';
import { RedirectService } from '@app/services/redirect.services';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        NavBarComponent,
        UserSideMenuComponent,
        SharedModule
    ],
    template: `
        <app-nav-bar class='navbar'></app-nav-bar>
        <div class='view'>
            <router-outlet></router-outlet>
        </div>
        <app-user-side-menu></app-user-side-menu>
    `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'my-angular-app';


    constructor(
        private redirectService: RedirectService, //Automatically sets redirection rules
        private translate: TranslateService,
    ) {
        // Set default language
        this.translate.use('en');
    }
}
