'use strict';
import greenlet from 'greenlet';

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

export default class FrameMaker {
  constructor (cggCsv = []) {
    this._frames = this._processCgg(cggCsv);
    this._animations = {};
  }

  // very specific (but main use case) for the frame maker: animate Brave Frontier units
  static async fromBraveFrontierUnit (id = '10011', server = 'gl', doTrim = false) {
    const serverUrls = {
      eu: 'http://static-bravefrontier.gumi-europe.net/content/',
      gl: 'http://2.cdn.bravefrontier.gumi.sg/content/',
      jp: 'http://cdn.android.brave.a-lim.jp/',
    };
    const filepaths = {
      cgg: 'unit/cgg/',
      cgs: 'unit/cgs/',
      anime: 'unit/img/'
    };
    const animationTypes = ['idle', 'atk', 'move', server === 'eu' && 'skill'].filter(v => v);
    const loadCsv = (path) => fetch(path)
      .then(r => {
        if (r.status !== 200) {
          throw new Error(`Fetch error: ${r.status} - ${r.statusText}`);
        }
        return r.text();
      }).then(r => r.split('\n').map(line => line.split(',')));

    const baseUrl = serverUrls[server];
    if (!baseUrl) {
      throw new Error(`Unknown server [${server}]`);
    }

    // start querying for data simultaneously
    const imagePromise = new Promise((fulfill, reject) => {
      const spritesheet = new Image();
      spritesheet.onload = () => fulfill(spritesheet);
      spritesheet.onerror = spritesheet.onabort = reject;
      spritesheet.src = `/getImage/${encodeURIComponent(baseUrl + filepaths.anime + `unit_anime_${id}.png`)}`;
    });

    const cgsCsv = {};
    const cgsPromises = animationTypes.map(type => {
      return loadCsv(`/get/${encodeURIComponent(baseUrl + filepaths.cgs + `unit_${type}_cgs_${id}.csv`)}`)
        .then(csv => { cgsCsv[type] = csv; })
        .catch(err => {
          // eslint-disable-next-line no-console
          console.warn(`Skipping CGS [${type}] due to error`, err);
          return;
        });
    });

    const maker = await loadCsv(`/get/${encodeURIComponent(baseUrl + filepaths.cgg + `unit_cgg_${id}.csv`)}`)
      .then(csv => new FrameMaker(csv));

    // add found cgs animations to maker
    await Promise.all(cgsPromises);
    for (const key in cgsCsv) {
      await maker.addAnimation(key, cgsCsv[key], doTrim);
    }

    // return the spritesheet and FrameMaker instance
    return imagePromise.then(spritesheet => ({
      maker,
      spritesheet,
    }));
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

  _waitForIdleFrame () {
    return new Promise(fulfill => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(fulfill);
      } else {
        setTimeout(fulfill, 1);
      }
    });
  }

  async getFrame({
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
      // console.debug(`using cached frame [cgs:${animationIndex}]`);
      return cachedCanvases[animationIndex];
    }

    const cgsFrame = animationEntry.frames[animationIndex];
    const cggFrame = this._frames[cgsFrame.frameIndex];
    console.debug(`drawing frame [cgs:${animationIndex}, cgg:${cgsFrame.frameIndex}]`, cggFrame);

    const tempCanvasSize = (spritesheets.reduce((acc, val) => Math.max(acc, val.width, val.height), Math.max(bounds.w + Math.abs(bounds.offset.left) * 2, bounds.h + Math.abs(bounds.offset.top) * 2))) * 2;
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
      await this._waitForIdleFrame(); // only generate frames between idle periods
      try {

        const sourceWidth = part.img.width, sourceHeight = part.img.height;
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.globalAlpha = part.opacity / 100;

        const flipX = part.flipType === 1 || part.flipType === 3;
        const flipY = part.flipType === 2 || part.flipType === 3;

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
          // await this._waitForIdleFrame(); // only generate frames between idle periods
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
        // if (animationIndex === 12) {
        //   const bodyCanvas = document.createElement('canvas');
        //   bodyCanvas.width = tempCanvas.width;
        //   bodyCanvas.height = tempCanvas.height;
        //   bodyCanvas.dataset.cgsIndex = cggFrame.parts.length - 1;
        //   const bodyContext = bodyCanvas.getContext('2d');
        //   bodyContext.globalAlpha = part.opacity / 100;
        //   bodyContext.drawImage(tempCanvas, 0, 0);
        //   bodyContext.beginPath();
        //   bodyContext.rect(tempCanvas.width / 2 - sourceWidth / 2, tempCanvas.height / 2 - sourceHeight / 2, sourceWidth, sourceHeight);
        //   bodyContext.stroke();
        //   bodyContext.fillStyle = 'red';
        //   bodyContext.beginPath();
        //   bodyContext.ellipse(
        //     tempCanvas.width / 2, tempCanvas.height / 2,
        //     5, 5, Math.PI / 2, 0, 2 * Math.PI
        //   );
        //   bodyContext.fill();
        //   document.body.appendChild(bodyCanvas);
        // }

        // copy part result to frame canvas
        // await this._waitForIdleFrame(); // only generate frames between idle periods
        frameContext.save();
        const targetX = origin.x + part.position.x + sourceWidth / 2 - tempCanvasSize / 2,
          targetY = origin.y + part.position.y + sourceHeight / 2 - tempCanvasSize / 2;
        if (part.rotate !== 0) {
          // console.debug('rotating', part.rotate);
          frameContext.translate(origin.x + part.position.x + sourceWidth / 2 + bounds.offset.left, origin.y + part.position.y + sourceHeight / 2 + bounds.offset.top);
          frameContext.rotate(-part.rotate * Math.PI / 180);
          frameContext.translate(-(origin.x + part.position.x + sourceWidth / 2 + bounds.offset.left), -(origin.y + part.position.y + sourceHeight / 2 + bounds.offset.top));
        }
        frameContext.drawImage(
          tempCanvas,
          0, 0, // start at top left of temp canvas
          tempCanvas.width, tempCanvas.height,
          targetX + bounds.offset.left, targetY + bounds.offset.top,
          tempCanvas.width, tempCanvas.height,
        );
        frameContext.restore();
      } catch (err) {
        /* eslint-disable no-console */
        console.warn('skipping part due to error', partIndex, part);
        console.error(err);
        /* eslint-enable no-console */
      }
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
    cachedCanvases[animationIndex] = frameCanvas;
    tempCanvas.remove();
    // console.debug(bounds, frameCanvas);
    return frameCanvas;
  }

  async drawFrame ({
    spritesheets = [], // array of img elements containing sprite sheets
    animationName = 'name', animationIndex = -1,
    targetCanvas = document.createElement('canvas'),
    forceRedraw = false,
    drawFrameBounds = false,
  }) {
    const frameCanvas = await this.getFrame({
      spritesheets,
      animationName,
      animationIndex,
      referenceCanvas: targetCanvas,
      forceRedraw,
      drawFrameBounds,
    });
    targetCanvas.getContext('2d').drawImage(frameCanvas, 0, 0);
  }

  async toGif ({
    spritesheets = [], // array of img elements containing sprite sheets
    animationName = 'name',
    referenceCanvas, // referenced for dimensions on first draw, otherwise optional
    forceRedraw = false,
    drawFrameBounds = false,
    GifClass,
    useTransparency = true,
    onProgressUpdate,
  }) {
    const gif = new GifClass({
      workerScript: 'js/gif.worker.js',
      copy: true,
      quality: 1,
      transparent: useTransparency ? 'rgba(0,0,0,0)' : undefined
    });

    const animationEntry = this._animations[animationName];
    if (!animationEntry) {
      throw new Error(`No animation entry found with name ${animationName}`);
    } 
    
    if (!animationEntry.gif) {
      const numFrames = animationEntry.frames.length;
      for (let i = 0; i < numFrames; ++i) {
        const frame = await this.getFrame({
          spritesheets,
          animationName,
          animationIndex: i,
          referenceCanvas,
          forceRedraw,
          drawFrameBounds,
        });
        const delay = Math.floor(frame.dataset.delay / 60 * 1000);
        gif.addFrame(frame, { delay });
  
      }
      const blob = await new Promise((fulfill) => {
        if (typeof onProgressUpdate === 'function') {
          gif.on('progress', amt => onProgressUpdate(amt));
        }
        gif.on('finished', blob => fulfill(blob));
        gif.render();
      });

      animationEntry.gif = URL.createObjectURL(blob);
    }

    return animationEntry.gif;
  }
}
