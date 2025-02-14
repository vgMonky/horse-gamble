import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { user } from './index';

@Injectable()
export class UserEffects {
    private actions$ = inject(Actions);
    private store = inject(Store<AppState>);

    toggleTheme$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(user.actions.toggleTheme),
                tap(() => {
                    const isDark = document.body.classList.contains('dark-theme');
                    if (isDark) {
                        document.body.classList.remove('dark-theme');
                        document.body.classList.add('light-theme');
                    } else {
                        document.body.classList.remove('light-theme');
                        document.body.classList.add('dark-theme');
                    }
                })
            ),
        { dispatch: false } // No new action dispatched, just a side effect
    );

    setHue0$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(user.actions.setHue0),
                tap(({ h0 }) => {
                    document.documentElement.style.setProperty('--h0', h0.toString());
                })
            ),
        { dispatch: false }
    );

    setHue1$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(user.actions.setHue1),
                tap(({ h1 }) => {
                    document.documentElement.style.setProperty('--h1', h1.toString());
                })
            ),
        { dispatch: false }
    );

    setHueTheme$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(user.actions.setHueTheme),
                tap(({ h0, h1 }) => {
                    document.documentElement.style.setProperty('--h0', h0.toString());
                    document.documentElement.style.setProperty('--h1', h1.toString());
                })
            ),
        { dispatch: false }
    );
}
