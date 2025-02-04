import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import { user } from '@app/store/user';
import { Observable, Subscription } from 'rxjs';

@Component({
    selector: 'app-user-preferences',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './user-preferences.component.html',
    styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit, OnDestroy {
    isDarkTheme$: Observable<boolean>;
    hue$: Observable<number>;
    hue1$: Observable<number>;
    private subscriptions: Subscription = new Subscription();

    constructor(private store: Store<AppState>) {
        this.isDarkTheme$ = this.store.pipe(select(user.selectors.isDarkTheme));
        this.hue$ = this.store.pipe(select(user.selectors.hue));
        this.hue1$ = this.store.pipe(select(user.selectors.hue1));
    }

    ngOnInit(): void {
        // Subscribe to theme changes to update the body class
        const themeSub = this.isDarkTheme$.subscribe((isDark) => {
            if (isDark) {
                document.body.classList.add('dark-theme');
                document.body.classList.remove('light-theme');
            } else {
                document.body.classList.add('light-theme');
                document.body.classList.remove('dark-theme');
            }
        });

        this.subscriptions.add(themeSub);

        // Initialize theme class based on the current state
        // (Handled by the subscription above)
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    toggleTheme() {
        this.store.dispatch(user.actions.toggleTheme());
    }

    updateHue(event: Event) {
        const input = event.target as HTMLInputElement;
        const h = Number(input.value);
        if (h >= 0 && h <= 360) {
            this.store.dispatch(user.actions.setHue({ h }));
            this.updateCssVariable('--h', h);
        }
    }

    updateHue1(event: Event) {
        const input = event.target as HTMLInputElement;
        const h1 = Number(input.value);
        if (h1 >= 0 && h1 <= 360) {
            this.store.dispatch(user.actions.setHue1({ h1 }));
            this.updateCssVariable('--h1', h1);
        }
    }

    private updateCssVariable(variable: string, value: string | number) {
        document.documentElement.style.setProperty(variable, value.toString());
    }
}
