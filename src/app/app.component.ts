import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { SideContainerComponent } from '@app/components/base-components/side-container/side-container.component';


@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        NavBarComponent,
        SideContainerComponent
    ],
    template: `
        <app-nav-bar></app-nav-bar>
        <app-side-container id="mobile-side-menu" side="right">
            <h2>Side Menu</h2>
            <p>Navigation links or other content can go here.</p>
        </app-side-container>
        <div class="view">
            <router-outlet></router-outlet>
        </div>
    `,
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'my-angular-app';
}
