function App() {
  const self = {
    frameMaker: new FrameMaker(),
    frameAnimator: new FrameAnimator(),
    animationContainer: null,
    generateFramesBtn: null,
    form: null,
    unitInfo: null
  };
  this.self = self;

  function init() {
    self.animationContainer = $("#animation-container");
    self.generateFramesBtn = $("button#generate-frames-btn");
    self.form = $("#animation-options");
    
    self.frameAnimator.setStageCanvas(self.animationContainer.find('canvas#stage').get(0));
    
    self.generateFramesBtn.on('click', () => {
      self.unitInfo = null;
      self.frameAnimator.pause(false);
      generateFrames();
    });

    console.info('Ready!');
  }

  function setUnitInfo(info) {
    self.unitInfo = info;
  }

  function getUnitInfo() {
    return self.unitInfo;
  }

  function loadSpritesheets(sheetArr) {
    const loadSpritesheet = (url) => {
      return new Promise((fulfill, reject) => {
        const img = document.createElement('img');

        img.onload = () => fulfill(img);
        img.onerror = img.onabort = (err) => reject(err);

        img.setAttribute('src', `/getImage/${encodeURIComponent(url)}`);
      });
    };
    
    const domSheets = [];
    const loadPromises = sheetArr.map(sheetUrl => {
      return loadSpritesheet(sheetUrl)
        .then(domImg => { domSheets.push(domImg); return; });
    });

    return Promise.all(loadPromises)
      .then(() => domSheets);
  }

  function loadCSV(path) {
    return new Promise((fulfill, reject) => {
      $.get(`/get/${encodeURIComponent(path)}`)
        .done(data => {
          try {
            const csv = data.split('\n').map(line => line.split(','));
            fulfill(csv);
          } catch (err) { reject(err); }
        }).fail(err => reject(err));
    });
  }

  function processCGG(data) {
    return data.map(frame => {
      if (frame.length < 2) {
        console.warn("encountered empty frame in CGG, skipping");
        return null;
      }

      const parsedFrame = {};
      parsedFrame.anchorType = +frame[0];
      parsedFrame.part_count = +frame[1];
      parsedFrame.frame_data = [];

      let curIndex = 2, partCount = 0;
      while (partCount < +parsedFrame.part_count) {
        const partInfo = {};
        partInfo.position = { //origin is middle
          x: +frame[curIndex++],
          y: +frame[curIndex++]
        };
        partInfo.next_type = +frame[curIndex++];
        partInfo.blend_mode = +frame[curIndex++];
        partInfo.opacity = +frame[curIndex++];
        partInfo.rotate = +frame[curIndex++];
        partInfo.img = { //origin is top left
          x: +frame[curIndex++],
          y: +frame[curIndex++],
          width: +frame[curIndex++],
          height: +frame[curIndex++],
        };
        partInfo.page_id = +frame[curIndex++];

        let isValid = true;
        for (const field in partInfo) {
          if (field !== "position" && field !== "img" && isNaN(partInfo[field])) {
            isValid = false;
          }
        }
        if (isValid) {
          partCount++;
          parsedFrame.frame_data.push(partInfo);
        } else {
          console.warn("NaN issue with", partInfo, parsedFrame);
        }
      }

      return parsedFrame;
    });
  }

  function processCGS(data) {
    return data.map(frame => {
      const frameInfo = {};
      frameInfo.frame_index = +frame[0];
      frameInfo.x_pos_offset = +frame[1];
      frameInfo.y_pos_offset = +frame[2];
      frameInfo.frame_delay = +frame[3];

      let isValid = true;
      for (let f in frameInfo) {
        if (isNaN(frameInfo[f])) {
          isValid = false;
        }
      }

      if (isValid) {
        return frameInfo;
      } else {
        console.warn('Ignoring NaN CGS line', frameInfo);
        return null;
      }
    }).filter(frame => frame !== null);
  }

  function loadAnimationData(cgg, cgs, result) {
    const cggP = loadCSV(cgg).then(data => {
      console.debug({cgg: data});
      result.cgg = processCGG(data);
    }).catch(err => {
      console.warn(`Error loading CGG due to error`, cgg, err);
      throw err;
    });
    
    const cgsPs = [];
    for(const type in cgs) {
      const curPromise = loadCSV(cgs[type])
        .then(data => {
          result.cgs[type] = processCGS(data);
        }).catch(err => {
          console.warn(`Skipping loading CGS type ${type} due to error`,err);
          delete result.cgs[type];
          return;
        });
      cgsPs.push(curPromise);
    }

    return Promise.all([cggP, ...cgsPs])
      .then(() => {
        console.debug(result);
      });
  }

  function getAnimationInfo(animationUrls) {
    console.debug(animationUrls);
    const fullInfo = {
      sheets: [],
      sheetFrameData: {
        cgg: [],
        cgs: {
          idle: [],
          atk: [],
          move: []
        }
      }
    };

    console.info("Loading spritesheets");
    console.debug(animationUrls.anime);
    const loadSheetsP = loadSpritesheets(animationUrls.anime)
      .then(sheets => { fullInfo.sheets = sheets; })

    return loadSheetsP.catch(err => {
      console.error('Error loading spritesheet(s)', err);
      throw Error("SpritesheetLoad");
    }).then(() => {
      console.info('Loading animation files', animationUrls.cgg, animationUrls.cgs);
      return loadAnimationData(animationUrls.cgg, animationUrls.cgs, fullInfo.sheetFrameData);
    }).then(() => {
      if (animationUrls.bgColor) {
        fullInfo.bgColor = animationUrls.bgColor;
      }
      console.debug({fullInfo: fullInfo});
      return fullInfo;
    });
  }

  function isBasicInfoValid(basicInfo = {}) {
    const validServers = ['gl', 'eu', 'jp'];
    if (!basicInfo.id || basicInfo.id.length === 0 || isNaN(basicInfo.id)) {
      console.error('Invalid ID', basicInfo.id);
      return false;
    } else if (!basicInfo.server || validServers.indexOf(basicInfo.server) === -1) {
      console.error('Invalid Server', basicInfo.server);
      return false;
    }

    return true;
  }

  function getUnitInfoFromForm() {
    const basicInfo = {
      id: self.form.find("#unit-id input").val().trim(),
      server: self.form.find("#server-selection input:checked").val(),
      bgColor: self.form.find('input#bg-option').val()
    };

    if (!basicInfo.bgColor) {
      delete basicInfo.bgColor;
    }

    console.debug({basicInfo});

    if (!isBasicInfoValid(basicInfo)) {
      throw Error("Basic info isn't valid");
    } else {
      self.unitInfo = generateUrls(basicInfo);
    }
  }

  function generateUrls(basicInfo) {
    const animationUrls = {
      anime: [],
      cgg: undefined,
      cgs: {
        idle: undefined,
        atk: undefined,
        move: undefined
      }
    };

    const servers = {
      eu: "http://static-bravefrontier.gumi-europe.net/content/",
      gl: "http://2.cdn.bravefrontier.gumi.sg/content/",
      jp: "http://cdn.android.brave.a-lim.jp/",
    };

    const filepaths = {
      cgg: "unit/cgg/",
      cgs: "unit/cgs/",
      anime: "unit/img/"
    };

    const prefixUrl = servers[basicInfo.server];
    const cgsPrefix = `${prefixUrl}${filepaths.cgs}`;

    if (basicInfo.server === 'eu') {
      animationUrls.cgs.skill = undefined;
    }

    animationUrls.anime.push(`${prefixUrl}${filepaths.anime}unit_anime_${basicInfo.id}.png`);
    animationUrls.cgg = `${prefixUrl}${filepaths.cgg}unit_cgg_${basicInfo.id}.csv`;

    for(const type in animationUrls.cgs) {
      animationUrls.cgs[type] = `${cgsPrefix}unit_${type}_cgs_${basicInfo.id}.csv`;
    }

    if (basicInfo.bgColor) {
      animationUrls.bgColor = basicInfo.bgColor;
    }

    return animationUrls;
  }

  function isUnitInfoValid(unitInfo = {}) {
    if (!unitInfo.anime || !Array.isArray(unitInfo.anime) || unitInfo.anime.length === 0) {
      console.error('Invalid spritesheet field', unitInfo.anime);
      return false;
    } else if (!unitInfo.cgg) {
      console.error('Invalid cgg field', unitInfo.cgg);
      return false;
    } else if (!unitInfo.cgs || Object.keys(unitInfo.cgs).length === 0) {
      console.error('Invalid cgs field', unitInfo.cgs);
      return false;
    }

    return true;
  }

  function generateFrames() {
    if (!self.unitInfo) {
      getUnitInfoFromForm();
    }
    console.debug(self.unitInfo);

    if (!isUnitInfoValid(self.unitInfo)) {
      throw Error('Unit info isn\'t valid');
    }

    return getAnimationInfo(self.unitInfo)
      .then(animationInfo => {
        self.frameMaker.reset();
        self.frameMaker.setSpriteSheets(animationInfo.sheets);
        self.frameMaker.setCGGData(animationInfo.sheetFrameData.cgg);
        self.frameMaker.setCGSData(animationInfo.sheetFrameData.cgs);
        self.frameMaker.setBGColor(animationInfo.bgColor);
        self.frameMaker.debug();

        self.frameMaker.renderAllFrames();

        console.info("Finished rendering frames");
        self.frameMaker.debug();

        playFrames('atk');
      })
  }

  function getFrameMakerInstance() {
    return self.frameMaker;
  }

  function getFrameAnimatorInstance() {
    return self.frameAnimator;
  }

  function playFrames(animType) {
    const frames = self.frameMaker.getFrames(animType);
    const sampleFrame = frames[0];

    console.debug({ sampleFrame });

    self.frameAnimator.setCanvasDimensions(sampleFrame.width, sampleFrame.height);
    self.frameAnimator.setAnimationState({
      framesUntilRedraw: sampleFrame.$frameMakerData.delay,
      currentFrameIndex: 0,
      frames: frames,
      lastKnownDelay: sampleFrame.$frameMakerData.delay,
      isPlaying: false,
      speed: 1
    });

    self.frameAnimator.setCallbackFunctions({
      onAnimStart: (state) => console.debug('started!', state),
      // afterRedraw: (state) => console.debug('drew frame', state.frameIndex, state),
      onAnimEnd: (state) => console.debug('ended!', state)
    })

    self.frameAnimator.play();
  }

  return {
    init,
    setUnitInfo,
    getUnitInfo,
    generateFrames,
    getFrameMakerInstance,
    getFrameAnimatorInstance,
    playFrames
  };
}
