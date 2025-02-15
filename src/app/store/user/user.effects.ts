import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store, select } from '@ngrx/store';
import { tap, withLatestFrom } from 'rxjs/operators';
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
                withLatestFrom(this.store.select(user.selectors.isDarkTheme)),
                tap(([_, isDarkTheme]) => {
                    document.body.classList.toggle('dark-theme', isDarkTheme);
                    document.body.classList.toggle('light-theme', !isDarkTheme);
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
