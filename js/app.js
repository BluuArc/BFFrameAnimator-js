'use strict';

import Vue from 'vue';
import FrameMaker from './FrameMaker';

export default class App {
  constructor () {
    this._frameMaker = null;
    this._targetCanvas = null;
    this._frameIndex = 0;
    this._spritesheets = [];
    this._currentAnimation = null;

    this._vueData = {
      isLoading: false,
      animationReady: false,
      unitId: '',
      activeServer: 'gl',
      doTrim: false,
      formMessage: 'Input your options above then press "Generate" to start generating an animation.',
      errorOccurred: false,
      activeAnimation: '',
      animationNames: [],
      isPlaying: false,
      numFrames: 0,
    };
    this._vueApp = new Vue({
      el: '#app',
      data: this._vueData,
      watch: {
        activeAnimation: (newValue) => {
          this._currentAnimation = newValue;
          this._vueData.numFrames = this._frameMaker.getNumberOfFramesForAnimation(newValue);
          if (newValue) {
            this.renderFrame(0);
          }
        },
      },
      methods: {
        generateAnimation: () => this.generateAnimation(),
        getFrameIndex: () => this._frameIndex,
        renderFrame: (...args) => this.renderFrame(...args),
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

  _setLog (message = '', isLoading) {
    // eslint-disable-next-line no-console
    console.debug('[LOG]', message);
    this._vueData.formMessage = message;
    if (isLoading !== undefined) {
      this._vueData.isLoading = !!isLoading;
    }
  }

  async generateAnimation () {
    if (this._vueData.isLoading) {
      return;
    }
    console.debug(this._vueData);
    if (!this._formIsValid) {
      this._vueData.errorOccurred = true;
      this._vueData.formMessage = '<b>ERROR:</b> Form input isn\'t valid. Please try again.';
      return;
    }

    this._vueData.animationReady = false;
    this._vueData.errorOccurred = false;
    this._vueData.activeAnimation = '';
    this._frameIndex = 0;
    this._setLog('Loading spritesheets and CSVs...', true);
    await this._vueApp.$nextTick();
    // load animation data
    try {
      const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(this._vueData.unitId, this._vueData.activeServer, this._vueData.doTrim);
      this._frameMaker = maker;
      this._spritesheets = [spritesheet];
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this._vueData.errorOccurred = true;
      this._setLog(`Error getting animation data for ${this._vueData.unitId}`, false);
      return;
    }

    // generate the animations
    const animationNames = this._frameMaker.loadedAnimations;
    console.debug(animationNames);
    this._vueApp.animationNames = animationNames;
    try {
      for (const name of animationNames) {
        const animation = this._frameMaker.getAnimation(name);
        const numFrames = animation.frames.length;
        for (let i = 0; i < numFrames; ++i) {
          this._setLog(`Generating frames for ${name} [${(i+1).toString().padStart(numFrames.toString().length, '0')}/${numFrames}]...`);
          // await this._waitForIdleFrame();
          await this._frameMaker.getFrame({
            spritesheets: this._spritesheets,
            animationName: name,
            animationIndex: i,
            drawFrameBounds: false, // set true for debugging
          });
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this._vueData.errorOccurred = true;
      this._setLog(`Error getting animation data for ${this._vueData.unitId}`, false);
      return;
    }

    // notify that animations are finished
    this._vueData.animationReady = true;
    this._vueData.activeAnimation = animationNames[0];
    this._setLog(`Successfully generated animation for ${this._vueData.unitId}`, false);
  }

  async renderFrame (index, options = {}) {
    const animation = this._frameMaker.getAnimation(this._currentAnimation);
    let frameToRender = !isNaN(index) ? +index : this._frameIndex;
    if (frameToRender < 0) {
      frameToRender += animation.frames.length;
    } else if (frameToRender >= animation.frames.length) {
      frameToRender -= animation.frames.length;
    }
    console.debug(frameToRender, this._frameIndex);
    const isValidIndex = frameToRender < animation.frames.length && frameToRender >= 0;

    const frame = await this._frameMaker.getFrame({
      spritesheets: this._spritesheets,
      animationName: this._currentAnimation,
      animationIndex: isValidIndex ? frameToRender : 0,
      ...options,
    });
    console.debug(index, animation, frame);
    if (this._targetCanvas.width !== frame.width) {
      this._targetCanvas.width = frame.width;
    }
    if (this._targetCanvas.height !== frame.height) {
      this._targetCanvas.height = frame.height;
    }
    const context = this._targetCanvas.getContext('2d');
    context.clearRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);
    context.drawImage(frame, 0, 0);

    // mark center of canvas
    // context.save();
    // context.fillStyle = 'red';
    // context.beginPath();
    // context.ellipse(this._targetCanvas.width / 2, this._targetCanvas.height / 2, 3, 3, Math.PI / 2, 0, Math.PI * 2);
    // context.fill();
    // context.restore();
  
    this._frameIndex = (frameToRender + 1 < animation.frames.length && frameToRender >= 0) ? frameToRender + 1 : 0;
  }

  get frameMaker () {
    return this._frameMaker;
  }
}
