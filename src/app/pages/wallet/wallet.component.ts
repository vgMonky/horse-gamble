import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '@app/services/session-kit.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-wallet',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit, OnDestroy {
    actor: string | undefined;
    private sessionSubscription!: Subscription;

    constructor(private sessionService: SessionService) {}

    ngOnInit() {
        // Subscribe to session changes and store the subscription
        this.sessionSubscription = this.sessionService.session$.subscribe(session => {
            this.actor = session?.actor;
        });
    }

    // Clean up subscription to prevent memory leaks
    ngOnDestroy() {
        if (this.sessionSubscription) {
            this.sessionSubscription.unsubscribe();
        }
    }
}
