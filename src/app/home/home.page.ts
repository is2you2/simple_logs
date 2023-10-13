import { Component } from '@angular/core';
import { LangService } from '../lang.service';
import { IndexedDBService } from '../indexed-db.service';
import * as p5 from 'p5';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private indexed: IndexedDBService,
    public lang: LangService,
  ) { }

  /** 모든 정보 모아두기, 달력에 날짜 표기 */
  AllFileList = [{
    date: '2023-10-05',
    textColor: '#800080',
    backgroundColor: '#ffc0cb',
    title: 'testTitle',
    content: 'testContent',
  }];
  /** 최종적으로 보여지는 결과물, 필터가 안된 경우에도 이걸로 보여줌 */
  FilteredList = [];
  /** 보여주는 위치 시작값 */
  startIndex = 0;
  /** 선택된 카드, 새로 생성하거나 없을 때 -1 */
  SelectedIndex = -1;
  /** 보여주는 자료의 Index 배열 (number[]) */
  ListSize = [];
  isCreateNew = false;
  CreateTime = '0000-00-00 00:00:00';
  CardTargetDate = '';
  userInput = {
    title: '',
    content: '',
  }

  async ionViewDidEnter() {
    let list = await this.indexed.GetFileListFromDB('/');
    console.log('일단 보여주기: ', list);
    this.create_p5canvas();
  }

  p5canvas: p5;
  create_p5canvas() {
    this.p5canvas = new p5((p: p5) => {
      p.setup = () => {
        p.noCanvas();
        p.frameRate(5);
      }
      p.draw = () => {
        if (!this.isCreateNew) p.noLoop();
        // 작성 시간 실시간 업데이트
        this.CreateTime = `${p.year()}-${p.nf(p.month(), 2)}-${p.nf(p.day(), 2)}`;
        this.CardTargetDate = this.CreateTime;
        this.CreateTime += ` ${p.nf(p.hour(), 2)}:${p.nf(p.minute(), 2)}:${p.nf(p.second(), 2)}`;
      }
    });
  }

  create_new() {
    this.SelectedIndex = -1;
    this.isCreateNew = true;
    this.userInput.title = '';
    this.userInput.content = '';
    this.CardTargetDate = '';
    if (this.p5canvas) this.p5canvas.loop();
    setTimeout(() => {
      let NewCardTitleElement = document.getElementById('newTitle');
      NewCardTitleElement.focus();
    }, 0);
  }

  SearchKeyword = '';
  /** 검색어로 필터링 */
  filter_with_text() {
    console.log('filter_with_text: ', this.SearchKeyword);
    this.SearchKeyword = '';
  }

  save() {
    console.log('내용 저장하기: ', this.userInput);
  }

  go_to_creator_home() {
    window.open('https://is2you2.github.io/', '_system');
  }
}
