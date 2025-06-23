import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { SideMenuMobileComponent } from '@app/components/side-menu-mobile/side-menu-mobile.component';
import { RedirectService } from '@app/services/redirect.service';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { RacesMenuMobileComponent } from './components/races-menu-mobile/races-menu-mobile.component';
import { HorseRaceService } from './game/horse-race.service';
import { BetService } from './game/bet.service';
import { PoolService } from './game/pool.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        NavBarComponent,
        SideMenuMobileComponent,
        RacesMenuMobileComponent,
        SharedModule
    ],
    template: `
        <app-nav-bar class='navbar'></app-nav-bar>
        <div class='view'>
            <router-outlet></router-outlet>
        </div>
        <app-side-menu-mobile></app-side-menu-mobile>
        <app-races-menu-mobile></app-races-menu-mobile>
    `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'my-angular-app';


    constructor(
        private redirectService: RedirectService, //Automatically sets redirection rules
        private translate: TranslateService,
        private horseRaceSrv: HorseRaceService,
        private betSrv: BetService,
        private poolSrv: PoolService
    ) {
        // Set default language
        this.translate.use('en');
    }
}
