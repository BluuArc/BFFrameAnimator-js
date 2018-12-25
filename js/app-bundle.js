var App = (function () {
  'use strict';

  function greenlet(n){var e=0,t={},a=new Worker("data:,$$="+n+";onmessage="+function(n){Promise.resolve(n.data[1]).then(function(n){return $$.apply($$,n)}).then(function(e){postMessage([n.data[0],0,e],[e].filter(function(n){return n instanceof ArrayBuffer||n instanceof MessagePort||n instanceof ImageBitmap}));},function(e){postMessage([n.data[0],1,""+e]);});});return a.onmessage=function(n){t[n.data[0]][n.data[1]](n.data[2]),t[n.data[0]]=null;},function(n){return n=[].slice.call(arguments),new Promise(function(){t[++e]=arguments,a.postMessage([e,n],n.filter(function(n){return n instanceof ArrayBuffer||n instanceof MessagePort||n instanceof ImageBitmap}));})}}

  const calculateAnimationBounds = greenlet(function (cgsEntry = [], frames = [], doTrim = false) {
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    cgsEntry.forEach(cgsFrame => {
      const frameData = frames[cgsFrame.frameIndex];
      const xOffset = Math.abs(cgsFrame.xOffset) || 0;
      const yOffset = Math.abs(cgsFrame.yOffset) || 0;
      frameData.parts.forEach(part => {
        // bounds are x +- width and y +- height
        const w = part.img.width, h = part.img.height;
        xMin = Math.min(xMin, part.position.x - (doTrim ? 0 : w) - xOffset);
        yMin = Math.min(yMin, part.position.y - (doTrim ? 0 : h) - yOffset);

        xMax = Math.max(xMax, part.position.x + (doTrim ? 0 : w) + xOffset);
        yMax = Math.max(yMax, part.position.y + (doTrim ? 0 : h) + yOffset);
      });
    });
    return {
      x: [xMin, xMax],
      y: [yMin, yMax],
      w: xMax - xMin,
      h: yMax - yMin,
      offset: { // relative to top left of screen
        x: (xMax - xMin) * 0.125,
        y: (yMax - yMin) * 0.20,
      },
    };
  });

  class FrameMaker {
    constructor (cggCsv = []) {
      this._frames = this._processCgg(cggCsv);
      this._animations = {};
    }

    _cggLineToEntry (frameLine = [], index = -1) {
      const entry = {
        anchorType: +frameLine[0],
        partCount: +frameLine[1],
        parts: [],
      };

      let curIndex = 2, partCount = 0;
      const partIsValid = (part = {}) => {
        for (const field in part) {
          if (field !== 'position' && field !== 'img' && isNaN(part[field])) {
            return false;
          }
        }
        return true;
      };

      // parse each part in the line
      while (partCount < entry.partCount) {
        const part = {
          position: { // origin is middle
            x: +frameLine[curIndex++],
            y: +frameLine[curIndex++],
          },
          nextType: +frameLine[curIndex++],
          blendMode: +frameLine[curIndex++],
          opacity: +frameLine[curIndex++],
          rotate: +frameLine[curIndex++],
          img: { // origin is top left
            x: +frameLine[curIndex++],
            y: +frameLine[curIndex++],
            width: +frameLine[curIndex++],
            height: +frameLine[curIndex++],
          },
          pageId: +frameLine[curIndex++],
        };
        if (partIsValid(part)) {
          partCount++;
          entry.parts.push(part);
        } else {
          console.warn('Encountered NaN part', part, index);
        }
      }
      return entry;
    }

    _processCgg (cggCsv = []) {
      return cggCsv
        .filter(frame => frame.length >= 2) // filter out empty frames
        .map((frame, i) => this._cggLineToEntry(frame, i));
    }

    _processCgs (cgsCsv = []) {
      return cgsCsv.map(frame => ({
        frameIndex: +frame[0], // same index in cgg
        xOffset: +frame[1],
        yOffset: +frame[2],
        frameDelay: +frame[3],
      })).filter((frame, i, fullArr) => {
        const isValid = Object.values(frame).every(v => !isNaN(v));
        if (!isValid) {
          console.warn('Ignoring NaN CGS line', frame, i, fullArr);
        }
        return isValid;
      }); // filter out unparseable frames
    }

    async addAnimation (key = 'name', csv = [], doTrim) {
      const cgsFrames = this._processCgs(csv);
      const lowercaseKey = key.toLowerCase();
      const bounds = await calculateAnimationBounds(
        cgsFrames,
        this._frames,
        doTrim === undefined
          ? (!lowercaseKey.includes('atk') && !lowercaseKey.includes('xbb'))
          : doTrim
      );

      this._animations[key] = {
        frames: cgsFrames,
        bounds,
        cachedCanvases: {},
      };
    }

    getAnimation (key = 'name') {
      return this._animations[key];
    }

    getFrame({
      spritesheets = [], // array of img elements containing sprite sheets
      animationName = 'name',
      animationIndex = -1,
      referenceCanvas, // referenced for dimensions on first draw, otherwise optional
      forceRedraw = false,
      drawFrameBounds = false,
    }) {
      const animationEntry = this._animations[animationName];
      if (!animationEntry) {
        throw new Error(`No animation entry found with name ${animationName}`);
      }

      const { bounds, cachedCanvases } = animationEntry;
      if (cachedCanvases[animationIndex] && !forceRedraw) {
        console.debug(`using cached frame [cgs:${animationIndex}]`);
        return cachedCanvases[animationIndex];
      }

      const cgsFrame = animationEntry.frames[animationIndex];
      const cggFrame = this._frames[cgsFrame.frameIndex];
      console.debug(`drawing frame [cgs:${animationIndex}, cgg:${cgsFrame.frameIndex}]`, cggFrame);

      const tempCanvasSize = (spritesheets.reduce((acc, val) => Math.max(acc, val.width, val.height), Math.max(bounds.w + bounds.offset.x * 2, bounds.h + bounds.offset.y * 2))) * 2;
      // used as a temp canvas for rotating/flipping parts
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tempCanvasSize;
      tempCanvas.height = tempCanvasSize;

      // final frame rendered here, to be cached
      const frameCanvas = document.createElement('canvas');
      if (referenceCanvas) {
        frameCanvas.width = referenceCanvas.width;
        frameCanvas.height = referenceCanvas.height;
      } else {
        frameCanvas.width = bounds.w + bounds.offset.x * 2;
        frameCanvas.height = bounds.h + bounds.offset.y * 2;
      }

      const origin = {
        x: frameCanvas.width / 2,
        y: frameCanvas.height / 2,
      };
      const tempContext = tempCanvas.getContext('2d');
      const frameContext = frameCanvas.getContext('2d');
      // render each part in reverse order onto the frameCanvas
      cggFrame.parts.slice().reverse().forEach((part) => {
        const sourceWidth = part.img.width, sourceHeight = part.img.height;
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.globalAlpha = part.opacity / 100;

        const flipX = part.nextType === 1 || part.nextType === 3;
        const flipY = part.nextType === 2 || part.nextType === 3;

        // draw part onto center of part canvas
        tempContext.save(); 
        let tempX = tempCanvas.width / 2 - sourceWidth / 2,
          tempY = tempCanvas.height / 2 - sourceHeight / 2;
        if (flipX || flipY) {
          tempContext.translate(flipX ? sourceWidth : 0, flipY ? sourceHeight : 0);
          tempContext.scale(flipX ? -1 : 1, flipY ? -1 : 1);
          tempX -= (flipX ? tempCanvas.width - sourceWidth : 0);
          tempY -= (flipY ? tempCanvas.height - sourceHeight : 0);
        }
        // from spritesheet to part canvas
        tempContext.drawImage(
          spritesheets[part.pageId],
          part.img.x, part.img.y, sourceWidth, sourceHeight,
          tempX, tempY,
          sourceWidth, sourceHeight,
        );
        tempContext.restore();

        // blend code based off of this: http://pastebin.com/vXc0yNRh
        if (part.blendMode === 1) {
          const imgData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const pixelData = imgData.data;
          for (let p = 0; p < pixelData.length; p += 4) {
            let [r, g, b, a] = [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]];
            if (a > 0) {
              const multiplier = 1 + (a * part.opacity / 100) / 255.0;
              r = Math.min(255, Math.floor(r * multiplier));
              g = Math.min(255, Math.floor(g * multiplier));
              b = Math.min(255, Math.floor(b * multiplier));
              a = Math.floor(((r + g + b) / 3) * part.opacity / 100);

              [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]] = [r, g, b, a];
            }
          }
          tempContext.putImageData(imgData, 0, 0);
        }

        // put part canvas on document body for debugging
        // const bodyCanvas = document.createElement('canvas');
        // bodyCanvas.width = tempCanvas.width;
        // bodyCanvas.height = tempCanvas.height;
        // bodyCanvas.dataset.cgsIndex = cggFrame.parts.length - 1 - i;
        // const bodyContext = bodyCanvas.getContext('2d');
        // bodyContext.globalAlpha = part.opacity / 100;
        // bodyContext.drawImage(tempCanvas, 0, 0);
        // bodyContext.beginPath();
        // bodyContext.rect(tempCanvas.width / 2 - sourceWidth / 2, tempCanvas.height / 2 - sourceHeight / 2, sourceWidth, sourceHeight);
        // bodyContext.stroke();
        // document.body.appendChild(bodyCanvas);

        // copy part result to frame canvas
        frameContext.save();
        const targetX = origin.x + part.position.x + sourceWidth / 2 - tempCanvasSize / 2,
          targetY = origin.y + part.position.y + sourceHeight / 2 - tempCanvasSize / 2;
        if (part.rotate !== 0) {
          // console.debug('rotating', part.rotate);
          frameContext.translate(origin.x + part.position.x + sourceWidth / 2, origin.y + part.position.y + sourceHeight / 2);
          frameContext.rotate(-part.rotate * Math.PI / 180);
          frameContext.translate(-(origin.x + part.position.x + sourceWidth / 2), -(origin.y + part.position.y + sourceHeight / 2));
        }
        frameContext.drawImage(
          tempCanvas,
          0, 0, // start at top left of temp canvas
          tempCanvas.width, tempCanvas.height,
          targetX + bounds.offset.x, targetY + bounds.offset.y,
          tempCanvas.width, tempCanvas.height,
        );
        frameContext.restore();
      });
      if (drawFrameBounds) {
        console.debug('drawing frame bounds', bounds);
        frameContext.beginPath();
        frameContext.rect(
          origin.x + bounds.x[0],
          origin.y + bounds.y[0],
          bounds.w + bounds.offset.x * 2, bounds.h + bounds.offset.y * 2,
        );
        frameContext.stroke();
      }
      cachedCanvases[animationIndex] = frameCanvas;
      return frameCanvas;
    }

    drawFrame ({
      spritesheets = [], // array of img elements containing sprite sheets
      animationName = 'name', animationIndex = -1,
      targetCanvas = document.createElement('canvas'),
      forceRedraw = false,
      drawFrameBounds = false,
    }) {
      const frameCanvas = this.getFrame({
        spritesheets,
        animationName,
        animationIndex,
        referenceCanvas: targetCanvas,
        forceRedraw,
        drawFrameBounds,
      });
      targetCanvas.getContext('2d').drawImage(frameCanvas, 0, 0);
    }
  }

  class App {
    constructor () {
      this._frameMaker = null;
      this._targetCanvas = null;
      this._frameIndex = -1;
      this._currentAnimation = null;
    }

    static get SAMPLE_URLS () {
      const baseUrl = 'http://2.cdn.bravefrontier.gumi.sg/content/';
      const filepaths = {
        cgg: 'unit/cgg/',
        cgs: 'unit/cgs/',
        anime: 'unit/img/'
      };
      return {
        anime: `/getImage/${encodeURIComponent(baseUrl + filepaths.anime + 'unit_anime_850438.png')}`,
        cgg: `/get/${encodeURIComponent(baseUrl + filepaths.cgg + 'unit_cgg_850438.csv')}`,
        cgs: `/get/${encodeURIComponent(baseUrl + filepaths.cgs + 'unit_idle_cgs_850438.csv')}`,
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
      targetCanvas.width = 2000;
      targetCanvas.height = 2000;
      this._targetCanvas = targetCanvas;

      const spritesheet = document.querySelector('img.spritesheet');
      await new Promise((fulfill, reject) => {
        spritesheet.onload = fulfill;
        spritesheet.onerror = reject;

        spritesheet.src = App.SAMPLE_URLS.anime;
      });

      this._currentAnimation = 'idle';
    }

    renderFrame (index, options = {}) {
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
        ...options,
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

  return App;

}());
//# sourceMappingURL=app-bundle.js.map
