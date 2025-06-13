import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { SessionService } from '@app/services/session-kit.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BREAKPOINT } from 'src/types';

@Injectable({
    providedIn: 'root',
})
export class RedirectService implements OnDestroy {
    private destroy$ = new Subject<void>();

    constructor(
        private router: Router,
        private sessionService: SessionService,
        private breakpointObserver: BreakpointObserver
    ) {
        this.setupRedirectLogic();
    }

    private setupRedirectLogic() {
        let isMobile = false;

        // Detect mobile/desktop
        this.breakpointObserver.observe(BREAKPOINT)
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                isMobile = result.matches;
            });

        // Listen for authentication changes
        this.sessionService.session$
            .pipe(takeUntil(this.destroy$))
            .subscribe(session => {
                if (session) {
                    if (isMobile) {
                        this.router.navigate(['/races']);
                    }
                } else {
                    if (isMobile) {
                        this.router.navigate(['/races']);
                    } else {
                        this.router.navigate(['/races']);
                    }
                }
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
