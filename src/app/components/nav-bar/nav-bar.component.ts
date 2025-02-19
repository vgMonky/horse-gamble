import { Component, Renderer2, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WindowContainerComponent } from '@app/components/base-components/window-container/window-container.component';
import { UserPreferencesComponent } from '@app/components/user-preferences/user-preferences.component';
import { DOCUMENT } from '@angular/common';
import { LoginComponent } from '@app/components/login/login.component';


@Component({
    standalone: true,
    selector: 'app-nav-bar',
imports: [
    CommonModule,
    RouterModule,
    UserPreferencesComponent,
    LoginComponent,
    WindowContainerComponent,
],
    templateUrl: './nav-bar.component.html',
    styleUrls: ['./nav-bar.component.scss']
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

}
