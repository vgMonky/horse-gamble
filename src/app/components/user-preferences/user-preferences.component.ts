import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { AppState } from '@app/store/app.state';
import { user } from '@app/store/user';
import { Observable, Subject } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { ToggleComponent } from '../toggle/toggle.component';

@Component({
    selector: 'app-user-preferences',
    standalone: true,
    imports: [CommonModule, ToggleComponent],
    templateUrl: './user-preferences.component.html',
    styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit, OnDestroy {
    // Observables from store
    hue0$: Observable<number>;
    hue1$: Observable<number>;
    currentState$: Observable<number>;

    // Subjects for debouncing
    private hue0Subject = new Subject<number>();
    private hue1Subject = new Subject<number>();

    // Cleanup subject
    private destroy$ = new Subject<void>();

    constructor(private store: Store<AppState>) {
        // Access store slices
        this.hue0$ = this.store.pipe(select(user.selectors.hue0));
        this.hue1$ = this.store.pipe(select(user.selectors.hue1));

        this.currentState$ = this.store.pipe(
            select(user.selectors.isDarkTheme),
            map((isDark) => (isDark ? 0 : 1)) // Dark = 0, Light = 1
        );
    }

    ngOnInit(): void {
        // Debounce hue0
        this.hue0Subject
            .pipe(
                debounceTime(100),          // Wait 300ms
                distinctUntilChanged(),     // Only if value changed
                takeUntil(this.destroy$)    // Unsubscribe on destroy
            )
            .subscribe((h0) => {
                this.store.dispatch(user.actions.setHue0({ h0 }));
            });

        // Debounce hue1
        this.hue1Subject
            .pipe(
                debounceTime(100),
                distinctUntilChanged(),
                takeUntil(this.destroy$)
            )
            .subscribe((h1) => {
                this.store.dispatch(user.actions.setHue1({ h1 }));
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onStateChange(newState: number) {
        switch (newState) {
            case 0:
                this.store.dispatch(user.actions.setDark());
                break;
            case 1:
                this.store.dispatch(user.actions.setLight());
                break;
        }
    }

    updateHue(event: Event) {
        const input = event.target as HTMLInputElement;
        const h0 = Number(input.value);
        if (h0 >= 0 && h0 <= 360) {
            this.hue0Subject.next(h0);
        }
    }

    updateHue1(event: Event) {
        const input = event.target as HTMLInputElement;
        const h1 = Number(input.value);
        if (h1 >= 0 && h1 <= 360) {
            this.hue1Subject.next(h1);
        }
    }

    setHueTheme(theme: 'default' | 'candyflip' | 'cryptonite') {
        let h0, h1;
        
        switch (theme) {
            case 'candyflip':
                h0 = 160;
                h1 = 280;
                break;
            case 'cryptonite':
                h0 = 190;
                h1 = 70;
                break;
            default:
                h0 = 160;
                h1 = 230;
        }
    
        this.store.dispatch(user.actions.setHueTheme({ h0, h1 }));
    }
}
