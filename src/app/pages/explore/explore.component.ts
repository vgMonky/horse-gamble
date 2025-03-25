import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-explore',
    imports: [],
    template: `
        <div class="p-explore">
            <div class="p-explore__title">Explore Page</div>
            <p class="p-explore__subtitle">Discover new content here!</p>
        </div>
    `,
    styleUrls: ['./explore.component.scss']
})
export class ExploreComponent {}
