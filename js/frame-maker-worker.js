const FrameMaker = function() {
  "use strict";
  const self = {
    sheets: [], // sprite sheets are stored here
    sheetFrameData: {
      cgg: [],
      cgs: {},
    },
    bgColor: undefined,
    frames: {}, // keyed by animation types, values for each is array of canvas frames
  };

  function debug() {
    console.debug(self);
  }

  function reset() {
    self.sheets = [];
    self.sheetFrameData.cgg = [];
    self.sheetFrameData.cgs = {};
    self.frames = {};
    self.bgColor = undefined;
  }

  function addSpriteSheet(sheetData) {
    self.sheets.push(sheetData);
  }

  function setSpriteSheets(sheetArr) {
    self.sheets = sheetArr;
  }

  /*
    obj = {
      <cgsType = 'atk'>: <array of frame data>
    }
  */
  function setCGSData(obj) {
    self.sheetFrameData.cgs = obj;
  }

  function setCGGData(arr) {
    self.sheetFrameData.cgg = arr;
  }

  function setBGColor(color) {
    self.bgColor = color;
  }

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.setAttribute('width', w);
    c.setAttribute('height', h);
    return c;
  };

  // animType = atk, idle, etc. -> keys of self.sheetFrameData.cgs
  function renderFramesOfType(animType) {
    console.info(`Rendering frames for ${animType}`);
    if (!self.sheetFrameData.cgs[animType]) {
      throw `renderFrames: ${animType} data is not found`;
    }

    const animInfo = self.sheetFrameData.cgs[animType];
    const cggData = self.sheetFrameData.cgg;
    

    let { frameData, frameBounds } = getFrameData(animType);

    self.frames[animType] = frameData.map((f, i) => {
      const targetCanvas = makeCanvas(frameBounds.w, frameBounds.h);
      targetCanvas.$frameMakerData = {
        id: `frame-${i}`,
        delay: animInfo[i].frame_delay
      };

      renderSingleFrame(f, targetCanvas, self.sheets, frameBounds);
      return targetCanvas;
    });
  }

  function getFrameData(animType) {
    const animInfo = self.sheetFrameData.cgs[animType];
    const cggData = self.sheetFrameData.cgg;

    let xMin, yMin, yMax, xMax;
    const frameData = animInfo.map(i => {
      const data = cggData[i.frame_index];
      if (i.x_pos_offset !== 0 || i.y_pos_offset !== 0) {
        console.debug(i.x_pos_offset, i.y_pos_offset, i);
      }

      // check for min/max
      data.frame_data.forEach(f => {
        const w = f.img.width, h = f.img.height;

        //set mins
        xMin = !isNaN(xMin) ? (Math.min(xMin, f.position.x - w)) : (f.position.x - w);
        yMin = !isNaN(yMin) ? (Math.min(yMin, f.position.y - ((animType === "atk") ? h : 0))) : (f.position.y - ((animType === "atk") ? h : 0));

        //set max
        xMax = !isNaN(xMax) ? (Math.max(xMax, f.position.x + w)) : (f.position.x + w);
        yMax = !isNaN(yMax) ? (Math.max(yMax, f.position.y + h)) : (f.position.y + h);
      });

      return data;
    });

    //store bounds
    const frameBounds = {
      x: [xMin, xMax],
      y: [yMin, yMax],
      w: (xMax - xMin),
      h: yMax - yMin,
      offset: {//add to move sprite to right/bottom, add half to center - use as needed
        x: animType === "atk" ? (xMax - xMin) * 0.125 : 0,
        y: animType === "atk" ? (yMax - yMin) * 0.20 : (yMax - yMin) * 0.40
      }
    };

    return { frameData, frameBounds };
  }

  function renderSingleFrame(frameData, targetCanvas, sourceSheets, frameBounds) {
    const origin = {
      x: targetCanvas.width / 2,
      y: targetCanvas.height / 2
    };

    const context = targetCanvas.getContext('2d');
    const tempCanvas = makeCanvas(targetCanvas.width, targetCanvas.height);

    if (self.bgColor) {
      context.fillStyle = self.bgColor;
      context.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    }

    for(let i = frameData.frame_data.length - 1; i >= 0; --i) {
      const f = frameData.frame_data[i]; // draw in reverse order
      const tempContext = tempCanvas.getContext('2d');
      const w = f.img.width, h = f.img.height;

      tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempContext.globalAlpha = f.opacity / 100;

      const flipX = f.next_type == 1 || f.next_type == 3;
      const flipY = f.next_type == 2 || f.next_type == 3;
      if (flipX || flipY || f.rotate !== 0) {
        const partCanvas = makeCanvas(w, h);
        const pContext = partCanvas.getContext('2d');

        // set flips
        pContext.translate(flipX ? w : 0, flipY ? h : 0);
        pContext.scale(flipX ? -1 : 1, flipY ? -1 : 1);

        pContext.drawImage(
          sourceSheets[f.page_id],
          f.img.x, f.img.y, w, h,
          0, 0, w, h
        );

        if (f.rotate !== 0) {
          pContext.rotate(f.rotate * Math.PI / 180);
        }

        let startX = f.position.x + origin.x + frameBounds.offset.x,
          startY = f.position.y + origin.y + frameBounds.offset.y,
          rotationOffsetX = 0, rotationOffsetY = 0, isLandscape = w > h;
        if (f.rotate !== 0) {
          tempContext.translate(startX + (w / 2), startY + (h / 2));
          tempContext.rotate(-f.rotate * Math.PI / 180);
          tempContext.translate(-(startX + (w / 2)), -(startY + (h / 2)));

          let angle = f.rotate;
          while (angle < 0) {
            angle += 360;
          }

          if (angle === 90 || angle === 270) {
            rotationOffsetY -= isLandscape ? h : 0;
            rotationOffsetX -= !isLandscape ? w : 0;
          }
        }

        tempContext.drawImage(
          partCanvas,
          0, 0, w, h,
          startX + rotationOffsetX, startY + rotationOffsetY, w, h
        );

        if (f.rotate !== 0) {
          tempContext.translate(startX + (w / 2), startY + (h / 2));
          tempContext.rotate(f.rotate * Math.PI / 180);
          tempContext.translate(-(startX + (w / 2)), -(startY + (h / 2)));
        }
      } else {
        tempContext.drawImage(
          sourceSheets[f.page_id],
          f.img.x, f.img.y, w, h,
          f.position.x + origin.x + frameBounds.offset.x, f.position.y + origin.y + frameBounds.offset.y, w, h
        );
      }

      // blend code based off of this: http://pastebin.com/vXc0yNRh
      if (f.blend_mode === 1) {
        const imgData = tempContext.getImageData(0, 0, targetCanvas.width, targetCanvas.height);
        const pixelData = imgData.data;
        for (let p = 0; p < pixelData.length; p += 4) {
          let [r, g, b, a] = [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]];
          if (a > 0) {
            const multiplier = 1 + (a * f.opacity / 100) / 255.0;
            if (f.blend_mode === 1) {
              r = Math.min(255, Math.floor(r * multiplier));
              g = Math.min(255, Math.floor(g * multiplier));
              b = Math.min(255, Math.floor(b * multiplier));
              a = Math.floor(((r + g + b) / 3) * f.opacity / 100);
            }
            if (r + g + b < 50) a = 0;

            [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]] = [r, g, b, a];
          }
        }
        tempContext.putImageData(imgData, 0, 0);
      }

      // copy result to final canvas
      context.drawImage(tempCanvas, 0, 0);
    }
  }

  function renderAllFrames() {
    for(const type of Object.keys(self.sheetFrameData.cgs)) {
      renderFramesOfType(type);
    }
  }

  function getAnimationTypes(renderedOnly = false) {
    return Object.keys(!renderedOnly ? self.sheetFrameData.cgs : self.frames);
  }

  function getNumFrames(animType) {
    if (!self.frames[animType]) {
      console.error(`Animation type of ${animType} is not found in rendered frames list`);
      throw Error("MissingAnimType");
    }
    return self.frames[animType].length;
  }

  function getFrames(animType) {
    if (!self.frames[animType]) {
      console.error(`Animation type of ${animType} is not found in rendered frames list`);
      throw Error("MissingAnimType");
    }
    return self.frames[animType];
  }

  function getFrame(animType, index) {
    if (!self.frames[animType]) {
      console.error(`Animation type of ${animType} is not found in rendered frames list`);
      throw Error("MissingAnimType");
    }
    return self.frames[animType][index];
  }

  return {
    debug,
    reset,
    addSpriteSheet,
    setSpriteSheets,
    setCGSData,
    setCGGData,
    setBGColor,
    renderFramesOfType,
    renderAllFrames,

    getAnimationTypes,
    getNumFrames,
    getFrames,
    getFrame
  };
};
