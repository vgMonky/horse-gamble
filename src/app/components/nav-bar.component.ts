import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterModule],
  // Inline template
  template: `
    <nav>
      <div>
        <a routerLink="/">| DEX |</a>
        <a routerLink="/trade">Trade</a>
        <a routerLink="/explore">Explore</a>
        <a routerLink="/pool">Pool</a>
      </div>

      <div>
        <a> ... </a>
        <a> My Wallet </a>
      </div>
    </nav>
  `,
  // Inline styles
  styles: [`
    nav {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
    }
    a {
      text-decoration: none;
      font-weight: bold;
      margin: 10px;
      color: hsl(var(--h), var(--s0), var(--l5))
    }
    a:hover {
      color: hsl(var(--h), var(--s1), var(--l3))
    }
  `]
})
export class NavBarComponent {}
