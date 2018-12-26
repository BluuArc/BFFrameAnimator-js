'use strict';

import FrameMaker from './FrameMaker';

export default class App {
  constructor () {
    this._frameMaker = null;
    this._targetCanvas = null;
    this._frameIndex = -1;
    this._spritesheets = [];
    this._currentAnimation = null;
  }

  async init () {
    const targetCanvas = document.querySelector('canvas#target');
    targetCanvas.width = 2000;
    targetCanvas.height = 2000;
    this._targetCanvas = targetCanvas;

    const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(850438, 'gl');
    this._frameMaker = maker;
    this._spritesheets = [spritesheet];

    this._currentAnimation = 'move';
  }

  renderFrame (index, options = {}) {
    const frameToRender = !isNaN(index) ? +index : this._frameIndex;
    const animation = this._frameMaker.getAnimation(this._currentAnimation);
    const isValidIndex = frameToRender < animation.frames.length && frameToRender >= 0;

    const context = this._targetCanvas.getContext('2d');
    context.clearRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);
    this._frameMaker.drawFrame({
      spritesheets: this._spritesheets,
      animationName: this._currentAnimation,
      animationIndex: isValidIndex ? frameToRender : 0,
      targetCanvas: this._targetCanvas,
      ...options,
    });

    // mark center of canvas
    context.save();
    context.fillStyle = 'red';
    context.beginPath();
    context.ellipse(this._targetCanvas.width / 2, this._targetCanvas.height / 2, 3, 3, Math.PI / 2, 0, Math.PI * 2);
    context.fill();
    context.restore();
  
    this._frameIndex = (frameToRender + 1 < animation.frames.length && frameToRender >= 0) ? frameToRender + 1 : 0;
  }

  get frameMaker () {
    return this._frameMaker;
  }
}
