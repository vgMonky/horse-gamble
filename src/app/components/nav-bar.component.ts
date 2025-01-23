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
      padding: 1rem;
    }
    a {
      text-decoration: none;
      font-weight: bold;
      color: hsl(var(--h), var(--s0), var(--l5))
    }
    a:hover {
      color: hsl(var(--h), var(--s1), var(--l3))
    }
  `]
})
export class NavBarComponent {}
