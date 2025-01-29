// src/app/core/components/nav-bar.component.ts

import { Component, Renderer2, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WindowContainerComponent } from '@app/reusable/ui/window-container.component';
import { DOCUMENT } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterModule, WindowContainerComponent],
  template: `
    <nav>
      <!-- Left side: DEX logo + Hamburger Icon (visible on small screens) -->
      <div class="nav-left">
        <a 
          routerLink="/" 
          routerLinkActive="active-link" 
          [routerLinkActiveOptions]="{ exact: true }"
        >
          | DEX |
        </a>
        <a 
          class="hamburger" 
          (click)="toggleMenu()" 
          aria-label="Toggle navigation menu" 
          [attr.aria-expanded]="isMenuOpen"
          [attr.aria-controls]="menuId"
        >
          &#9776;
        </a>

        <!-- Center: Nav links (visible on large screens) -->
        <div class="nav-center">
          <a routerLink="/trade" routerLinkActive="active-link">Trade</a>
          <a routerLink="/explore" routerLinkActive="active-link">Explore</a>
          <a routerLink="/pool" routerLinkActive="active-link">Pool</a>
        </div>
      </div>

      <!-- Right side: always visible -->
      <div class="nav-right">
        <a class="setting-icon"> &#9881; </a>
        <a class="btn">My Wallet</a>
      </div>
    </nav>

    <!-- Window Container for Navigation Links (visible on small screens when hamburger is clicked) -->
    <app-window-container *ngIf="isMenuOpen" (close)="closeMenu()">
      <div class="menu-links">
        <a routerLink="/trade" routerLinkActive="active-link" (click)="closeMenu()">Trade</a>
        <a routerLink="/explore" routerLinkActive="active-link" (click)="closeMenu()">Explore</a>
        <a routerLink="/pool" routerLinkActive="active-link" (click)="closeMenu()">Pool</a>
      </div>
    </app-window-container>
  `,
  styles: [`
    nav {
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--c0);
      position: relative; /* for absolutely-positioned nav links */
    }

    /* Left side: Logo + Hamburger in a row */
    .nav-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Center: Nav links for large screens */
    .nav-center {
      display: flex;
      gap: 1rem;
    }

    /* Right side: "..." and "My Wallet" */
    .nav-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    /* Hamburger icon for smaller screens */
    .hamburger {
      display: none;    /* hidden by default, shown in mobile */
      font-size: 1.3rem;
      cursor: pointer;
    }
    .setting-icon{
      font-size: 1.5rem;
      cursor: pointer;
    }

    /* Active link style */
    .active-link {
      color: var(--c5);
    }

    /* Menu Links Inside Window Container */
    .menu-links {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    /* -------- Responsive Rules -------- */
    @media (max-width: 600px) {
      /* Hide center nav links on small screens */
      .nav-center {
        display: none;
      }

      /* Show hamburger on small screens */
      .hamburger {
        display: block;
      }

      /* Optionally, adjust nav padding */
      nav {
        padding: 0.5rem 1rem;
      }
    }
  `]
})
export class NavBarComponent {
  isMenuOpen = false;
  menuId = 'mobile-menu';

  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  /**
   * Toggles the menu open/closed state.
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.isMenuOpen) {
      this.renderer.addClass(this.document.body, 'no-scroll');
    } else {
      this.renderer.removeClass(this.document.body, 'no-scroll');
    }
  }

  /**
   * Closes the menu and removes the no-scroll class from body.
   */
  closeMenu() {
    this.isMenuOpen = false;
    this.renderer.removeClass(this.document.body, 'no-scroll');
  }
}
