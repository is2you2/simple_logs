import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LangService {

  lang = 'ko';

  constructor() {
    this.lang = navigator.languages[0].split('-')[0];
  }

}
