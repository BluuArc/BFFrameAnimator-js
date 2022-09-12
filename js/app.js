'use strict';

/* global GIF */

import Vue from 'vue';
import FrameMaker from './FrameMaker';
import waitForIdleFrame from './waitForIdleFrame';

window.FrameMaker = FrameMaker; // for desktop script

export default class App {
  constructor () {
    this._frameMaker = null;

    /**
     * @type {HTMLCanvasElement}
     */
    this._targetCanvas = null;

    this._spritesheets = [];
    this._currentAnimation = null;
    this._raf = null;
    this._framesUntilRedraw = 0;

    this._vueData = {
      isLoading: false,
      animationReady: false,
      unitId: '',
      activeServer: 'gl',
      cdnVersion: '',
      doTrim: false,
      doFlipHorizontal: false,
      doFlipVertical: false,
      activeBackgroundColor: 'None',
      customBackgroundColor: '#000000',
      generatedColor: '',
      defaultColors: [
        { label: 'None', value: 'None' },
        { label: 'Black', value: '#000000' },
        { label: 'White', value: '#FFFFFF' },
        { label: 'Discord Chat Dark', value: '#36393f' },
        { label: 'BF Wiki Table Background', value: '#FAFAFA' },
        { label: 'Other', value: 'Other' }
      ],
      formMessage: 'Input your options above then press "Generate" to start generating an animation.',
      errorOccurred: false,
      activeAnimation: '',
      animationNames: [],
      isPlaying: false,
      numFrames: 0,
      frameIndex: 0,
      animationUrls: {},
      outputSheetInfo: {},
      isAdvancedInput: false,
      advancedSettings: {
        numSpritesheets: 2,
        spritesheets: {
          0: 'https://dv5bk1m8igv7v.cloudfront.net/asset/21100/content/unit/img/unit_anime_10101905_L.png',
          1: 'https://dv5bk1m8igv7v.cloudfront.net/asset/21100/content/unit/img/unit_anime_10101905_U.png',
        },
        cgg: 'https://dv5bk1m8igv7v.cloudfront.net/asset/21100/content/unit/cgg/unit_cgg_10101901.csv',
        numAnimations: 3,
        animations: {
          0: 'https://dv5bk1m8igv7v.cloudfront.net/asset/21100/content/unit/cgs/unit_idle_cgs_10101901.csv',
          1: 'https://dv5bk1m8igv7v.cloudfront.net/asset/21100/content/unit/cgs/unit_move_cgs_10101901.csv',
          2: 'https://dv5bk1m8igv7v.cloudfront.net/asset/21100/content/unit/cgs/unit_atk_cgs_10101901.csv',
        },
        animationNames: {
          0: 'idle',
          1: 'move',
          2: 'atk',
        },
      },
      majorProgress: Infinity, // > 100 = hidden, < 0 = indeterminate, 0 - 100 = progress
      minorProgress: Infinity,
    };
    this._vueApp = new Vue({
      el: '#app',
      data: this._vueData,
      watch: {
        activeAnimation: (newValue) => {
          this._currentAnimation = newValue;
          this._vueData.numFrames = this._frameMaker.getNumberOfFramesForAnimation(newValue);
          if (newValue) {
            this.renderFrame(-Infinity);
          }
        },
        activeBackgroundColor: () => {
          this.renderFrame(this._vueData.frameIndex, { noIncrement: true });
        },
        customBackgroundColor: () => {
          this.renderFrame(this._vueData.frameIndex, { noIncrement: true });
        },
        isPlaying: (newValue) => {
          if (this._raf) {
            cancelAnimationFrame(this._raf);
          }
          if (newValue) {
            this.animate();
          }
        },
        advancedSettings: {
          deep: true,
          handler: (newValue, oldValue) => {
            if (newValue.numSpritesheets < oldValue.numSpritesheets) {
              for (let i = newValue.numSpritesheets; i < oldValue.numSpritesheets; ++i) {
                delete newValue.spritesheets[i];
              }
            }

            if (newValue.numAnimations < oldValue.numAnimations) {
              for (let i = newValue.numAnimations; i < oldValue.numAnimations; ++i) {
                delete newValue.animations[i];
                delete newValue.animationNames[i];
              }
            }
          },
        },
      },
      methods: {
        generateAnimation: () => this.generateAnimation(),
        renderFrame: (...args) => this.renderFrame(...args),
        generateGif: (...args) => this.generateGif(...args),
        generateOutputSheet: (...args) => this.generateOutputSheet(...args),
        animate: () => this.animate(),
        generateColorPreviewStyles: (color) => `width: 2em; background: ${color}; height: 1em; border: 1px solid black; display: inline-block;`,
      },
    });

    this._targetCanvas = document.querySelector('canvas#target');
  }

  getBackgroundColor () {
    let color = '';
    if (this._vueData.activeBackgroundColor !== 'None') {
      color = this._vueData.activeBackgroundColor !== 'Other' ? this._vueData.activeBackgroundColor : this._vueData.customBackgroundColor;
    }
    return color;
  }

