import { Component } from '@angular/core';
import { SideContainerComponent } from '@app/components/base-components/side-container/side-container.component';
import { LucideAngularModule, Omega, Users, Wallet, LogOut } from 'lucide-angular';
import { SideContainerService } from '@app/components/base-components/side-container/side-container.service';

@Component({
    selector: 'app-side-menu-mobile',
    imports: [SideContainerComponent, LucideAngularModule],
    templateUrl: './side-menu-mobile.component.html',
    styleUrl: './side-menu-mobile.component.scss'
})
export class SideMenuMobileComponent {
    readonly OmegaIcon = Omega
    readonly UsersIcon = Users
    readonly WalletIcon = Wallet
    readonly LogoutIcon = LogOut

    constructor(
        private sideContainerService: SideContainerService,
    ) {}

    close() {
        this.sideContainerService.close('mobile-side-menu');
    }

}