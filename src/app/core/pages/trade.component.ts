import { Component } from '@angular/core';
import { UserPreferencesComponent } from "@app/core/ui/user-preferences.component";

@Component({
  standalone: true,
  selector: 'app-trade',
  imports: [UserPreferencesComponent],
  template: `
    <h2>Trade Page</h2>
    <p>Perform your trades here!</p>

    <app-user-preferences></app-user-preferences>
  `,
  styles: [`

  `]
})
export class TradeComponent {}
