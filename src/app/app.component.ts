import { Component } from '@angular/core';
import { IndexedDBService } from './indexed-db.service';
import { LangService } from './lang.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    indexed: IndexedDBService,
    lang: LangService,
  ) {
    lang.initialize();
    indexed.initialize();
  }
}
