import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-explore',
  template: `
    <h2>Explore Page</h2>
    <p>Discover new content here!</p>
  `,
  styles: [`
    h2 {
      color: #272;
    }
  `]
})
export class ExploreComponent {}
