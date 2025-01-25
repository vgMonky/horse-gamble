// src/app/services/posts.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // This means Angular will automatically provide it app-wide
})
export class PostsService {
  constructor(private http: HttpClient) {}

  getFilteredPosts(): Observable<any[]> {
    return this.http
      .get<any[]>('https://jsonplaceholder.typicode.com/posts')
      .pipe(
        // Filter out items where 'id >= 10'
        map(posts => posts.filter(post => post.id < 10)),
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
