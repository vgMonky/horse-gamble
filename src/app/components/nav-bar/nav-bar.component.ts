import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import { user } from '@app/store/user';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LoginComponent,
    ],
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
    isDarkTheme = false;
    isMobileView = false;
    menuId = 'mobile-menu';

    private destroy$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        @Inject(DOCUMENT) private document: Document,
        private breakpointObserver: BreakpointObserver
    ) {}

    ngOnInit() {
        // Detect theme preference
        this.store.select(user.selectors.isDarkTheme)
            .pipe(takeUntil(this.destroy$))
            .subscribe((isDark) => {
                this.isDarkTheme = isDark;
            });

        // Detect viewport size
        this.breakpointObserver.observe([Breakpoints.Handset])
            .pipe(takeUntil(this.destroy$))
            .subscribe(result => {
                this.isMobileView = result.matches;
            });
    }

    toggleTheme() {
        this.isDarkTheme
            ? this.store.dispatch(user.actions.setLight())
            : this.store.dispatch(user.actions.setDark());
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
