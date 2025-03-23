import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { SideMenuMobileComponent } from '@app/components/side-menu-mobile/side-menu-mobile.component';
import { RedirectService } from '@app/services/redirect.services';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        NavBarComponent,
        SideMenuMobileComponent,
        SharedModule
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

    constructor(
        private redirectService: RedirectService,
        private translate: TranslateService,
    ) {
        // Set default language
        this.translate.setDefaultLang('en');
        // Use default language
        this.translate.use('en');

        // FIXME: Remove this section (is for testing only) -----------------------------
        // changint the language in 5 seconds to es with a console count down by seconds
        let count = 5;
        const interval = setInterval(() => {
            console.log(`Changing language in ${count} seconds`);
            count--;
            if (count === 0) {
                clearInterval(interval);
                console.log('Changing language to Español');
                this.translate.use('es');
            }
        }, 1000);
        // ------------------------------------------------------------------------------
    }
}
