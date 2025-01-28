// src/app/services/posts.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // This means Angular will automatically provide it app-wide
})
export class PostsService {
  private readonly apiUrl = 'https://jsonplaceholder.typicode.com/posts';

  constructor(private http: HttpClient) {}

  /**
   * Fetches posts and applies filtering and transformation.
   * @param maxId The maximum ID of posts to retrieve.
   * @returns An Observable emitting the filtered and transformed posts.
   */
  getFilteredPosts(maxId: number): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      // Filter out posts where 'id' is greater than or equal to maxId
      map(posts => posts.filter(post => post.id < maxId)),
      // Transform the titles to uppercase
      map(posts =>
        posts.map(post => ({
          ...post,
          title: post.title.toUpperCase()
        }))
      )
    );
  }
}
