import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  template: `
    <!-- Our standalone NavBar -->
    <app-nav-bar></app-nav-bar>

    <!-- Where route components like Home/Trade/Explore get injected -->
    <router-outlet></router-outlet>
  `,
  styles: [`
    /* Example styles (optional) */
    :host {
      display: block;
      margin: 0 auto;
      font-family: sans-serif;
    }
    app-nav-bar {
      display: block;
      margin-bottom: 1rem;
    }
  `]
})
export class AppComponent {
  title = 'my-angular-app';
}
