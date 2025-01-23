import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  template: `
    <app-nav-bar></app-nav-bar>
    <div class="view">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      margin: 0 auto;
    }
    
    .view{
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      border: 1px dashed hsl(var(--h), var(--s1), var(--l2));
    }
  `]
})
export class AppComponent {
  title = 'my-angular-app';
}
