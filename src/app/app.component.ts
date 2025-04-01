import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from '@app/components/nav-bar/nav-bar.component';
import { SideMenuMobileComponent } from '@app/components/side-menu-mobile/side-menu-mobile.component';
import { RedirectService } from '@app/services/redirect.service';
import { SharedModule } from '@app/shared/shared.module';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from '@app/services/messages.service';
import { MessageFactoryComponent } from '@app/components/message-factory/message-factory.component';
import { Ban, Check, MessageCircleWarning, TriangleAlert } from 'lucide-angular';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        NavBarComponent,
        SideMenuMobileComponent,
        SharedModule,
        MessageFactoryComponent
    ],
    template: `
        <app-nav-bar class='navbar'></app-nav-bar>
        <div class='view'>
            <router-outlet></router-outlet>
        </div>
        <app-side-menu-mobile></app-side-menu-mobile>
        <app-message-factory></app-message-factory>
    `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'my-angular-app';

    public icons = {
        error: Ban,
        info: MessageCircleWarning,
        warning: Ban,
        success: TriangleAlert
    }

    constructor(
        private redirectService: RedirectService, // Automatically sets redirection rules
        private translate: TranslateService,
        private messageService: MessageService,
    ) {
        // Set default language
        this.translate.use('en');

        // FIXME: remove this code. It's just for testing purposes -----
        // let counter = 1;
        // const timer = setInterval(() => {
        //     console.log('counter', counter);
        //     const types = ['info', 'success', 'warning', 'error'];
        //     if (counter === 0) {
        //         clearInterval(timer);
        //     }
        //     const type = types[counter % types.length];
        //     this.messageService.pushMessage({
        //         content: 'SAMPLE_MESSAGE',
        //         // rotate between types
        //         type: type,
        //         autoClose: true,
        //         duration: 5000,
        //         destroyDelay: 600,
        //     });
        //     counter--;
        // }, 1000);
        // -------------------------------------------------------------
    }
}
