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
                    document.body.classList.toggle('dark-theme', !isDark);
                    document.body.classList.toggle('light-theme', isDark);
                })
            ),
        { dispatch: false }
    );

    setDark$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(user.actions.setDark),
                tap(() => {
                    document.body.classList.add('dark-theme');
                    document.body.classList.remove('light-theme');
                })
            ),
        { dispatch: false }
    );

    setLight$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(user.actions.setLight),
                tap(() => {
                    document.body.classList.add('light-theme');
                    document.body.classList.remove('dark-theme');
                })
            ),
        { dispatch: false }
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
