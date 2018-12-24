'use strict';

import FrameMaker from './FrameMaker';

export default class App {
  constructor () {
    this._frameMaker = null;
  }

  static get SAMPLE_URLS () {
    const baseUrl = 'http://static-bravefrontier.gumi-europe.net/content/';
    const filepaths = {
      cgg: 'unit/cgg/',
      cgs: 'unit/cgs/',
      anime: 'unit/img/'
    };
    return {
      anime: `/getImage/${encodeURIComponent(baseUrl + filepaths.anime + 'unit_anime_720216.png')}`,
      cgg: `/get/${encodeURIComponent(baseUrl + filepaths.cgg + 'unit_cgg_720216.csv')}`,
      cgs: `/get/${encodeURIComponent(baseUrl + filepaths.cgs + 'unit_atk_cgs_720216.csv')}`,
    };
  }

  _loadCsv (path) {
    return fetch(path).then(r => r.text())
      .then(r => r.split('\n').map(line => line.split(',')));
  }

  async init () {
    const cggData = await this._loadCsv(App.SAMPLE_URLS.cgg);
    this._frameMaker = new FrameMaker(cggData);

    const cgsData = await this._loadCsv(App.SAMPLE_URLS.cgs);
    await this._frameMaker.addAnimation('idle', cgsData);

    const targetCanvas = document.querySelector('canvas#target');
    targetCanvas.width = 500;
    targetCanvas.height = 500;

    const spritesheet = document.querySelector('img.spritesheet');
    await new Promise((fulfill, reject) => {
      spritesheet.onload = fulfill;
      spritesheet.onerror = reject;

      spritesheet.src = App.SAMPLE_URLS.anime;
    });
  }

  get frameMaker () {
    return this._frameMaker;
  }
}
