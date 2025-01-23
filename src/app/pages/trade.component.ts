import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-trade',
  template: `
    <h2>Trade Page</h2>
    <p>Perform your trades here!</p>
  `,
  styles: [`
    h2 {
      color: #225;
    }
  `]
})
export class TradeComponent {}
