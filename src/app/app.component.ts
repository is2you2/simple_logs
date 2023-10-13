import { Component } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    indexed: IndexedDBService,
  ) {
    indexed.initialize();
  }
}
