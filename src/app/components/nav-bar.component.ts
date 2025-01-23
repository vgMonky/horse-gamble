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
        <a class="btn"> My Wallet </a>
      </div>
    </nav>
  `,
  // Inline styles
  styles: [`
    nav {
      padding: 2rem;
      display: flex;
      justify-content: space-between;
    }
    a {
      text-decoration: none;
      margin: 10px;
      color: hsl(var(--h), var(--s0), var(--l4))
    }
    a:hover {
      color: hsl(var(--h), var(--s0), var(--l6))
    }
    .btn{
      font-size: 10pt;
      padding: 10px 20px;
      border: 1px solid hsl(var(--h), var(--s5), var(--l2));
      border-radius: 20px;
      transition: 0.6s;
    }
    .btn:hover{
      background-color: hsl(var(--h), var(--s4), var(--l2));
    }
  `]
})
export class NavBarComponent {}
