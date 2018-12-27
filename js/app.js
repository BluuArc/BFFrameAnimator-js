'use strict';

import Vue from 'vue';
import FrameMaker from './FrameMaker';

export default class App {
  constructor () {
    this._frameMaker = null;
    this._targetCanvas = null;
    this._frameIndex = -1;
    this._spritesheets = [];
    this._currentAnimation = null;

    this._vueData = {
      isLoading: false,
      animationReady: false,
      unitId: '',
      activeServer: 'gl',
      doTrim: false,
      formMessage: 'Input your options above then press "Generate" to start generating an animation.',
    };
    this._vueApp = new Vue({
      el: '#app',
      data: this._vueData,
      methods: {
        generateAnimation: () => this.generateAnimation(),
      },
    });

    this._targetCanvas = document.querySelector('canvas#target');
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

  get _formIsValid () {
    return this._vueData.unitId.length > 0 && !isNaN(this._vueData.unitId) && ['gl', 'eu', 'jp'].includes(this._vueData.activeServer);
  }

  async generateAnimation () {
    console.debug(this._vueData);
    if (!this._formIsValid) {
      this._vueData.formMessage = '<b>ERROR:</b> Form input isn\'t valid. Please try again.';
      return;
    }

    this._vueData.animationReady = false;
    this._vueData.isLoading = true;
    this._vueData.formMessage = 'Loading spritesheets and CSVs...';
    await this._vueApp.$nextTick();
    // load animation data
    try {
      const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(this._vueData.unitId, this._vueData.activeServer, this._vueData.doTrim);
      this._frameMaker = maker;
      this._spritesheets = [spritesheet];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this._vueData.isLoading = false;
      this._vueData.formMessage = `Error getting animation data for ${this._vueData.unitId}`;
      return;
    }

    // generate the animations
    // this._vueData.formMessage = 'Loading spritesheets and CSVs...';
    // await this._vueApp.$nextTick();

    // notify that animations are finished
    this._vueData.animationReady = true;
    this._vueData.isLoading = false;
    this._vueData.formMessage = `Generated animation for ${this._vueData.unitId}`;
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
