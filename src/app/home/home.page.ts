import { Component } from '@angular/core';
import { LangService } from '../lang.service';
import { IndexedDBService } from '../indexed-db.service';
import * as p5 from 'p5';
import { AlertController, Platform } from '@ionic/angular';

interface ContentForm {
  blob?: Blob;
  url?: any;
  date: string;
  timestamp: string;
  textColor?: string;
  backgroundColor?: string;
  title: string;
  content?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    private indexed: IndexedDBService,
    public lang: LangService,
    private platform: Platform,
    private alertCtrl: AlertController,
  ) { }

  /** 모든 정보 모아두기, 달력에 날짜 표기 */
  AllFileList: ContentForm[] = [];
  /** 최종적으로 보여지는 결과물, 필터가 안된 경우에도 이걸로 보여줌 */
  FilteredList: ContentForm[] = [];
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
    url: undefined,
    blob: undefined as Blob,
  }

  isMobile = true;

  async ionViewDidEnter() {
    this.isMobile = this.platform.is('android') || this.platform.is('ios');

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
        if (!this.CardTargetDate) this.CardTargetDate = this.CreateTime;
        this.CreateTime += ` ${p.nf(p.hour(), 2)}:${p.nf(p.minute(), 2)}:${p.nf(p.second(), 2)}`;
      }
    });
  }

  create_new() {
    this.SelectedIndex = -1;
    this.isCreateNew = true;
    this.userInput.title = '';
    this.userInput.content = '';
    this.userInput.url = undefined;
    this.userInput.blob = undefined;
    this.CardTargetDate = '';
    if (this.p5canvas) this.p5canvas.loop();
    setTimeout(() => {
      let NewCardTitleElement = document.getElementById('newTitle');
      NewCardTitleElement.focus();
    }, 0);
  }

  ActiveInputSelector() {
    let ele = document.getElementById('imageInput');
    ele.click();
  }
  inputImageSelected(ev: any) {
    if (ev.target.files.length) {
      let blob = new Blob([ev.target.files[0]]);
      this.userInput.blob = blob;
      let _url = URL.createObjectURL(blob);
      this.userInput.url = _url;
      setTimeout(() => {
        URL.revokeObjectURL(_url);
      }, 0);
    } else {
      this.userInput.url = undefined;
      this.userInput.blob = undefined;
    }
  }

  SearchKeyword = '';
  /** 검색어로 필터링 */
  filter_with_text() {
    console.log('filter_with_text: ', this.SearchKeyword);
    this.SearchKeyword = '';
  }

  async save() {
    if (!this.userInput.title) {
      let alert = await this.alertCtrl.create({
        header: this.lang.text['NoTitle'],
        message: this.lang.text['InputTitle'],
        buttons: [this.lang.text['OK']],
      });
      alert.present();
      return;
    }
    this.isCreateNew = false;
    let data = {
      date: this.CardTargetDate,
      title: this.userInput.title,
      content: this.userInput.content,
      timestamp: this.CreateTime,
    }
    this.AllFileList.unshift(data);
    this.FilteredList.unshift(data);
    this.ListSize.push(this.ListSize.length);
  }

  async remove(i: number) {
    this.AllFileList.splice(i, 1);
    this.FilteredList.splice(i, 1);
    this.ListSize.pop();
  }

  go_to_creator_home() {
    window.open('https://is2you2.github.io/', '_system');
  }

  go_to_playstore_page() {
    window.open('about:blank', '_system');
  }
}
