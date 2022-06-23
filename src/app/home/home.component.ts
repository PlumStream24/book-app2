import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { BooksService } from '../books/books.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private subscription: Subscription;

  displayedColumns: string[] = ['title', 'author', 'publication', 'details'];
  books = new MatTableDataSource<any>();

  constructor(private route: ActivatedRoute,
              private router: Router,
              private bookService: BooksService) { }

  ngOnInit() {
    this.subscription = this.route.queryParams.subscribe(params => {
      this.searchAuthor('George R R Martin');
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  async searchAuthor(query: string) {
    const results = await this.bookService.searchAuthor(query);

    this.books.data = results.docs.slice(0,5);
  }

  viewDetails(book) {
    console.log(book);
    this.router.navigate(['details'], { queryParams: {
      title: book.title,
      authors: book.author_name && book.author_name.join(', '),
      year: book.first_publish_year,
      cover_id: book.cover_edition_key
    }});
  }
}
