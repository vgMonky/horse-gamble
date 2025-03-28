import { Component } from '@angular/core';
import { SideContainerComponent } from '@app/components/base-components/side-container/side-container.component';
import {
    LucideAngularModule,
    ChartCandlestick,
    Settings,
    Coins,
    Wallet,
    LogOut,
    ListTree,
    Users
} from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { SessionService } from '@app/services/session-kit.service';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    selector: 'app-user-side-menu',
    imports: [
        SideContainerComponent,
        LucideAngularModule,
        RouterModule,
        SharedModule
    ],
    templateUrl: './user-side-menu.component.html',
    styleUrl: './user-side-menu.component.scss'
})
export class UserSideMenuComponent {
    readonly ChartCandlestickIcon = ChartCandlestick;
    readonly SettingsIcon = Settings;
    readonly CoinsIcon = Coins;
    readonly WalletIcon = Wallet;
    readonly LogoutIcon = LogOut;
    readonly ListTreeIcon = ListTree;
    readonly UsersIcon = Users

    constructor(
        public sessionService: SessionService
    ) {}

    async logout() {
        await this.sessionService.logout();
    }

}