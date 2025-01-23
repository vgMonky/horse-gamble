import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-home',
  template: `
    <h2>Home Page</h2>
    <p>Welcome to the home page!</p>
  `,
  styles: [`
    h2 {
      color: #444;
    }
  `]
})
export class HomeComponent {}
