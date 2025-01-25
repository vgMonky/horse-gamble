// src/app/components/example-rx.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Import our new service
import { PostsService } from '@app/services/posts.service';

@Component({
  standalone: true,
  selector: 'app-example-rx',
  imports: [CommonModule],
  template: `
    <div class="contained">
      <h2>Example Rx Component</h2>

      <!-- Input field to set the maximum number of posts -->
      <label for="maxPosts">Number of Posts to Display:</label>
      <input
        id="maxPosts"
        type="number"
        [value]="initialMaxId"
        (input)="onMaxIdChange($event)"
        min="1"
        max="100"
      />

      <ul>
        <!-- We use the async pipe to auto-subscribe to the posts$ Observable -->
        <li *ngFor="let post of posts$ | async">
          <strong>{{ post.id }}:</strong> {{ post.title }}
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .contained {
      padding: 16px;
    }

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
    }

    input {
      margin-bottom: 16px;
      padding: 4px;
      width: 100px;
    }
  `]
})
export class ExampleRxComponent {
  // Observable to hold API data
  posts$: Observable<any[]>;

  // BehaviorSubject to hold the current maxId value
  private maxIdSubject: BehaviorSubject<number>;

  // Initial value for maxId
  initialMaxId = 10;

  constructor(private postsService: PostsService) {
    // Initialize the BehaviorSubject with the initial maxId value
    this.maxIdSubject = new BehaviorSubject<number>(this.initialMaxId);

    // Set up the posts$ Observable to react to changes in maxId
    this.posts$ = this.maxIdSubject.asObservable().pipe(
      // switchMap cancels previous HTTP requests if a new value comes in
      switchMap(maxId => this.postsService.getFilteredPosts(maxId))
    );
  }

  /**
   * Handler for input changes to maxId.
   * @param event The input event containing the new value.
   */
  onMaxIdChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);

    // Validate the input to be within desired range
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > 100) {
      value = 100;
    }

    // Update the BehaviorSubject with the new maxId value
    this.maxIdSubject.next(value);
  }
}
