import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '@app/services/session-kit.service';
import { SharedModule } from '@app/shared/shared.module';

@Component({
    selector: 'app-accounts',
    standalone: true,
    imports: [
        CommonModule,
        SharedModule
    ],
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.scss']
})
export class AccountsComponent {
    constructor(public sessionService: SessionService) {}
}
