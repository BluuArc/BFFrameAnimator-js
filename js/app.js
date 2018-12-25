'use strict';

import FrameMaker from './FrameMaker';

export default class App {
  constructor () {
    this._frameMaker = null;
    this._targetCanvas = null;
    this._frameIndex = -1;
    this._currentAnimation = null;
  }

  static get SAMPLE_URLS () {
    const baseUrl = 'http://static-bravefrontier.gumi-europe.net/content/';
    const filepaths = {
      cgg: 'unit/cgg/',
      cgs: 'unit/cgs/',
      anime: 'unit/img/'
    };
    return {
      anime: `/getImage/${encodeURIComponent(baseUrl + filepaths.anime + 'unit_anime_750216.png')}`,
      cgg: `/get/${encodeURIComponent(baseUrl + filepaths.cgg + 'unit_cgg_750216.csv')}`,
      cgs: `/get/${encodeURIComponent(baseUrl + filepaths.cgs + 'unit_skill_cgs_750216.csv')}`,
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
    await this._frameMaker.addAnimation('skill', cgsData);

    const targetCanvas = document.querySelector('canvas#target');
    targetCanvas.width = 2000;
    targetCanvas.height = 2000;
    this._targetCanvas = targetCanvas;

    const spritesheet = document.querySelector('img.spritesheet');
    await new Promise((fulfill, reject) => {
      spritesheet.onload = fulfill;
      spritesheet.onerror = reject;

      spritesheet.src = App.SAMPLE_URLS.anime;
    });

    this._currentAnimation = 'skill';
  }

  renderFrame (index) {
    const frameToRender = !isNaN(index) ? +index : this._frameIndex;
    const animation = this._frameMaker.getAnimation(this._currentAnimation);
    const isValidIndex = frameToRender < animation.frames.length && frameToRender >= 0;

    const context = this._targetCanvas.getContext('2d');
    context.clearRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);
    this._frameMaker.drawFrame({
      spritesheets: [document.querySelector('img.spritesheet')],
      animationName: this._currentAnimation,
      animationIndex: isValidIndex ? frameToRender : 0,
      targetCanvas: this._targetCanvas,
    });

    // mark center of canvas
    context.save();
    context.fillStyle = 'red';
    context.beginPath();
    context.ellipse(this._targetCanvas.width / 2, this._targetCanvas.height / 2, 3, 3, Math.PI / 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
  
    this._frameIndex = isValidIndex ? frameToRender + 1 : 0;
  }

  get frameMaker () {
    return this._frameMaker;
  }
}
