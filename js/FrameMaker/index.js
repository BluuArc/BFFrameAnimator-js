'use strict';
import greenlet from 'greenlet';

const calculateAnimationBounds = greenlet(function (cgsEntry = [], frames = []) {
  let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
  cgsEntry.forEach(cgsFrame => {
    const frameData = frames[cgsFrame.frameIndex];
    const xOffset = Math.abs(cgsFrame.xOffset) || 0;
    const yOffset = Math.abs(cgsFrame.yOffset) || 0;
    frameData.parts.forEach(part => {
      // bounds are x +- width and y += height
      const w = part.img.width, h = part.img.height;
      xMin = Math.min(xMin, part.position.x - w - xOffset);
      yMin = Math.min(yMin, part.position.y - h - yOffset);

      xMax = Math.max(xMax, part.position.x + w + xOffset);
      yMax = Math.max(yMax, part.position.y + h + yOffset);
    });
  });
  return {
    x: [xMin, xMax],
    y: [yMin, yMax],
    w: xMax - xMin,
    h: yMax - yMin,
  };
});

export default class FrameMaker {
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

  getAnimation (key = 'name') {
    return this._animations[key];
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

    console.debug(`drawing frame [cgs:${animationIndex}, cgg:${cgsFrame.frameIndex}]`, cggFrame);

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
    cggFrame.parts.slice().reverse().forEach(frame => {
      const sourceWidth = frame.img.width, sourceHeight = frame.img.height;
      let targetX = frame.position.x + origin.x,
        targetY = frame.position.y + origin.y;
      tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempContext.globalAlpha = frame.opacity / 100;

      const flipX = frame.nextType === 1 || frame.nextType === 3;
      const flipY = frame.nextType === 2 || frame.nextType === 3;

      tempContext.save(); 
      if (flipX || !flipY) {
        tempContext.translate(flipX ? sourceWidth : 0, flipY ? sourceHeight : 0);
        tempContext.scale(flipX ? -1 : 1, flipY ? -1 : 1);
        targetX = (flipX ? targetX - tempCanvas.width + sourceWidth : targetX);
        targetY = (flipY ? targetY - tempCanvas.height + sourceHeight: targetY);
      }
      if (frame.rotate !== 0) {
        console.debug('rotating', frame.rotate, (360 % frame.rotate));
        tempContext.translate(targetX, targetY);
        tempContext.rotate(frame.rotate * Math.PI / 180);
        tempContext.translate(-(targetX), -(targetY));
        // targetY += sourceHeight / 2;
        targetX -= sourceWidth;
      }
      tempContext.drawImage(
        spritesheets[frame.pageId],
        frame.img.x, frame.img.y, sourceWidth, sourceHeight,
        // TODO: handle offsets here?
        // (flipX ? targetX - tempCanvas.width - sourceWidth / 2 : targetX),
        // (flipY ? targetY - tempCanvas.height + sourceHeight / 2 : targetY),
        targetX, targetY,
        sourceWidth, sourceHeight,
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
