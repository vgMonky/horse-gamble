import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutModule, BreakpointObserver } from '@angular/cdk/layout';
import { SharedModule } from '@app/shared/shared.module';
import { BREAKPOINT } from 'src/types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-races-menu-mobile',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LayoutModule,
        SharedModule
    ],
    templateUrl: './races-menu-mobile.component.html',
    styleUrls: ['./races-menu-mobile.component.scss']
})
export class RacesMenuMobileComponent implements OnInit, OnDestroy {
    isMobileView = false;

    private destroy$ = new Subject<void>();

    constructor(private breakpointObserver: BreakpointObserver) {}

    ngOnInit() {
        this.breakpointObserver
            .observe(BREAKPOINT)
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                this.isMobileView = result.matches;
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
