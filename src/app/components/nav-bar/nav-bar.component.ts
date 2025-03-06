import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { DOCUMENT, CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import { user } from '@app/store/user';
import { RouterModule } from '@angular/router';
import { LoginComponent } from '../login/login.component';
import { Subject, takeUntil } from 'rxjs';
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        LoginComponent,
        WindowContainerComponent
    ],

    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {
    isMenuOpen = false;
    isDarkTheme = false; // track current theme locally
    menuId = 'mobile-menu';

    private destroy$ = new Subject<void>();

    constructor(
        private store: Store<AppState>,
        @Inject(DOCUMENT) private document: Document
    ) {}

    ngOnInit() {
        this.store.select(user.selectors.isDarkTheme)
            .pipe(takeUntil(this.destroy$))
            .subscribe((isDark) => {
                this.isDarkTheme = isDark;
            });
    }

    toggleMenu() {this.isMenuOpen = !this.isMenuOpen;}
    closeMenu() {this.isMenuOpen = false;}

    toggleTheme() {
        if (this.isDarkTheme) {
            this.store.dispatch(user.actions.setLight());
        } else {
            this.store.dispatch(user.actions.setDark());
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
