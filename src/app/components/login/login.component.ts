import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropDownComponent } from '@app/components/base-components/drop-down/drop-down.component';
import { RouterModule } from '@angular/router';
import { SessionService } from '@app/services/session-kit.service';
import { UserPreferencesComponent } from '@app/components/user-preferences/user-preferences.component';
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';
import { ExpandableManagerService } from '../base-components/expandable/expandable-manager.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        DropDownComponent,
        RouterModule,
        WindowContainerComponent,
        UserPreferencesComponent
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    ispreferencesOpen = false;


    constructor(
        public sessionService: SessionService,
        public expandibles: ExpandableManagerService,
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


    togglepreferences() {this.ispreferencesOpen = !this.ispreferencesOpen;}
    closepreferences() {this.ispreferencesOpen = false;}
}
