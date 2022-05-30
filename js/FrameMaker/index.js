'use strict';
import greenlet from 'greenlet';
import waitForIdleFrame from '../waitForIdleFrame';

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

      xMax = Math.max(xMax, part.position.x + w + xOffset);
      yMax = Math.max(yMax, part.position.y + h + yOffset);
    });
  });
  let left = 0, top = 0,
    width = xMax - xMin,
    height = yMax - yMin;
  if (!doTrim) {
    left = -(xMax + xMin) / 4; // center horizontally
    top = -(yMax + yMin) / 4; // center vertically
  } else {
    left = -(xMax + xMin) / 2;
    top = -(yMax + yMin) / 2;
  }
  return {
    x: [xMin, xMax],
    y: [yMin, yMax],
    w: width,
    h: height,
    offset: { // equivalent to padding
      left,
      top,
    },
  };
});

const TRANSPARENCY_COLOR = 'rgb(100, 100, 100)';

export default class FrameMaker {
  constructor (cggCsv = [], scalingInformationByFrameByPart = {}) {
    this._frames = this._processCgg(cggCsv, scalingInformationByFrameByPart);
    this._animations = {};
  }

  _blobToBase64 (blob) {
    return new Promise((fulfill) => {
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        fulfill(base64);
      };
      reader.readAsDataURL(blob);
    });
  }

  static get SAMPLE_ADVANCED_INPUT () {
    return {
      id: '10101905',
      anime: [
        'http://dlc.bfglobal.gumi.sg/content/unit/img/unit_anime_10101905_L.png',
        'http://dlc.bfglobal.gumi.sg/content/unit/img/unit_anime_10101905_U.png',
      ],
      cgg: 'http://dlc.bfglobal.gumi.sg/content/unit/cgg/unit_cgg_10101901.csv',
      cgs: {
        idle: 'http://dlc.bfglobal.gumi.sg/content/unit/cgs/unit_idle_cgs_10101901.csv',
        move: 'http://dlc.bfglobal.gumi.sg/content/unit/cgs/unit_move_cgs_10101901.csv',
        atk: 'http://dlc.bfglobal.gumi.sg/content/unit/cgs/unit_atk_cgs_10101901.csv',
      },
    };
  }

  static _loadCsv (path) {
    return fetch(path)
      .then(r => {
        if (r.status !== 200) {
          throw new Error(`Fetch error: ${r.status} - ${r.statusText}`);
        }
        return r.text();
      }).then(r => r.split('\n').map(line => line.split(',')));
  }

  // very specific (but main use case) for the frame maker: animate Brave Frontier units
  static async fromBraveFrontierUnit (id = '10011', server = 'gl', doTrim = false, cdnVersion = '') {
    const serverUrls = {
      eu: 'http://static-bravefrontier.gumi-europe.net/content/',
      gl: 'https://dv5bk1m8igv7v.cloudfront.net/asset/21900/content/',
      jp: 'http://cdn.android.brave.a-lim.jp/',
    };
    const filepaths = {
      cgg: 'unit/cgg/',
      cgs: 'unit/cgs/',
      anime: 'unit/img/'
    };
    const animationTypes = ['idle', 'atk', 'move', server === 'eu' && 'skill'].filter(v => v);
    let baseUrl = serverUrls[server];
    if (!baseUrl) {
      throw new Error(`Unknown server [${server}]`);
    } else if (server === 'gl' && cdnVersion) {
      baseUrl = `https://dv5bk1m8igv7v.cloudfront.net/asset/${cdnVersion}/content/`;
    }

    const input = {
      anime: [
        [baseUrl, filepaths.anime, `unit_anime_${id}.png`].join(''),
      ],
      cgg: [baseUrl, filepaths.cgg, `unit_cgg_${id}.csv`].join(''),
      cgs: {},
    };

    animationTypes.forEach(type => {
      input.cgs[type] = [baseUrl, filepaths.cgs, `unit_${type}_cgs_${id}.csv`].join('');
    });

    const { spritesheets, maker } = await FrameMaker.fromAdvancedInput(input, doTrim);

    return {
      maker,
      spritesheet: spritesheets[0],
    };
  }

  static async fromAdvancedInput (input = FrameMaker.SAMPLE_ADVANCED_INPUT, doTrim = false) {
    const spritesheets = input.anime
      .map(sheet => new Promise((fulfill, reject) => {
        const spritesheet = new Image();
        spritesheet.onload = () => fulfill(spritesheet);
        spritesheet.onerror = spritesheet.onabort = reject;
        spritesheet.src = `/getImage/${encodeURIComponent(sheet)}`;
      }));

    const cgsCsv = {};
    const cgsPromises = Object.keys(input.cgs).map(type => {
      return FrameMaker._loadCsv(`/get/${encodeURIComponent(input.cgs[type])}`)
        .then(csv => {
          cgsCsv[type] = csv;
        })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.warn(`Skipping CGS [${type}] due to error`, err);
          return;
        });
    });

    const maker = await FrameMaker._loadCsv(`/get/${encodeURIComponent(input.cgg)}`)
      .then(csv => new FrameMaker(csv, input.scalingInformationByFrameByPart));

    // add found cgs animations to maker
    await Promise.all(cgsPromises);
    for (const key in cgsCsv) {
      await maker.addAnimation(key, cgsCsv[key], doTrim);
    }

    // return the spritesheet and FrameMaker instance
    return Promise.all(spritesheets).then(spritesheets => ({
      maker,
      spritesheets,
    }));
  }

  _cggLineToEntry (frameLine = [], index = -1, scalingInformationByFrameByPart = {}) {
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
        flipType: +frameLine[curIndex++],
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
      const scalingInfoKey = `${index}-${partCount}`;
      if (scalingInformationByFrameByPart[scalingInfoKey]) {
        Object.assign(part, scalingInformationByFrameByPart[scalingInfoKey]);
      }
      if (partIsValid(part)) {
        partCount++;
        entry.parts.push(part);
      } else {
        console.warn('Encountered NaN part', part, index);
      }
    }
    return entry;
  }

  _processCgg (cggCsv = [], scalingInformationByFrameByPart) {
    return cggCsv
      .filter(frame => frame.length >= 2) // filter out empty frames
      .map((frame, i) => this._cggLineToEntry(frame, i, scalingInformationByFrameByPart));
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
    const trim = doTrim === undefined ?
      (!lowercaseKey.includes('atk') && !lowercaseKey.includes('xbb')) :
      doTrim;
    const bounds = await calculateAnimationBounds(
      cgsFrames,
      this._frames,
      trim,
    );

    this._animations[key] = {
      frames: cgsFrames,
      bounds,
      trimmed: trim,
      cachedCanvases: {},
      gif: null,
    };
  }

  getAnimation (key = 'name') {
    return this._animations[key];
  }

  get loadedAnimations () {
    const preferredOrder = ['idle', 'move', 'atk', 'skill'];
    return Object.keys(this._animations).sort((a, b) => {
      // order so that preferred order comes first and unknown comes last
      const [aIndex, bIndex] = [preferredOrder.indexOf(a), preferredOrder.indexOf(b)];
      if (aIndex === bIndex) {
        return a < b ? -1 : 1;
      } else if (aIndex >= 0 && bIndex >= 0) {
        return aIndex - bIndex;
      } else {
        return aIndex < 0 ? 1 : -1;
      }
    });
  }

  getNumberOfFramesForAnimation (name = 'name') {
    const animation = this._animations[name];
    return animation ? animation.frames.length : 0;
  }


  /**
   * @returns {Promise<HTMLCanvasElement>}
   */
  async getFrame({
    spritesheets = [], // array of img elements containing sprite sheets
    animationName = 'name',
    animationIndex = -1,
    referenceCanvas, // referenced for dimensions on first draw, otherwise optional
    forceRedraw = false,
    flipHorizontal = false,
    flipVertical = false,
    drawFrameBounds = false,
    cacheNewCanvases = true,
  }) {
    const animationEntry = this._animations[animationName];
    if (!animationEntry) {
      throw new Error(`No animation entry found with name ${animationName}`);
    }

    const { bounds, cachedCanvases } = animationEntry;
    if (cachedCanvases[animationIndex] && !forceRedraw) {
      // console.debug(`using cached frame [cgs:${animationIndex}]`);
      return cachedCanvases[animationIndex];
    }

    const cgsFrame = animationEntry.frames[animationIndex];
    const cggFrame = this._frames[cgsFrame.frameIndex];
    // console.debug(`drawing frame [cgs:${animationIndex}, cgg:${cgsFrame.frameIndex}]`, cggFrame);

    const tempCanvasSize = (spritesheets.reduce((acc, val) => Math.max(acc, val.width, val.height), Math.max(bounds.w + Math.abs(bounds.offset.left) * 2, bounds.h + Math.abs(bounds.offset.top) * 2)));
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
      frameCanvas.width = bounds.w;
      frameCanvas.height = bounds.h;
    }
    frameCanvas.dataset.delay = cgsFrame.frameDelay;

    const origin = {
      x: frameCanvas.width / 2,
      y: frameCanvas.height / 2,
    };
    const tempContext = tempCanvas.getContext('2d');
    const frameContext = frameCanvas.getContext('2d');
    // render each part in reverse order onto the frameCanvas
    for (let partIndex = cggFrame.parts.length - 1; partIndex >= 0; --partIndex) {
      const part = cggFrame.parts[partIndex];
      await waitForIdleFrame(); // only copy parts between idle periods to lessen UI lag
      try {
        const sourceWidth = part.img.width, sourceHeight = part.img.height;
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.globalAlpha = part.opacity / 100;

        const flipX = part.flipType === 1 || part.flipType === 3;
        const flipY = part.flipType === 2 || part.flipType === 3;

        // draw part onto center of part canvas
        let tempX = tempCanvas.width / 2 - sourceWidth / 2,
          tempY = tempCanvas.height / 2 - sourceHeight / 2;
        const hasImageScaling = 'imageScaleX' in part || 'imageScaleY' in part;
        const xImageScaling = hasImageScaling ? part.imageScaleX : 1;
        const yImageScaling = hasImageScaling ? part.imageScaleY : 1;
        tempContext.save();
        if (hasImageScaling) {
          // assumption: if image scaling is present, then no flipping is present
          tempContext.translate(tempX, tempY);
          tempContext.drawImage(
            spritesheets[part.pageId],
            part.img.x, part.img.y, sourceWidth, sourceHeight,
            0, 0,
            sourceWidth, sourceHeight,
          );
        } else {
          if (flipX || flipY) {
            tempContext.translate(flipX ? sourceWidth : 0, flipY ? sourceHeight : 0);
            tempContext.scale(flipX ? -xImageScaling : xImageScaling, flipY ? -yImageScaling : yImageScaling);
            tempX -= (flipX ? tempCanvas.width - sourceWidth : 0);
            tempY -= (flipY ? tempCanvas.height - sourceHeight : 0);
          } else {
            tempContext.scale(xImageScaling, yImageScaling);
          }
          // from spritesheet to part canvas
          tempContext.drawImage(
            spritesheets[part.pageId],
            part.img.x, part.img.y, sourceWidth, sourceHeight,
            tempX, tempY,
            sourceWidth, sourceHeight,
          );
        }
        tempContext.restore();

        // blend code based off of this: http://pastebin.com/vXc0yNRh
        if (part.blendMode === 1) {
          const imgData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const pixelData = imgData.data;
          for (let p = 0; p < pixelData.length; p += 4) {
            if (pixelData[p + 3] > 0) { // if alpha > 0
              let [r, g, b, a] = [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]];
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
        // bodyCanvas.dataset.cgsIndex = cggFrame.parts.length - 1;
        // const bodyContext = bodyCanvas.getContext('2d');
        // bodyContext.globalAlpha = part.opacity / 100;
        // bodyContext.drawImage(tempCanvas, 0, 0);
        // bodyContext.beginPath();
        // bodyContext.rect(tempCanvas.width / 2 - sourceWidth / 2, tempCanvas.height / 2 - sourceHeight / 2, sourceWidth, sourceHeight);
        // bodyContext.stroke();
        // bodyContext.fillStyle = 'red';
        // bodyContext.beginPath();
        // bodyContext.ellipse(
        //   tempCanvas.width / 2, tempCanvas.height / 2,
        //   5, 5, Math.PI / 2, 0, 2 * Math.PI
        // );
        // bodyContext.fill();
        // document.body.appendChild(bodyCanvas);

        // copy part result to frame canvas
        const targetX = origin.x + part.position.x + sourceWidth / 2 - tempCanvasSize / 2,
          targetY = origin.y + part.position.y + sourceHeight / 2 - tempCanvasSize / 2;
        if (part.rotate !== 0) {
          frameContext.save();
          // console.debug('rotating', part.rotate);
          frameContext.translate(origin.x + part.position.x + sourceWidth / 2 + bounds.offset.left, origin.y + part.position.y + sourceHeight / 2 + bounds.offset.top);
          frameContext.rotate(-part.rotate * Math.PI / 180);
          frameContext.translate(-(origin.x + part.position.x + sourceWidth / 2 + bounds.offset.left), -(origin.y + part.position.y + sourceHeight / 2 + bounds.offset.top));
        }
        const hasFrameScaling = 'frameScaleX' in part || 'frameScaleY' in part;
        if (hasFrameScaling) {
          if (part.rotate === 0) {
            frameContext.save();
          }
          const xOffset = hasFrameScaling ? tempCanvas.width / 2 * (1 - part.frameScaleX) : 0;
          const yOffset = hasFrameScaling ? tempCanvas.height / 2 * (1 - part.frameScaleY) : 0;
          frameContext.translate(targetX + bounds.offset.left + xOffset, targetY + bounds.offset.top + yOffset);
          frameContext.scale(part.frameScaleX, part.frameScaleY);
          frameContext.drawImage(
            tempCanvas,
            0, 0, // start at top left of temp canvas
            tempCanvas.width, tempCanvas.height,
            0, 0,
            tempCanvas.width, tempCanvas.height,
          );
          frameContext.restore();
        } else {
          frameContext.drawImage(
            tempCanvas,
            0, 0, // start at top left of temp canvas
            tempCanvas.width, tempCanvas.height,
            targetX + bounds.offset.left, targetY + bounds.offset.top,
            tempCanvas.width, tempCanvas.height,
          );
          if (part.rotate !== 0) {
            frameContext.restore();
          }
        }
      } catch (err) {
        /* eslint-disable no-console */
        console.warn('skipping part due to error', partIndex, part);
        console.error(err);
        /* eslint-enable no-console */
      }
    }
    // flip the frame as needed
    if (flipVertical || flipHorizontal) {
      const flippedCanvas = document.createElement('canvas');
      flippedCanvas.width = frameCanvas.width;
      flippedCanvas.height = frameCanvas.height;
      const flippedContext = flippedCanvas.getContext('2d');
      flippedContext.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
      flippedContext.translate(flipHorizontal ? -flippedCanvas.width : 0, flipVertical ? -flippedCanvas.height : 0);
      flippedContext.drawImage(frameCanvas, 0, 0);
      frameContext.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
      frameContext.drawImage(flippedCanvas, 0, 0);
      flippedCanvas.remove();
    }
    if (drawFrameBounds) {
      console.debug('drawing frame bounds', bounds, origin);
      frameContext.save();
      frameContext.strokeStyle = 'red';
      frameContext.beginPath();
      if (!animationEntry.trimmed) {
        frameContext.rect(
          origin.x + bounds.x[0] + bounds.offset.left * 3,
          origin.y + bounds.y[0] + bounds.offset.top * 3,
          bounds.w - bounds.offset.left * 2, bounds.h - bounds.offset.top * 2,
        );
      } else {
        frameContext.rect(
          origin.x + bounds.x[0] + bounds.offset.left,
          origin.y + bounds.y[0] + bounds.offset.top,
          bounds.w, bounds.h,
        );
      }
      frameContext.stroke();
      frameContext.restore();
    }
    if (cacheNewCanvases) {
      cachedCanvases[animationIndex] = frameCanvas;
    }
    tempCanvas.remove();
    // console.debug(bounds, frameCanvas);
    return frameCanvas;
  }

  async drawFrame ({
    spritesheets = [], // array of img elements containing sprite sheets
    animationName = 'name', animationIndex = -1,
    targetCanvas = document.createElement('canvas'),
    forceRedraw = false,
    flipHorizontal = false,
    flipVertical = false,
    drawFrameBounds = false,
  }) {
    const frameCanvas = await this.getFrame({
      spritesheets,
      animationName,
      animationIndex,
      referenceCanvas: targetCanvas,
      forceRedraw,
      flipHorizontal,
      flipVertical,
      drawFrameBounds,
    });
    targetCanvas.getContext('2d').drawImage(frameCanvas, 0, 0);
  }

  hexToRgb (hexString = '') {
    const nonHashString = hexString.startsWith('#') ? hexString.slice(1) : hexString;
    const hexValue = parseInt(nonHashString, 16);
    const HEX_MASK = 0xFF;
    return {
      red: (hexValue >> 16) & HEX_MASK,
      green: (hexValue >> 8) & HEX_MASK,
      blue: hexValue & HEX_MASK,
    };
  }

  /**
   * @description used to hide black outlines from results due to low opacities
   * @param {HTMLCanvasElement} frame
   * @param {Object} options
   * @returns {HTMLCanvasElement}
   */
  createFilteredFrameByAlpha (frame, { limitingAlpha = 100, backgroundColor } = {}) {
    const context = frame.getContext('2d');
    const imageData = context.getImageData(0, 0, frame.width, frame.height);
    const newFrame = document.createElement('canvas');
    newFrame.width = frame.width;
    newFrame.height = frame.height;
    const newFrameContext = newFrame.getContext('2d');
    const pixels = imageData.data;
    const pixelDataLength = pixels.length;
    const rgbColor = this.hexToRgb(backgroundColor);
    for (let i = 0; i < pixelDataLength; i += 4) {
      const currentPixelAlpha = pixels[i + 3];
      if (currentPixelAlpha < limitingAlpha) {
        if (!backgroundColor) {
          pixels[i + 3] = 0;
        } else {
          pixels[i] = rgbColor.red;
          pixels[i + 1] = rgbColor.green;
          pixels[i + 2] = rgbColor.blue;
          pixels[i + 3] = 255;
        }
      }
    }
    newFrameContext.putImageData(imageData, 0, 0);
    return newFrame;
  }

  /**
   * @param {HTMLCanvasElement} frame
   * @param {String} backgroundColor
   */
  createFrameWithBackground(frame, backgroundColor) {
    const newFrame = document.createElement('canvas');
    newFrame.width = frame.width;
    newFrame.height = frame.height;
    const newFrameContext = newFrame.getContext('2d');
    newFrameContext.fillStyle = backgroundColor;
    newFrameContext.fillRect(0, 0, frame.width, frame.height);
    newFrameContext.drawImage(frame, 0, 0);
    return newFrame;
  }

  async toGif ({
    spritesheets = [], // array of img elements containing sprite sheets
    animationName = 'name',
    referenceCanvas, // referenced for dimensions on first draw, otherwise optional
    forceRedraw = false,
    flipHorizontal = false,
    flipVertical = false,
    drawFrameBounds = false,
    GifClass,
    useTransparency = true,
    cacheNewCanvases = true,
    onProgressUpdate,
    backgroundColor,
  }) {
    const gif = new GifClass({
      workerScript: 'js/gif.worker.js',
      copy: true,
      quality: 1,
      background: 'rgb(0,0,0)', // color to render background with
      transparent: useTransparency ? TRANSPARENCY_COLOR : null,
      dispose: 2,
    });

    const animationEntry = this._animations[animationName];
    if (!animationEntry) {
      throw new Error(`No animation entry found with name ${animationName}`);
    } 

    animationEntry.gif = animationEntry.gif || {};
    
    if (!animationEntry.gif[backgroundColor]) {
      const numFrames = animationEntry.frames.length;
      for (let i = 0; i < numFrames; ++i) {
        const originalFrame = await this.getFrame({
          spritesheets,
          animationName,
          animationIndex: i,
          referenceCanvas,
          forceRedraw,
          flipHorizontal,
          flipVertical,
          drawFrameBounds,
          cacheNewCanvases,
        });

        let frame;
        if (backgroundColor) {
          frame = this.createFrameWithBackground(originalFrame, backgroundColor);
        } else {
          frame = this.createFilteredFrameByAlpha(originalFrame);
        }
        const delay = Math.floor(originalFrame.dataset.delay / 60 * 1000);
        gif.addFrame(frame, { delay });
      }
      const blob = await new Promise((fulfill) => {
        if (typeof onProgressUpdate === 'function') {
          gif.on('progress', amt => onProgressUpdate(amt));
        }
        gif.on('finished', blob => fulfill(blob));
        gif.render();
      });

      animationEntry.gif[backgroundColor] = {
        url: URL.createObjectURL(blob),
        blob: await this._blobToBase64(blob),
      };
    }

    return animationEntry.gif[backgroundColor];
  }
}
