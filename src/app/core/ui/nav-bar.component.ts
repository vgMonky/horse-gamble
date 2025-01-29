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
        <a routerLink="/" 
          routerLinkActive="active-link" 
          [routerLinkActiveOptions]="{ exact: true }">
          | DEX |
        </a>
        <a routerLink="/trade" routerLinkActive="active-link">Trade</a>
        <a routerLink="/explore" routerLinkActive="active-link">Explore</a>
        <a routerLink="/pool" routerLinkActive="active-link">Pool</a>
      </div>

      <div>
        <a> ... </a>
        <a class="btn">My Wallet</a>
      </div>
    </nav>
  `,
  // Inline styles
  styles: [`
    nav {
      padding: 2rem 1rem;
      display: flex;
      justify-content: space-between;
      background-color: var(--c0);
    }

    .active-link {
      color: var(--c5);
  }
  `]
})
export class NavBarComponent {}
