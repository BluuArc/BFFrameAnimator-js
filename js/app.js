function App() {
  const self = {
    frameMaker: new FrameMaker(),
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

    self.generateFramesBtn.on('click', () => {
      self.unitInfo = null;
      generateFrames();
    });
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
      console.debug({fullInfo: fullInfo});
      return fullInfo;
    });
  }

  function isBasicInfoValid(basicInfo = {}) {
    const validServers = ['gl', 'eu', 'jp'];
    if (!basicInfo.id || basicInfo.id.length === 0 || isNaN(basicInfo.id)) {
      return false;
    } else if (!basicInfo.server || validServers.indexOf(basicInfo.server) === -1) {
      return false;
    }

    return true;
  }

  function getUnitInfoFromForm() {
    const basicInfo = {
      id: self.form.find("#unit-id input").val().trim(),
      server: self.form.find("#server-selection input[checked='checked']").val()
    };

    if (!isBasicInfoValid(basicInfo)) {
      console.error("Basic info isn't valid.", basicInfo);
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

    return animationUrls;
  }

  function generateFrames() {
    if (!self.unitInfo) {
      getUnitInfoFromForm();
    }
    console.debug(self.unitInfo);

    return getAnimationInfo(self.unitInfo)
      .then(animationInfo => {
        self.frameMaker.reset();
        self.frameMaker.setSpriteSheets(animationInfo.sheets);
        self.frameMaker.setCGGData(animationInfo.sheetFrameData.cgg);
        self.frameMaker.setCGSData(animationInfo.sheetFrameData.cgs);
        self.frameMaker.debug();

        self.frameMaker.renderAllFrames();

        console.info("Finished rendering frames");
        self.frameMaker.debug();
      })
  }

  function getFrameMakerInstance() {
    return self.frameMaker;
  }

  return {
    init,
    setUnitInfo,
    getUnitInfo,
    generateFrames,
    getFrameMakerInstance
  };
}
