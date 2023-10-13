import { Component } from '@angular/core';
import { LangService } from '../lang.service';
import { IndexedDBService } from '../indexed-db.service';
import * as p5 from 'p5';
import { AlertController, LoadingController, Platform } from '@ionic/angular';

interface ContentForm {
  blob?: Blob;
  url?: any;
  date: string;
  timestamp: string;
  textColor?: string;
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
    private loadingCtrl: LoadingController,
  ) { }

  /** 모든 정보 모아두기, 달력에 날짜 표기 */
  AllFileList: ContentForm[] = [];
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
    for (let i = 0, j = list.length; i < j; i++) {
      let log_data: any = {};
      let file_ext = list[i].split('.').pop();
      switch (file_ext) {
        case 'log':
          let raw_data = await this.indexed.loadTextFromUserPath(list[i]);
          log_data = { ...JSON.parse(raw_data) };
          this.AllFileList.push(log_data);
          break;
        case 'logattach':
          let blob = await this.indexed.loadBlobFromUserPath(list[i], '');
          let FileURL = URL.createObjectURL(blob);
          this.AllFileList[this.AllFileList.length - 1].url = FileURL;
          break;
      }
    }
    this.SortAllListByDate();
    this.CalcListSize();
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
    if (this.isCreateNew) {
      this.isCreateNew = false;
      return;
    }
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
    let data: ContentForm = {
      date: this.CardTargetDate,
      title: this.userInput.title,
      content: this.userInput.content,
      timestamp: this.CreateTime,
    }
    let date = data.date.split('-');
    await this.indexed.saveTextFileToUserPath(JSON.stringify(data), `${date[0]}/${date[1]}/${date[2]}/${data.timestamp}.log`);
    if (this.userInput.blob) { // 파일이 있으면 파일도 저장
      let loading = await this.loadingCtrl.create({ message: '저장중입니다' });
      loading.present();
      await this.indexed.saveBlobToUserPath(this.userInput.blob, `${date[0]}/${date[1]}/${date[2]}/${data.timestamp}.logattach`);
      let FileURL = URL.createObjectURL(this.userInput.blob);
      data.url = FileURL;
      loading.dismiss();
    }
    data['textColor'] = '#ff754e';
    this.AllFileList.unshift(data);
    this.SortAllListByDate();
    this.CalcListSize();
    this.SelectedIndex = -1;
  }

  SortAllListByDate() {
    this.AllFileList.sort((a, b) => {
      if (a.date > b.date)
        return -1;
      if (a.date < b.date)
        return 1;
      return 0;
    });
  }

  /** 필터링 갯수 제한 */
  FILTERED_LIMIT = 5;
  /** 보여주는 리스트 IndexArray 관리 */
  CalcListSize() {
    let LimitSize = Math.min(this.FILTERED_LIMIT, this.AllFileList.length);
    this.ListSize = Array.from({ length: LimitSize }, (_, i) => i + this.startIndex)
  }

  async remove(i: number) {
    let date = this.AllFileList[i].date.split('-');
    await this.indexed.removeFileFromUserPath(`${date[0]}/${date[1]}/${date[2]}/${this.AllFileList[i].timestamp}.log`);
    if (this.AllFileList[i].url) {
      let loading = await this.loadingCtrl.create({ message: '삭제중입니다' });
      loading.present();
      await this.indexed.removeFileFromUserPath(`${date[0]}/${date[1]}/${date[2]}/${this.AllFileList[i].timestamp}.logattach`);
      URL.revokeObjectURL(this.AllFileList[i].url);
      loading.dismiss();
    }
    this.AllFileList.splice(i, 1);
    this.CalcListSize();
  }

  go_to_creator_home() {
    window.open('https://is2you2.github.io/', '_system');
  }

  go_to_playstore_page() {
    window.open('https://play.google.com/store/apps/details?id=org.pjcone.simplelogs', '_system');
  }
}
