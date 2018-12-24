var App = (function () {
  'use strict';

  function greenlet(n){var e=0,t={},a=new Worker("data:,$$="+n+";onmessage="+function(n){Promise.resolve(n.data[1]).then(function(n){return $$.apply($$,n)}).then(function(e){postMessage([n.data[0],0,e],[e].filter(function(n){return n instanceof ArrayBuffer||n instanceof MessagePort||n instanceof ImageBitmap}));},function(e){postMessage([n.data[0],1,""+e]);});});return a.onmessage=function(n){t[n.data[0]][n.data[1]](n.data[2]),t[n.data[0]]=null;},function(n){return n=[].slice.call(arguments),new Promise(function(){t[++e]=arguments,a.postMessage([e,n],n.filter(function(n){return n instanceof ArrayBuffer||n instanceof MessagePort||n instanceof ImageBitmap}));})}}

  const calculateAnimationBounds = greenlet(function (cgsEntry = [], frames = []) {
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    cgsEntry.forEach(cgsFrame => {
      const frameData = frames[cgsFrame.frameIndex];
      const xOffset = Math.abs(cgsFrame.xOffset) || 0;
      const yOffset = Math.abs(cgsFrame.yOffset) || 0;
      frameData.frames.forEach(frame => {
        // bounds are x +- width and y += height
        const w = frame.img.width, h = frame.img.height;
        xMin = Math.min(xMin, frame.position.x - w - xOffset);
        yMin = Math.min(yMin, frame.position.y - h - yOffset);

        xMax = Math.max(xMax, frame.position.x + w + xOffset);
        yMax = Math.max(yMax, frame.position.y + h + yOffset);
      });
    });
    return {
      x: [xMin, xMax],
      y: [yMin, yMax],
      w: xMax - xMin,
      h: yMax - yMin,
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
        frames: [],
      };

      let curIndex = 2, partCount = 0;
      const frameIsValid = (frame = {}) => {
        for (const field in frame) {
          if (field !== 'position' && field !== 'img' && isNaN(frame[field])) {
            return false;
          }
        }
        return true;
      };

      // parse each part in the line
      while (partCount < entry.partCount) {
        const frame = {
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
        if (frameIsValid(frame)) {
          partCount++;
          entry.frames.push(frame);
        } else {
          console.warn('Encountered NaN frame', frame, index);
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
      }); // filter out unparseable
    }

    async addAnimation (key = 'name', csv = []) {
      const cgsFrames = this._processCgs(csv);
      const bounds = await calculateAnimationBounds(cgsFrames, this._frames);
      const tempCanvas = document.createElement('canvas');
      tempCanvas.id = key;

      this._animations[key] = {
        frames: cgsFrames,
        bounds,
        tempCanvas,
      };
    }

    drawFrame ({
      spritesheets = [], // array of img elements containing sprite sheets
      animationName = 'name', animationIndex = -1,
      targetCanvas = document.createElement('canvas'),
    }) {
      const animationEntry = this._animations[animationName];
      if (!animationEntry) {
        throw new Error(`No animation entry found with name ${animationName}`);
      }

      const { bounds, tempCanvas } = animationEntry;
      const cgsFrame = animationEntry.frames[animationIndex];
      const cggFrame = this._frames[cgsFrame.frameIndex];

      // update width and height as necessary
      if (tempCanvas.width !== targetCanvas.width) {
        tempCanvas.width = targetCanvas.width;
      }
      if (tempCanvas.height !== targetCanvas.height) {
        tempCanvas.height = targetCanvas.height;
      }

      const origin = {
        x: targetCanvas.width / 2,
        y: targetCanvas.height / 2,
      };
      const targetContext = targetCanvas.getContext('2d');
      const tempContext = tempCanvas.getContext('2d');
      // render each part in reverse order
      cggFrame.frames.slice().reverse().forEach(frame => {
        const sourceWidth = frame.img.width, sourceHeight = frame.img.height;
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.globalAlpha = frame.opacity / 100;

        const flipX = frame.next_type == 1 || frame.next_type == 3;
        const flipY = frame.next_type == 2 || frame.next_type == 3;
        tempContext.save();
        if (flipX || flipY || frame.rotate !== 0) {
          tempContext.translate(flipX ? sourceWidth : 0, flipY ? sourceHeight : 0);
          tempContext.scale(flipX ? -1 : 1, flipY ? -1 : 1);

          // TODO: handle rotations
        }
        tempContext.drawImage(
          spritesheets[frame.pageId],
          frame.img.x, frame.img.y, sourceWidth, sourceHeight,
          // TODO: handle offsets here?
          frame.position.x + origin.x, frame.position.y + origin.y, sourceWidth, sourceHeight, 
        );
        tempContext.restore();

        // blend code based off of this: http://pastebin.com/vXc0yNRh
        if (frame.blendMode === 1) {
          const imgData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const pixelData = imgData.data;
          for (let p = 0; p < pixelData.length; p += 4) {
            let [r, g, b, a] = [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]];
            if (a > 0) {
              const multiplier = 1 + (a * frame.opacity / 100) / 255.0;
              r = Math.min(255, Math.floor(r * multiplier));
              g = Math.min(255, Math.floor(g * multiplier));
              b = Math.min(255, Math.floor(b * multiplier));
              a = Math.floor(((r + g + b) / 3) * frame.opacity / 100);

              [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]] = [r, g, b, a];
            }
          }
          tempContext.putImageData(imgData, 0, 0);
        }

        // copy final result to canvas
        targetContext.drawImage(tempCanvas, 0, 0);
      });
    }
  }

  class App {
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

  return App;

}());
//# sourceMappingURL=app-bundle.js.map
