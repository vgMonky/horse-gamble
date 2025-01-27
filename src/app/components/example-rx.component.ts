// src/app/components/example-rx.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map } from 'rxjs/operators';

// Import our PostsService
import { PostsService } from '@app/services/posts.service';

@Component({
  standalone: true,
  selector: 'app-example-rx',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="contained">
      <h2>Example Rx Component with Reactive Forms</h2>

      <!-- Input field bound to FormControl -->
      <label for="maxPosts">Number of Posts to Display:</label>
      <input
        id="maxPosts"
        type="number"
        [formControl]="maxIdControl"
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
export class ExampleRxComponent implements OnInit {
  // Initialize posts$ with an empty array Observable
  posts$: Observable<any[]> = of([]);

  maxIdControl: FormControl;
  initialMaxId = 10;

  constructor(private postsService: PostsService) {
    this.maxIdControl = new FormControl(this.initialMaxId);
  }

  ngOnInit(): void {
    this.posts$ = this.maxIdControl.valueChanges.pipe(
      startWith(this.maxIdControl.value), // Emit the initial value
      debounceTime(300),                   // Wait for 300ms pause in events
      distinctUntilChanged(),              // Only emit if value has changed
      switchMap((maxId: number) => {
        const validatedMaxId = this.validateMaxId(maxId);
        return this.postsService.getFilteredPosts(validatedMaxId);
      })
    );
  }

  /**
   * Validates the maxId input.
   * Ensures the value is between 1 and 100.
   * @param maxId The input value to validate.
   * @returns A valid maxId within the range [1, 100].
   */
  private validateMaxId(maxId: number): number {
    let value = Number(maxId);
    if (isNaN(value) || value < 1) {
      value = 1;
    } else if (value > 100) {
      value = 100;
    }
    return value;
  }
}
