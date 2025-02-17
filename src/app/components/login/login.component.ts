import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropDownComponent } from '../drop-down/drop-down.component';
import { RouterModule } from '@angular/router';
import { SessionService } from '@app/services/session-kit.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        DropDownComponent,
        RouterModule,
    ],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

    constructor(public sessionService: SessionService) {}

    async login() {
        try {
            await this.sessionService.login();
        } catch (error) {
            console.error('Login failed:', error);
        }
    }

    async logout() {
        await this.sessionService.logout();
    }
}
