import { Component, Renderer2, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WindowContainerComponent } from '@app/reusable/ui/window-container.component';
import { UserPreferencesComponent } from './user-preferences.component';
import { DOCUMENT } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-nav-bar',
  imports: [CommonModule, RouterModule, WindowContainerComponent, UserPreferencesComponent],
  template: `
    <nav>
      <!-- Left side: DEX logo + Hamburger Icon (visible on small screens) -->
      <div class="nav-left">
        <a 
          routerLink="/" 
          routerLinkActive="active-link" 
          [routerLinkActiveOptions]="{ exact: true }"
        >
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradientStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="var(--c3)" />
              <stop offset="100%" stop-color="var(--cc3)" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="40" stroke="url(#gradientStroke)" stroke-width="12" fill="none" />
        </svg>

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
        <a class="setting-icon" (click)="toggleSettings()"> &#9881; </a>
        <a class="search-icon" (click)="toggleSearch()"> &#9906; </a>
        <a class="btn" (click)="toggleWallet()">Wallet</a>
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

    <!-- Window Container for Settings -->
    <app-window-container *ngIf="isSettingsOpen" (close)="closeSettings()">
      <app-user-preferences></app-user-preferences>
    </app-window-container>

    <!-- Window Container for Search -->
    <app-window-container *ngIf="isSearchOpen" (close)="closeSearch()">
      <p>Search component here</p>
    </app-window-container>

    <!-- Window Container for My Wallet -->
    <app-window-container *ngIf="isWalletOpen" (close)="closeWallet()">
      <p>My Wallet content here</p>
    </app-window-container>
  `,
  styles: [
    `nav {
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
      gap: 0.3rem;
    }

    /* Center: Nav links for large screens */
    .nav-center {
      display: flex;
      gap: 1rem;
    }

    /* Right side: */
    .nav-right {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    /* Hamburger icon for smaller screens */
    .hamburger {
      display: none;    /* hidden by default, shown in mobile */
      font-size: 1.3rem;
      cursor: pointer;
    }
    .setting-icon, .search-icon {
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
  isSettingsOpen = false;
  isWalletOpen = false;
  isSearchOpen = false;
  menuId = 'mobile-menu';

  constructor(private renderer: Renderer2, @Inject(DOCUMENT) private document: Document) {}

  toggleMenu() {this.isMenuOpen = !this.isMenuOpen;}
  closeMenu() {this.isMenuOpen = false;}

  toggleSettings() {this.isSettingsOpen = !this.isSettingsOpen;}
  closeSettings() {this.isSettingsOpen = false;}

  toggleWallet() {this.isWalletOpen = !this.isWalletOpen;}
  closeWallet() {this.isWalletOpen = false;}

  toggleSearch() {this.isSearchOpen = !this.isSearchOpen;}
  closeSearch() {this.isSearchOpen = false;}
}
