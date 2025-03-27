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
        <app-nav-bar class='navbar'></app-nav-bar>
        <div class='view'>
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
        this.translate.use('en');

        // FIXME: Remove this section (is for testing only) -----------------------------
        let count = 2;
        let isEnglish = true;

        const interval = setInterval(() => {
            console.log(`Changing language in ${count} seconds`);
            count--;

            if (count === 0) {
                isEnglish = !isEnglish;
                const newLang = isEnglish ? 'en' : 'es';
                console.log(`Changing language to ${newLang.toUpperCase()}`);
                this.translate.use(newLang);

                count = 2; // Reset countdown
            }
        }, 1000);
        // ------------------------------------------------------------------------------
    }
}
