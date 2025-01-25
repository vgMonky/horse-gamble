import { Component } from '@angular/core';
import {ExampleRxComponent} from '../components/example-rx/example-rx.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [ExampleRxComponent],
  template: `
    <h2>Home Page</h2>
    <p>Welcome to the home page!</p>
    <br>
    
    <app-example-rx></app-example-rx>
  `,
  styles: [`

  `]
})
export class HomeComponent {}
