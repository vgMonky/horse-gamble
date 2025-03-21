import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { SideMenuMobileComponent } from '@app/components/side-menu-mobile/side-menu-mobile.component';
import { RedirectService } from '@app/services/redirect.services';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        NavBarComponent,
        SideMenuMobileComponent
    ],
    template: `
        <app-nav-bar></app-nav-bar>
        <div class="view">
            <router-outlet></router-outlet>
        </div>
        <app-side-menu-mobile></app-side-menu-mobile>
    `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'my-angular-app';

    constructor(private redirectService: RedirectService) {} // Instantiates service
}
