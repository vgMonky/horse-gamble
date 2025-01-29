import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { AppState } from '@app/core/store/app.state';
import * as UserPreferencesActions from '@app/core/store/user_preferences/user-preferences.actions';
import * as UserPreferencesSelectors from '@app/core/store/user_preferences/user-preferences.selectors';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-preferences',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="preferences-container">
      <h2>User Preferences</h2>
      
      <!-- Toggle Theme Button -->
      <button class="btn" (click)="toggleTheme()">
        Switch to {{ (isDarkTheme$ | async) ? 'Light' : 'Dark' }} Theme
      </button>
      
      <!-- Hue Slider -->
      <div class="input-group">
        <label for="hue">Hue (--h): {{ (hue$ | async) }}</label>
        <input 
          type="range" 
          id="hue" 
          [value]="(hue$ | async)" 
          (input)="updateHue($event)" 
          min="0" 
          max="360" 
        />
        <div class="color-display" [style.backgroundColor]="'hsl(' + (hue$ | async) + ', 50%, 50%)'"></div>
      </div>
      
      <!-- Hue1 Slider -->
      <div class="input-group">
        <label for="hue1">Hue1 (--h1): {{ (hue1$ | async) }}</label>
        <input 
          type="range" 
          id="hue1" 
          [value]="(hue1$ | async)" 
          (input)="updateHue1($event)" 
          min="0" 
          max="360" 
        />
        <div class="color-display" [style.backgroundColor]="'hsl(' + (hue1$ | async) + ', 50%, 50%)'"></div>
      </div>
    </div>
  `,
  styles: [`
    .preferences-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      border-radius: 10px;
    }

    .input-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .input-group label {
      width: 100px;
    }

    .input-group input[type="range"] {
      flex: 1;
    }

    .color-display {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid #ccc;
    }


  `]
})
export class UserPreferencesComponent implements OnInit, OnDestroy {
  isDarkTheme$: Observable<boolean>;
  hue$: Observable<number>;
  hue1$: Observable<number>;
  private subscriptions: Subscription = new Subscription();

  constructor(private store: Store<AppState>) {
    this.isDarkTheme$ = this.store.pipe(select(UserPreferencesSelectors.selectIsDarkTheme));
    this.hue$ = this.store.pipe(select(UserPreferencesSelectors.selectHue));
    this.hue1$ = this.store.pipe(select(UserPreferencesSelectors.selectHue1));
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
    this.store.dispatch(UserPreferencesActions.toggleTheme());
  }

  updateHue(event: Event) {
    const input = event.target as HTMLInputElement;
    const h = Number(input.value);
    if (h >= 0 && h <= 360) {
      this.store.dispatch(UserPreferencesActions.setHue({ h }));
      this.updateCssVariable('--h', h);
    }
  }

  updateHue1(event: Event) {
    const input = event.target as HTMLInputElement;
    const h1 = Number(input.value);
    if (h1 >= 0 && h1 <= 360) {
      this.store.dispatch(UserPreferencesActions.setHue1({ h1 }));
      this.updateCssVariable('--h1', h1);
    }
  }

  private updateCssVariable(variable: string, value: string | number) {
    document.documentElement.style.setProperty(variable, value.toString());
  }
}
