// src/app/app.config.ts

import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { StoreModule, MetaReducer } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { EffectsModule} from '@ngrx/effects';
import { AppEffects, AppReducers } from './store/app.state';
import { localStorageSync } from 'ngrx-store-localstorage';

export function localStorageMetaReducer(reducer: any) {
    return localStorageSync({
        keys: ['user'],  
        rehydrate: true, 
    })(reducer);
}

const metaReducers: MetaReducer<any>[] = [localStorageMetaReducer];


export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        importProvidersFrom(
            StoreModule.forRoot(
                AppReducers,
                {
                    metaReducers,
                    runtimeChecks: {
                        strictStateImmutability: true,
                        strictActionImmutability: true,
                    },
                }
            ),
            StoreDevtoolsModule.instrument({
                maxAge: 25, // Retains last 25 states
                logOnly: false // Set to false since environment is not defined
            }),
            EffectsModule.forRoot(AppEffects) 
        ),
    ],
};
