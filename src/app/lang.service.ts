import { Injectable } from '@angular/core';
import * as p5 from 'p5';

@Injectable({
  providedIn: 'root'
})
export class LangService {

  lang = 'ko';
  /** 언어팩  
   * text[key] = lang_value;
   */
  text = {};

  constructor() {
    this.lang = navigator.languages[0].split('-')[0];
  }

  initialize() {
    new p5((p: p5) => {
      p.setup = () => {
        p.noCanvas();
        p.loadTable('assets/translate.csv', 'csv', 'header', v => {
          if (!v.columns.includes(this.lang))
            this.lang = 'en';
          for (let i = 0, j = v.rows.length; i < j; i++)
            this.text[v.rows[i].obj['#']] = v.rows[i].obj[this.lang];
        });
      }
    });
  }

}
