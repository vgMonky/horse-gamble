import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterModule],
  // Inline template
  template: `
    <nav style="display:flex; gap:1rem;">
      <a routerLink="/">Home</a>
      <a routerLink="/trade">Trade</a>
      <a routerLink="/explore">Explore</a>
    </nav>
  `,
  // Inline styles
  styles: [`
    nav {
      background-color: #eee;
      padding: 1rem;
    }
    a {
      text-decoration: none;
      color: #333;
      font-weight: bold;
    }
    a:hover {
      color: purple;
    }
  `]
})
export class NavBarComponent {}
