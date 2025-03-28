import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SessionService } from '@app/services/session-kit.service';
import { LucideAngularModule, User } from 'lucide-angular';
import { ExpandableManagerService } from '../base-components/expandable/expandable-manager.service';
import { SharedModule } from '@app/shared/shared.module';
import { SideContainerService } from '../base-components/side-container/side-container.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LucideAngularModule,
        SharedModule
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    readonly UserIcon = User

    constructor(
        public sessionService: SessionService,
        public expandibles: ExpandableManagerService,
        private sideContainerService: SideContainerService,
    ) {}

    async login() {
        try {
            await this.sessionService.login();
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async logout() {
        await this.sessionService.logout();
        this.expandibles.closeAll();
    }

    toggleMobileSideMenu() {
        this.sideContainerService.toggle('mobile-side-menu');
    }
}