  async init () {
    const targetCanvas = document.querySelector('canvas#target');
    targetCanvas.width = 2000;
    targetCanvas.height = 2000;
    this._targetCanvas = targetCanvas;

    // const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(820158, 'gl');
    // this._frameMaker = maker;
    // this._spritesheets = [spritesheet];
    const { maker, spritesheets } = await FrameMaker.fromAdvancedInput(undefined, this._vueData.doTrim);
    this._frameMaker = maker;
    this._spritesheets = spritesheets.slice();

    spritesheets.forEach((sheet) => {
      const img = document.createElement('img');
      img.src = sheet.src;
      document.body.appendChild(img);
    });

    this._vueData.activeAnimation = 'idle';
    // await new Promise((fulfill) => {
    //   setTimeout(() => {
    //     this.renderFrame().then(fulfill);
    //   }, 5000);
    // });
  }

  get _formIsValid () {
    if (this._vueData.isAdvancedInput) {
      const input = this._generateAdvancedInput();
      console.debug(input);
      return input.anime.length > 0 && input.cgg && Object.keys(input.cgs).length > 0;
    } else {
      console.debug(this._vueData);
      return this._vueData.unitId.length > 0 && !isNaN(this._vueData.unitId) && ['gl', 'eu', 'jp'].includes(this._vueData.activeServer);
    }
  }

  _setLog (message = '', isLoading) {
    // eslint-disable-next-line no-console
    console.debug('[LOG]', message);
    this._vueData.formMessage = message;
    if (isLoading !== undefined) {
      this._vueData.isLoading = !!isLoading;
    }
  }

  _setProgress (major, minor) {
    if (!isNaN(major)) {
      this._vueData.majorProgress = +major;
    }
    if (!isNaN(minor)) {
      this._vueData.minorProgress = +minor;
    }
  }

  _generateAdvancedInput () {
    const input = {
      anime: [],
      cgs: {},
      cgg: this._vueData.advancedSettings.cgg,
    };
    for (let i = 0; i < this._vueData.advancedSettings.numSpritesheets; ++i) {
      const sheet = this._vueData.advancedSettings.spritesheets[i];
      if (sheet) {
        input.anime.push(sheet);
      }
    }

    for (let i = 0; i < this._vueData.advancedSettings.numAnimations; ++i) {
      const url = this._vueData.advancedSettings.animations[i];
      if (url) {
        input.cgs[this._vueData.advancedSettings.animationNames[i] || `animation-${i}`] = url;
      }
    }

    return input;
  }

