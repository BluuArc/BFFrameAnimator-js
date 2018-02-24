function App() {
  const self = {
    frameMaker: new FrameMaker(),
    frameAnimator: new FrameAnimator(),
    animationContainer: null,
    controlBtns: null,
    typeBtns: null,
    generateFramesBtn: null,
    form: null,
    unitInfo: null,
    basicInfo: null,
    notification: {
      topBar: null,
      bottomBar: null,
      textArea: null
    }
  };
  this.self = self;

  function notify(topProgress, bottomProgress, messageContent, messageHeader, messageColor) {

    if (self.notification.topBar) {
      if (topProgress === undefined && messageColor !== 'red') {
        // keep previous progress
      } else if (isNaN(topProgress) && messageColor !== 'red') {
        self.notification.topBar.hide();
      } else {
        self.notification.topBar.show();
        if (topProgress > -1 && messageColor !== 'red') {
          self.notification.topBar.removeClass('error');
          self.notification.topBar.progress({ percent: topProgress });
          if (topProgress === 100) {
            self.notification.topBar.addClass('success');
          } else {
            self.notification.topBar.removeClass('success');
          }
        } else {
          if (topProgress < 0) {
            self.notification.topBar.progress({ percent: 100 });
          }
          self.notification.topBar.addClass('error');
        }
      }
    }

    if (self.notification.bottomBar) {
      if (bottomProgress === undefined && messageColor !== 'red') {
        // keep previous progress
      } else if (isNaN(bottomProgress) && messageColor !== 'red') {
        self.notification.bottomBar.hide();
      } else {
        self.notification.bottomBar.show();
        if (bottomProgress > -1 && messageColor !== 'red') {
          self.notification.bottomBar.removeClass('error');
          self.notification.bottomBar.progress({ percent: bottomProgress });
          if (topProgress === 100) {
            self.notification.bottomBar.addClass('success');
          } else {
            self.notification.bottomBar.removeClass('success');
          }
        } else {
          if (bottomProgress < 0) {
            self.notification.bottomBar.progress({ percent: 100 });
          }
          self.notification.bottomBar.addClass('error');
        }
      }
    }


    if (self.notification.textArea) {
      self.notification.textArea.find('.header').html(messageHeader || '');
      self.notification.textArea.find('#content').html(messageContent);
      
      self.notification.textArea.attr('class', 'ui message');
      if(messageColor) {
        self.notification.textArea.addClass(messageColor);
      }
    }

  }

  function init() {
    self.animationContainer = $("#animation-container");
    self.controlBtns = self.animationContainer.find("#controls");
    self.typeBtns = self.animationContainer.find("#animation-type");
    self.generateFramesBtn = $("button#generate-frames-btn");
    self.form = $("#animation-options");

    self.notification.topBar = $('#notification-area .top.attached.progress').progress({ percent: 0 });
    self.notification.bottomBar = $('#notification-area .bottom.attached.progress').progress({ percent: 0 });
    self.notification.textArea = $('#notification-area .message');
    
    self.frameAnimator.setStageCanvas(self.animationContainer.find('canvas#stage').get(0));
    
    self.generateFramesBtn.on('click', () => {
      self.unitInfo = null;
      self.frameAnimator.pause(false);
      generateFrames();
    });

    self.controlBtns.find("#play").on('click', self.frameAnimator.play);
    self.controlBtns.find("#pause").on('click', self.frameAnimator.pause);
    self.controlBtns.find("#generate").on('click', () => createGif());
    self.controlBtns.find('#download').hide();

    self.controlBtns.hide();
    self.typeBtns.hide();

    console.info('Ready!');
    notify(NaN, NaN, 'Please enter your animation options then click "Generate"', 'Ready!');
  }

  function setUnitInfo(info) {
    self.unitInfo = info;
  }

  function getUnitInfo() {
    return self.unitInfo;
  }

  function setBasicInfo(info) {
    self.basicInfo = info;
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

    const numSteps = sheetArr.length;
    let numFinished = 0;

    const domSheets = [];
    const loadPromises = sheetArr.map((sheetUrl,index) => {
      return loadSpritesheet(sheetUrl)
        .then(domImg => {
          domSheets[index] = domImg;
          notify((++numFinished / numSteps)*100, undefined, 'Getting spritesheets...', 'Processing...');
          return;
        });
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

          if (result.cgs[type].length === 0) {
            throw Error("Array length is 0");
          }
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
    notify(NaN, NaN, 'Getting spritesheets...', 'Processing...');
    const fullInfo = {
      sheets: [],
      sheetFrameData: {
        cgg: [],
        cgs: {}
      }
    };

    console.info("Loading spritesheets");
    console.debug(animationUrls.anime);
    const loadSheetsP = loadSpritesheets(animationUrls.anime)
      .then(sheets => { fullInfo.sheets = sheets; })

    return loadSheetsP.catch(err => {
      console.error('Error loading spritesheet(s)', err);
      notify(undefined, undefined, 'Error getting spritesheets. Please check your URLs and/or unit ID.', 'Error', 'red');
      throw Error("SpritesheetLoad");
    }).then(() => {
      notify(undefined, 1 / 2 * 100, 'Downloading and extracting unit information...', 'Processing...');
      console.info('Loading animation files', animationUrls.cgg, animationUrls.cgs);
      return loadAnimationData(animationUrls.cgg, animationUrls.cgs, fullInfo.sheetFrameData);
    }).then(() => {
      notify(undefined, 2 / 2 * 100, 'Downloading and extracting unit information...', 'Processing...');
      if (animationUrls.bgColor) {
        fullInfo.bgColor = animationUrls.bgColor;
      }
      
      console.debug({fullInfo: fullInfo});
      return fullInfo;
    }).catch(err => {
      console.error(err);
      notify(undefined, undefined, 'Error getting unit information. Please check your URLs and/or unit ID.');
      throw err;
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

  function getBasicInfoFromForm() {
    notify(NaN, NaN, 'Reading form information...','Processing...');
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
      notify(-1, -1, 'Form input isn\'t valid. Please try again.' , 'Error', 'red');
      throw Error("Basic info isn't valid");
    } else {
      self.basicInfo = basicInfo;
    }
  }

  function generateUrls(basicInfo) {
    notify(NaN, NaN, 'Generating URLs...', 'Processing...');
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
      if(!self.basicInfo) {
        getBasicInfoFromForm();
      }
      self.unitInfo = generateUrls(self.basicInfo);
    }
    console.debug(self.unitInfo);

    // mainly applies for cases with custom unit info
    if (!isUnitInfoValid(self.unitInfo)) {
      notify(-1, -1, 'Unit information isn\'t valid. Please try again.', 'Error', 'red');
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

        const types = Object.keys(animationInfo.sheetFrameData.cgs);
        let numFinished = 0;

        for(const type of types) {
          let progress = numFinished / types * 100;
          notify(progress, progress, `Creating frames for animation type ${type}`, 'Generating Frames');

          try {
            self.frameMaker.renderFramesOfType(type);
          } catch (err) {
            console.error("Error generating frames for", type, err);
            notify(undefined, undefined, `Error generating frames for type ${type}`, 'Error');
            throw err;
          }

          progress = ++numFinished / types * 100;
          notify(progress, progress, `Creating frames for animation type ${type}`, 'Generating Frames');
        }

        self.frameMaker.renderAllFrames();

        console.info("Finished rendering frames");
        notify(100, 100, `Finished generating frames.`, 'Complete', 'green');
        self.frameMaker.debug();

        // add buttons
        self.typeBtns.find(".ui.button").remove();
        for (const type in animationInfo.sheetFrameData.cgs) {
          const button = $(document.createElement('button'));
          button.addClass('ui button');
          button.text(type);

          button.on('click', () => {
            self.frameAnimator.pause();

            self.controlBtns.find('#download').hide();
            self.controlBtns.find('#generate').show();

            requestAnimationFrame(() => playFrames(type));
          });
          self.typeBtns.append(button);
        }

        self.typeBtns.show();
        self.controlBtns.show();

        // play first animation by default
        playFrames(Object.keys(animationInfo.sheetFrameData.cgs)[0]);
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

    self.animationContainer.find('canvas#stage').attr('anim-type', animType);

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
      onAnimEnd: (state) => console.debug('ended!', state)
      // afterRedraw: (state) => console.debug('drew frame', state.frameIndex, state),
    })

    self.frameAnimator.play();
  }

  function blobToBase64(blob) {
    return new Promise((fulfill, reject) => {
      const reader = new FileReader();
      reader.onload = function () {
        const dataUrl = reader.result;
        const base64 = dataUrl.split(',')[1];
        fulfill(base64);
      };
      reader.readAsDataURL(blob);
    })
  }

  function createGif(type, useTransparency) {
    return new Promise((fulfill, reject) => {
      if (!type) {
        type = self.animationContainer.find('canvas#stage').attr('anim-type');
      }

      if (!type) {
        notify(-1, -1, 'Error creating GIF', 'Error', 'red');
        throw Error("No type defined for GIF");
      }

      if (useTransparency === undefined) {
        useTransparency = self.unitInfo.bgColor === undefined;
      }

      self.controlBtns.find('#generate').prop('disabled', true);
      self.controlBtns.find('#download').prop('disabled', true).hide();
      const frames = self.frameMaker.getFrames(type);
      const gifOptions = {
        workerScript: 'js/gif.worker.js',
        copy: true,
        quality: 1,
        transparent: useTransparency ? 'rgba(0,0,0,0)' : undefined
      };

      //based off of https://github.com/jnordberg/gif.js/issues/52
      // and https://github.com/jnordberg/gif.js
      const gif = new GIF(gifOptions);
      frames.forEach(frame => {
        const delay = frame.$frameMakerData.delay;
        gif.addFrame(frame, { delay: Math.floor(delay / 60 * 1000) })
      });

      console.info('Creating GIF');
      console.debug(gif);
      notify(0, 0, 'Creating GIF...', 'Processing...');

      gif.on('progress', amt => {
        console.debug('GIF progress', (amt*100).toFixed(2));
        notify(amt * 100, amt * 100, 'Creating GIF...', 'Processing...');
      });

      gif.on('finished', (blob) => {
        console.info('Done creating GIF');
        notify(100, 100, 'Finished Making GIF', 'Complete', 'green');
        console.debug({blob});
        self.controlBtns.find('#generate').prop('disabled', false).hide();
        self.controlBtns.find('#download').attr('href', URL.createObjectURL(blob))
          .show();

        blobToBase64(blob)
          .then((encodedBlob) => {
            fulfill({
              blob: encodedBlob,
              link: URL.createObjectURL(blob)
            });
          })
      });

      gif.render();
    });
  }

  return {
    init,
    setUnitInfo,
    getUnitInfo,
    setBasicInfo,
    generateFrames,
    getFrameMakerInstance,
    getFrameAnimatorInstance,
    playFrames,
    createGif
  };
}
