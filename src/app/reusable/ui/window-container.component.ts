// src/app/reusable/ui/window-container.component.ts

import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-window-container',
  imports: [CommonModule],
  template: `
    <div class="overlay" (click)="onOverlayClick()">
      <div class="window" (click)="$event.stopPropagation()" tabindex="0">
        <button class="close-button" (click)="onCloseClick()" aria-label="Close window">&times;</button>
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      animation: fadeIn 0.3s ease;
    }

    .window {
      position: relative; /* To position the close button */
      background-color: var(--c0);
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      min-width: 200px;
      max-width: 90%;
      animation: slideDown 0.3s ease;
      outline: none; /* Remove default focus outline */
    }

    .close-button {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      background: transparent;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--c4);
      transition: color 0.2s ease;
    }

    .close-button:hover {
      color: var(--c5);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideDown {
      from { transform: translateY(-20px); }
      to { transform: translateY(0); }
    }

    /* Optional: Prevent body scroll when overlay is active */
    body.no-scroll {
      overflow: hidden;
    }
  `]
})
export class WindowContainerComponent {
  @Output() close = new EventEmitter<void>();

  /**
   * Emit the close event when the overlay is clicked.
   */
  onOverlayClick() {
    this.close.emit();
  }

  /**
   * Emit the close event when the close button is clicked.
   */
  onCloseClick() {
    this.close.emit();
  }
}
