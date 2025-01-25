import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  selector: 'app-example-rx',
  templateUrl: './example-rx.component.html',
})
export class ExampleRxComponent {
  // We'll define an Observable to hold API data
  posts$: Observable<any[]>;

  constructor(private http: HttpClient) {
    this.posts$ = this.http
      .get<any[]>('https://jsonplaceholder.typicode.com/posts')
      .pipe(
        // filter out items not matching our condition
        map(posts => posts.filter(post => post.id < 10)),
        // transform the titles to uppercase
        map(posts => 
          posts.map(post => ({
            ...post,
            title: post.title.toUpperCase()
          }))
        )
      );
  }
}
