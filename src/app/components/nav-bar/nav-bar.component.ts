import { Component, Renderer2, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WindowContainerComponent } from '@app/components/window-container/window-container.component';
import { UserPreferencesComponent } from '../user-preferences/user-preferences.component';
import { DOCUMENT } from '@angular/common';
import { WalletConnectComponent } from '@app/components/wallet-connect/wallet-connect.component';


@Component({
    standalone: true,
    selector: 'app-nav-bar',
imports: [
    CommonModule,
    RouterModule,
    UserPreferencesComponent,
    WalletConnectComponent,
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

    toggleSearch() {this.isSearchOpen = !this.isSearchOpen;}
    closeSearch() {this.isSearchOpen = false;}
}
