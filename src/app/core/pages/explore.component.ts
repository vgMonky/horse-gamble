import { Component } from '@angular/core';
import {ExampleRxComponent} from '@app/core/ui/example-rx.component';

@Component({
  standalone: true,
  selector: 'app-explore',
  imports: [ExampleRxComponent],
  template: `
      <h2>Explore Page</h2>
      <p>Discover new content here!</p>
      <br>
      <app-example-rx></app-example-rx>
  `,
  styles: [`

  `]
})
export class ExploreComponent {}
