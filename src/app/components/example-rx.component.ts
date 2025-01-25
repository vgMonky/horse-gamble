// src/app/components/example-rx.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

// Import our new service
import { PostsService } from '@app/services/posts.service';

@Component({
  standalone: true,
  selector: 'app-example-rx',
  imports: [CommonModule],
  template: `
    <h2>Example Rx Component</h2>

    <ul>
      <!-- We use the async pipe to auto-subscribe to the posts$ Observable -->
      <li *ngFor="let post of posts$ | async">
        <strong>{{ post.id }}:</strong> {{ post.title }}
      </li>
    </ul>
  `
})
export class ExampleRxComponent {
  // We'll define an Observable to hold API data
  posts$: Observable<any[]>;

  constructor(private postsService: PostsService) {
    // Here we call our service method that returns the transformed data
    this.posts$ = this.postsService.getFilteredPosts();
  }
}
