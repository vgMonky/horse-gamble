import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '@app/components/login/login.component';
import { SessionService } from '@app/services/session-kit.service';

@Component({
    selector: 'app-accounts',
    standalone: true,
    imports: [CommonModule, LoginComponent],
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent {
    constructor(public sessionService: SessionService) {}
}
