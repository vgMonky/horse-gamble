import { Component } from '@angular/core';
import { SideContainerComponent } from '@app/components/base-components/side-container/side-container.component';
import {
    LucideAngularModule,
    ChartCandlestick,
    ListChecks,
    Coins,
    Wallet,
    LogOut,
    ListTree,
} from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { SessionService } from '@app/services/session-kit.service';

@Component({
    selector: 'app-side-menu-mobile',
    imports: [
        SideContainerComponent,
        LucideAngularModule,
        RouterModule,
    ],
    templateUrl: './side-menu-mobile.component.html',
    styleUrl: './side-menu-mobile.component.scss'
})
export class SideMenuMobileComponent {
    readonly ChartCandlestickIcon = ChartCandlestick;
    readonly ListChecksIcon = ListChecks;
    readonly CoinsIcon = Coins;
    readonly WalletIcon = Wallet;
    readonly LogoutIcon = LogOut;
    readonly ListTreeIcon = ListTree;

    constructor(
        public sessionService: SessionService
    ) {}

    async logout() {
        await this.sessionService.logout();
    }

}