  async generateAnimation () {
    if (this._vueData.isLoading) {
      return;
    }
    if (!this._formIsValid) {
      this._vueData.errorOccurred = true;
      this._vueData.formMessage = '<b>ERROR:</b> Form input isn\'t valid. Please try again.';
      return;
    }

    this._vueData.animationReady = false;
    this._vueData.isPlaying = false;
    this._vueData.errorOccurred = false;
    this._vueData.activeAnimation = '';
    this._vueData.frameIndex = 0;
    this._setLog('Loading spritesheets and CSVs...', true);
    this._setProgress(-1, Infinity);
    await waitForIdleFrame();
    // load animation data
    try {
      if (this._vueData.isAdvancedInput) {
        const { maker, spritesheets } = await FrameMaker.fromAdvancedInput(this._generateAdvancedInput(), this._vueData.doTrim);
        this._frameMaker = maker;
        this._spritesheets = spritesheets.slice();
      } else {
        const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(this._vueData.unitId, this._vueData.activeServer, this._vueData.doTrim, this._vueData.cdnVersion);
        this._frameMaker = maker;
        this._spritesheets = [spritesheet];
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this._vueData.errorOccurred = true;
      this._setLog(`Error getting animation data for ${!this._vueData.isAdvancedInput ? this._vueData.unitId : 'advanced input'}`, false);
      return;
    }

    // generate the animations
    const animationNames = this._frameMaker.loadedAnimations;
    console.debug(animationNames);
    this._vueApp.animationNames = animationNames;
    try {
      for (const name of animationNames) {
        this._setProgress(((animationNames.indexOf(name) + 1) / animationNames.length) * 100);
        const animation = this._frameMaker.getAnimation(name);
        const numFrames = animation.frames.length;
        for (let i = 0; i < numFrames; ++i) {
          this._setProgress(undefined, Math.floor(i / numFrames * 100));
          this._setLog(`Generating frames for ${name} [${(i+1).toString().padStart(numFrames.toString().length, '0')}/${numFrames}]...`);
          // await this._waitForIdleFrame();
          await this._frameMaker.getFrame({
            spritesheets: this._spritesheets,
            animationName: name,
            animationIndex: i,
            flipHorizontal: this._vueData.doFlipHorizontal,
            flipVertical: this._vueData.doFlipVertical,
            drawFrameBounds: false, // set true for debugging
          });
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this._vueData.errorOccurred = true;
      this._setLog(`Error getting animation data for ${!this._vueData.isAdvancedInput ? this._vueData.unitId : 'advanced input'}`, false);
      return;
    }

    // notify that animations are finished
    this._vueData.animationReady = true;
    this._vueData.animationUrls = {};
    this._vueData.outputSheetInfo = {};
    this._vueData.activeAnimation = animationNames[0];
    this._setProgress(100, 100);
    this._setLog(`Successfully generated animation for ${!this._vueData.isAdvancedInput ? this._vueData.unitId : 'advanced input'}`, false);
  }

  async renderFrame (index, options = {}) {
    const animation = this._frameMaker.getAnimation(this._currentAnimation);
    let frameToRender = !isNaN(index) ? +index : this._vueData.frameIndex;
    if (frameToRender < 0) {
      frameToRender += animation.frames.length;
    } else if (frameToRender >= animation.frames.length) {
      frameToRender -= animation.frames.length;
    }
    // console.debug(index, frameToRender);
    // console.debug(frameToRender, this._frameIndex);
    const isValidIndex = frameToRender < animation.frames.length && frameToRender >= 0;

    const frame = await this._frameMaker.getFrame({
      spritesheets: this._spritesheets,
      animationName: this._currentAnimation,
      animationIndex: isValidIndex ? frameToRender : 0,
      ...options,
    });
    // console.debug(index, animation, frame);
    if (this._targetCanvas.width !== frame.width) {
      this._targetCanvas.width = frame.width;
      this._targetCanvas.style.width = `${frame.width}px`;
    }
    if (this._targetCanvas.height !== frame.height) {
      this._targetCanvas.height = frame.height;
      this._targetCanvas.style.height = `${frame.height}px`;
    }
    const context = this._targetCanvas.getContext('2d');
    context.clearRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);

    const backgroundColor = this.getBackgroundColor();
    if (backgroundColor) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);
    }
    context.drawImage(frame, 0, 0);

    // mark center of canvas
    // context.save();
    // context.fillStyle = 'red';
    // context.beginPath();
    // context.ellipse(this._targetCanvas.width / 2, this._targetCanvas.height / 2, 3, 3, Math.PI / 2, 0, Math.PI * 2);
    // context.fill();
    // context.restore();

    if (!options.noIncrement) {
      this._vueData.frameIndex = (frameToRender + 1 < animation.frames.length && frameToRender >= 0) ? frameToRender + 1 : 0;
    }
    return frame;
  }

  async generateGif (animationName) {
    this._vueData.isPlaying = false;
    this._vueData.errorOccurred = false;

    this._setLog(`Creating GIF for ${animationName} [0.00%]`, true);
    this._setProgress(Infinity, 0);
    await waitForIdleFrame();
    try {
      const backgroundColor = this.getBackgroundColor();
      const result = await this._frameMaker.toGif({
        spritesheets: this._spritesheets,
        animationName,
        GifClass: GIF,
        onProgressUpdate: (amt) => {
          this._setLog(`Creating GIF [${(amt * 100).toFixed(2)}%]`);
          this._setProgress(undefined, Math.floor(amt * 100));
        },
        backgroundColor,
        useTransparency: !backgroundColor,
      });
      this._vueData.animationUrls[animationName] = result.url;
      this._vueData.generatedColor = backgroundColor || this._vueData.activeBackgroundColor;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this._vueData.errorOccurred = true;
      this._setLog(`Error generating GIF for ${animationName}`, false);
      return;
    }

    this._setProgress(undefined, 100);
    this._setLog(`Successfully generated GIF for ${animationName}`, false);
  }

  async generateOutputSheet (animationName) {
    this._vueData.isPlaying = false;
    this._vueData.errorOccurred = false;

    this._setLog(`Creating sheet for ${animationName} [0.00%]`, true);
    this._setProgress(Infinity, 0);
    await waitForIdleFrame();
    try {
      this._vueData.outputSheetInfo[animationName] = await this._frameMaker.toSheet({
        spritesheets: this._spritesheets,
        animationName,
        onProgressUpdate: (amt) => {
          this._setLog(`Creating sheet [${(amt * 100).toFixed(2)}%]`);
          this._setProgress(undefined, Math.floor(amt * 100));
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      this._vueData.errorOccurred = true;
      this._setLog(`Error generating sheet for ${animationName}`, false);
      return;
    }

    this._setProgress(undefined, 100);
    this._setLog(`Successfully generated sheet for ${animationName}`, false);
  }

  async animate () {
    if (this._framesUntilRedraw <= 0) {
      const frame = await this.renderFrame();
      this._framesUntilRedraw = frame.dataset.delay;
    } else {
      this._framesUntilRedraw--;
    }

    if (this._vueData.isPlaying) {
      this._raf = requestAnimationFrame(() => this.animate());
    }
  }

  get frameMaker () {
    return this._frameMaker;
  }
}
