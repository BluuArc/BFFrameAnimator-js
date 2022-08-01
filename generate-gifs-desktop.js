const puppeteer = require('puppeteer');
const fs = require('fs');
const rp = require('request-promise');
const execa = import('execa');
const path = require('path');

const argv = require('./get-cli-arguments');
const unitInput = require('./advanced-units-input'); // read from advanced-units-input.js

/**
 * @typedef AnimationMetadata
 * @property {string} name
 * @property {number} numFrames
 * @property {number} width
 * @property {number} height
 * @property {object} bounds
 * @property {number} frameRate
 * @property {number[]} partCountByFrameIndex
 */

let browserInstance, pageInstance;

let count = 0;

function base64BlobToFile (base64Blob, filename = 'result.gif') {
  return new Promise((fulfill, reject) => {
    const decodedBlob = Buffer.from(base64Blob, 'base64');
    fs.writeFile(filename, decodedBlob, err => {
      if (err) {
        reject(err);
      } else {
        fulfill();
      }
    });
  });
}

function serverIsActive () {
  return rp(`http://localhost:${argv.port}`).then(() => true).catch(() => false);
}

async function getPageInstance () {
  if (!browserInstance) {
    let puppeteerArgs = { headless: !argv.notheadless };
    if (!puppeteerArgs.headless) {
      puppeteerArgs.args = ['--enable-gpu-rasterization', '--window-size=500,500'];
      puppeteerArgs.defaultViewport = { width: 500, height: 500 };
    }
    browserInstance = await puppeteer.launch(puppeteerArgs);
  }

  if (!pageInstance) {
    pageInstance = await browserInstance.newPage();
    await pageInstance.goto(`http://localhost:${argv.port}`);
  }

  return pageInstance;
}

async function closeConnection () {
  if (browserInstance || pageInstance) {
    await getPageInstance();
    await browserInstance.close();
    pageInstance = null;
    browserInstance = null;
    // wait 1s for browser to fully clear itself from memory?
    await new Promise((resolve) => { setTimeout(() => resolve(), 1_000); });
  }
  return;
}

async function refreshActivePageInstance() {
  const localPageInstance = await getPageInstance();
  await localPageInstance.goto(`http://localhost:${argv.port}`);
}

const getFileNameForUnitInfo = (unitInfo, cgsType) => `${unitInfo.type || 'unit'}_${unitInfo.id}_${cgsType}${unitInfo.backgroundColor ? `_bg-${unitInfo.backgroundColor}` : ''}.gif`;
const getFileNameForUnitInfoFrame = (unitInfo, cgsType, frameIndex, delay) => `${unitInfo.type || 'unit'}_${unitInfo.id}_${cgsType}${unitInfo.backgroundColor ? `_bg-${unitInfo.backgroundColor}` : ''}-F${String.prototype.padStart.call(`${frameIndex}`, 4, '0')}-${delay}.png`;

/**
 * @param {AnimationMetadata} metadata
 */
async function generateGifThroughPage(metadata, unitInfo, pageInstance) {
  console.log(`[${unitInfo.id}] Using GIF.js`);
  const [result, warnings] = await pageInstance.evaluate(async ([pageType, backgroundColor]) => {
    let errorArgs;
    const warnings = [];
    const originalConsoleError = window.console.error;
    const originalConsoleWarn = window.console.warn;
    const handleError = function(...args) {
      originalConsoleError.apply(this, args);
      errorArgs = args;
      throw new Error(...args);
    };
    window.console.error = handleError;
    window.console.warn = function (...args) {
      originalConsoleWarn.apply(this, args);
      warnings.push(args);
    };
    window.addEventListener('error', handleError);
    /* global GIF app */
    console.log('generating gif', pageType, backgroundColor);
    const gif = await app.frameMaker.toGif({
      spritesheets: app._spritesheets,
      animationName: pageType,
      GifClass: GIF,
      backgroundColor,
      useTransparency: !backgroundColor,
      cacheNewCanvases: false,
      onProgressUpdate: (amt) => {
        console.log(`[${pageType}] Creating GIF [${(amt * 100).toFixed(2)}%]`);
      }
    });
    window.console.error = originalConsoleError;
    window.console.warn = originalConsoleWarn;
    window.removeEventListener('error', handleError);
    if (errorArgs) {
      throw new Error(...errorArgs);
    }
    console.log('finished generating gif', gif, pageType);
    return [gif, warnings];
  }, [metadata.name, unitInfo.backgroundColor]);

  const path = `${argv.gifpath}/${getFileNameForUnitInfo(unitInfo, metadata.name)}`;
  // eslint-disable-next-line no-console
  console.log(`[${unitInfo.id}] Saving GIF`, path);
  await base64BlobToFile(result.blob, path);
  return warnings;
}

async function runCommand(command = '') {
  const execaCommand = (await execa).execaCommand;
  const result = execaCommand(command);
  result.stdout.pipe(process.stdout);
  result.stderr.pipe(process.stderr);
  await result;
}

function initializePageInstanceWithUnitInfo(pageInstance, unitInfo, returnValues = true) {
  return pageInstance.evaluate(async ([pageUnitInfo, shouldReturnMapping]) => {
    let errorArgs;
    const warnings = [];
    const originalConsoleError = window.console.error;
    const originalConsoleWarn = window.console.warn;
    const handleError = function(...args) {
      originalConsoleError.apply(this, args);
      errorArgs = args;
      throw new Error(...args);
    };
    window.console.error = handleError;
    window.console.warn = function (...args) {
      originalConsoleWarn.apply(this, args);
      warnings.push(args);
    };
    window.addEventListener('error', handleError);

    window.requestIdleCallback = (fn) => window.setTimeout(() => fn(), 0);
    /**
     * @type {import('./js/FrameMaker/index').default}
     */
    let frameMaker;
    let spriteSheets;
    if (pageUnitInfo.server) { // is simplified input
      const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(pageUnitInfo.id, pageUnitInfo.server, !!pageUnitInfo.doTrim);
      frameMaker = maker;
      spriteSheets = [spritesheet];
    } else { // is advanced unit
      const { maker, spritesheets } = await FrameMaker.fromAdvancedInput(pageUnitInfo, !!pageUnitInfo.doTrim);
      frameMaker = maker;
      spriteSheets = spritesheets.slice();
    }

    app._frameMaker = frameMaker;
    app._spritesheets = spriteSheets;

    let result;
    if (shouldReturnMapping) {
      const animationNames = frameMaker.loadedAnimations;
      const animationNameToInfoMapping = await animationNames.reduce((acc, name) => {
        return acc.then(async (currentMapping) => {
          const animation = frameMaker.getAnimation(name);
          const firstFrame = await frameMaker.getFrame({
            spritesheets: spriteSheets,
            animationName: name,
            animationIndex: 0,
            cacheNewCanvases: false
          });
          const firstFrameDelay = +firstFrame.dataset.delay;
          const allFrameDelaysAreIdentical = animation.frames.every((f) => f.frameDelay === firstFrameDelay);
          const largestFrameDelay = Math.max(...animation.frames.map((f) => f.frameDelay));
          let frameRate = 60;
          if (allFrameDelaysAreIdentical && largestFrameDelay < 10) {
            frameRate = 60 / largestFrameDelay;
          }
          const partCountByFrameIndex = animation.frames.map((cgsFrame, index) => {
            const cggFrame = frameMaker._frames[cgsFrame.frameIndex];
            return cggFrame.parts.length;
          });
          return currentMapping.concat({
            name,
            numFrames: animation.frames.length,
            width: firstFrame.width,
            height: firstFrame.height,
            bounds: animation.bounds,
            frameRate,
            partCountByFrameIndex,
          });
        });
      }, Promise.resolve([]));
      result = [animationNameToInfoMapping, warnings];
    }
    window.console.error = originalConsoleError;
    window.console.warn = originalConsoleWarn;
    window.removeEventListener('error', handleError);
    if (errorArgs) {
      throw new Error(...errorArgs);
    }
    return result;
  }, [unitInfo, returnValues]);
}

/**
 * @param {AnimationMetadata} metadata
 */
 async function generateAnimationThroughFfmpeg(metadata, unitInfo, { renderGif = true } = {}) {
  console.log(`[${unitInfo.id}] Using ffmpeg`);
  const intermediateFiles = [];
  const warnings = [];
  const normalizedTempFolder = path.normalize(argv.tempfolder);

  // start with fresh instance for larger animations
  // await closeConnection();
  await refreshActivePageInstance();
  let localPageInstance = await getPageInstance();
  await initializePageInstanceWithUnitInfo(localPageInstance, { ...unitInfo, bounds: metadata.bounds }, false);
  let pixelsRenderedInPageInstance = 0;
  const refreshBrowserInstanceWithUnitInfo = async () => {
    console.log(`[${unitInfo.id}] Refreshing page instance`);
    // await closeConnection();
    await refreshActivePageInstance();
    localPageInstance = await getPageInstance();
    await initializePageInstanceWithUnitInfo(localPageInstance, { ...unitInfo, bounds: metadata.bounds }, false);
    pixelsRenderedInPageInstance = 0;
  };
  const canvasSize = metadata.width * metadata.height;
  const DEFAULT_PART_CHUNK_SIZE = 20;
  const MAX_PIXELS_UPDATED_PER_FRAME_THRESHOLD = 10_000_000;
  for (let i = 0; i < metadata.numFrames; ++i) {
    const frameFilePath = path.join(normalizedTempFolder, getFileNameForUnitInfoFrame(unitInfo, metadata.name, i + 1, metadata.frameRate));
    if (fs.existsSync(frameFilePath)) {
      console.log(`[${unitInfo.id}][${(new Date()).toLocaleTimeString()}] Skipping generating frame ${i + 1}/${metadata.numFrames} as [${frameFilePath}] already exists `);
      intermediateFiles.push(frameFilePath);
    } else {
      let blobInfoForFrame;
      // assumption: only 25% of parts at most cover the full frame
      const estimatedPixelsUpdatedInCurrentFrame = metadata.partCountByFrameIndex[i] * 0.25 * canvasSize;
      const maxNumberOfPixelsUpdatedExceedsThreshold = estimatedPixelsUpdatedInCurrentFrame > MAX_PIXELS_UPDATED_PER_FRAME_THRESHOLD;
      if (metadata.partCountByFrameIndex[i] <= DEFAULT_PART_CHUNK_SIZE && !maxNumberOfPixelsUpdatedExceedsThreshold) {
        blobInfoForFrame = await localPageInstance.evaluate(async ([pageMetadata, backgroundColor, frameIndex]) => {
          let errorArgs;
          const warnings = [];
          const originalConsoleError = window.console.error;
          const originalConsoleWarn = window.console.warn;
          const handleError = function(...args) {
            originalConsoleError.apply(this, args);
            errorArgs = args;
            throw new Error(...args);
          };
          window.console.error = handleError;
          window.console.warn = function (...args) {
            originalConsoleWarn.apply(this, args);
            warnings.push(args);
          };
          window.addEventListener('error', handleError);
          /* global GIF app */
          console.log('generating frame', pageMetadata, backgroundColor, frameIndex);
          const originalFrame = await app.frameMaker.getFrame({
            spritesheets: app._spritesheets,
            animationName: pageMetadata.name,
            animationIndex: frameIndex,
            cacheNewCanvases: false
          });
          /**
           * @type {HTMLCanvasElement}
           */
          let resultFrame;
          if (backgroundColor) {
            resultFrame = app.frameMaker.createFrameWithBackground(originalFrame, backgroundColor);
          } else {
            resultFrame = originalFrame;
          }
          window.console.error = originalConsoleError;
          window.console.warn = originalConsoleWarn;
          window.removeEventListener('error', handleError);
          if (errorArgs) {
            throw new Error(...errorArgs);
          }
          console.log('finished generating frame', pageMetadata);
          const blobAsBase64 = await new Promise((fulfill, reject) => {
            resultFrame.toBlob((blob) => {
              app.frameMaker._blobToBase64(blob).then(fulfill, reject);
            });
          });
          return {
            blob: blobAsBase64,
            delay: Math.floor(originalFrame.dataset.delay / 60 * 1000),
            warnings,
          };
        }, [metadata, unitInfo.backgroundColor, i]);
      } else {
        // console.log({
        //   partCount: metadata.partCountByFrameIndex[i],
        //   canvasSize,
        //   maxNumberOfPixelsUpdated: metadata.partCountByFrameIndex[i] * canvasSize,
        //   rawMultiplier: metadata.partCountByFrameIndex[i] * (MAX_PIXELS_UPDATED_PER_FRAME_THRESHOLD / (metadata.partCountByFrameIndex[i] * canvasSize))
        // });
        // chunk by 20 or amount of frames such that max number of pixels updated this frame is less than threshold
        let chunkSize = (maxNumberOfPixelsUpdatedExceedsThreshold && metadata.partCountByFrameIndex[i] <= DEFAULT_PART_CHUNK_SIZE)
          ? Math.max(Math.floor(metadata.partCountByFrameIndex[i] * (MAX_PIXELS_UPDATED_PER_FRAME_THRESHOLD / estimatedPixelsUpdatedInCurrentFrame)), 1)
          : DEFAULT_PART_CHUNK_SIZE;
        console.log(`[${unitInfo.id}][${(new Date()).toLocaleTimeString()}][Frame ${i + 1}/${metadata.numFrames}] Calculated chunk size ${chunkSize}`);
        const intermediateBlobInfo = [];
        let startingPartIndex = metadata.partCountByFrameIndex[i] - 1; // parts are rendered in reverse order, so start from last index
        while (startingPartIndex >= 0) {
          const partRangeMessage = chunkSize > 1
            ? `parts ${Math.max(startingPartIndex - (chunkSize - 1), 0)} to ${startingPartIndex}`
            : `part ${startingPartIndex}`;
          console.log(`[${unitInfo.id}][${(new Date()).toLocaleTimeString()}][Frame ${i + 1}/${metadata.numFrames}] Drawing ${partRangeMessage}`);
          const blobInfoForCurrentChunk = await localPageInstance.evaluate(async ([pageMetadata, frameIndex, pagePartStartIndex, pagePartChunkSize]) => {
            let errorArgs;
            const warnings = [];
            const originalConsoleError = window.console.error;
            const originalConsoleWarn = window.console.warn;
            const handleError = function(...args) {
              originalConsoleError.apply(this, args);
              errorArgs = args;
              throw new Error(...args);
            };
            window.console.error = handleError;
            window.console.warn = function (...args) {
              originalConsoleWarn.apply(this, args);
              warnings.push(args);
            };
            window.addEventListener('error', handleError);
            /* global GIF app */
            console.log('generating frame', pageMetadata, frameIndex);
            const originalFrame = await app.frameMaker.getFrame({
              spritesheets: app._spritesheets,
              animationName: pageMetadata.name,
              animationIndex: frameIndex,
              cacheNewCanvases: false,
              startingPartIndex: pagePartStartIndex,
              numberOfPartsToRender: pagePartChunkSize,
            });
            window.console.error = originalConsoleError;
            window.console.warn = originalConsoleWarn;
            window.removeEventListener('error', handleError);
            if (errorArgs) {
              throw new Error(...errorArgs);
            }
            console.log('finished generating frame', pageMetadata);
            const blobAsBase64 = await new Promise((fulfill, reject) => {
              originalFrame.toBlob((blob) => {
                app.frameMaker._blobToBase64(blob).then(fulfill, reject);
              });
            });
            return {
              blob: blobAsBase64,
              width: originalFrame.width,
              height: originalFrame.height,
              delay: Math.floor(originalFrame.dataset.delay / 60 * 1000),
              warnings,
            };
          }, [metadata, i, startingPartIndex, chunkSize]);
          if (blobInfoForCurrentChunk.warnings.length > 0) {
            warnings.push({
              frameIndex: i,
              partIndexRange: [startingPartIndex - chunkSize, startingPartIndex],
              warnings: blobInfoForCurrentChunk.warnings
            });
          }
          intermediateBlobInfo.push(blobInfoForCurrentChunk);

          // reset browser after every iteration
          await refreshBrowserInstanceWithUnitInfo();
          startingPartIndex -= chunkSize;
        }

        console.log(`[${unitInfo.id}][${(new Date()).toLocaleTimeString()}] Merging ${intermediateBlobInfo.length} intermediate frames`);
        blobInfoForFrame = await localPageInstance.evaluate(async ([pageIntermediateBlobInfo, backgroundColor]) => {
          let errorArgs;
          const warnings = [];
          const originalConsoleError = window.console.error;
          const originalConsoleWarn = window.console.warn;
          const handleError = function(...args) {
            originalConsoleError.apply(this, args);
            errorArgs = args;
            throw new Error(...args);
          };
          window.console.error = handleError;
          window.console.warn = function (...args) {
            originalConsoleWarn.apply(this, args);
            warnings.push(args);
          };
          window.addEventListener('error', handleError);

          console.log('generating frame', pageIntermediateBlobInfo, backgroundColor);

          const resultFrame = document.createElement('canvas');
          resultFrame.width = pageIntermediateBlobInfo[0].width;
          resultFrame.height = pageIntermediateBlobInfo[0].height;
          const resultFrameContext = resultFrame.getContext('2d');
          if (backgroundColor) {
            resultFrameContext.fillStyle = backgroundColor;
            resultFrameContext.fillRect(0, 0, resultFrame.width, resultFrame.height);
          }

          for (const blobInfo of pageIntermediateBlobInfo) {
            const imageForIntermediateFrame = await new Promise((fulfill, reject) => {
              const image = new Image();
              image.onload = () => fulfill(image);
              image.onerror = image.onabort = reject;
              image.src = `data:image/png;base64,${blobInfo.blob}`;
            });
            resultFrameContext.drawImage(imageForIntermediateFrame, 0, 0);
          }

          const blobAsBase64 = await new Promise((fulfill, reject) => {
            resultFrame.toBlob((blob) => {
              app.frameMaker._blobToBase64(blob).then(fulfill, reject);
            });
          });

          window.console.error = originalConsoleError;
          window.console.warn = originalConsoleWarn;
          window.removeEventListener('error', handleError);
          if (errorArgs) {
            throw new Error(...errorArgs);
          }

          return {
            blob: blobAsBase64,
            delay: pageIntermediateBlobInfo[0].delay,
            warnings,
          };
        }, [intermediateBlobInfo, unitInfo.backgroundColor]);
      }
      console.log(`[${unitInfo.id}][${(new Date()).toLocaleTimeString()}] Saving frame ${i + 1}/${metadata.numFrames}`, frameFilePath);
      await base64BlobToFile(blobInfoForFrame.blob, frameFilePath);
      intermediateFiles.push(frameFilePath);
      if (blobInfoForFrame.warnings.length > 0) {
        warnings.push({
          frameIndex: i,
          warnings: blobInfoForFrame.warnings
        });
      }
      pixelsRenderedInPageInstance += metadata.width * metadata.height;
      if (pixelsRenderedInPageInstance > 25_000_000) {
        await refreshBrowserInstanceWithUnitInfo();
      }
    }
  }
  const fileNameFormat = getFileNameForUnitInfoFrame(unitInfo, metadata.name, 0, metadata.frameRate).replace('-F0000-', '-F%04d-');
  const frameFileNameFormatWithPath = path.join(normalizedTempFolder, fileNameFormat);
  const gifPath = path.join(path.normalize(argv.gifpath), getFileNameForUnitInfo(unitInfo, metadata.name));
  const ffmpegPath = path.normalize(argv.absolutepathtoffmpeg);
  console.log(`[${unitInfo.id}] Saving animation`, gifPath);
  if (renderGif) {
    await runCommand([
      ffmpegPath,
      `-i ${frameFileNameFormatWithPath}`,
      unitInfo.backgroundColor ? '-gifflags 0' : '-gifflags 2',
      `-filter_complex`,
      [
        `[0:v]\\ fps=${metadata.frameRate},split\\ [a][b];`,
        `[a]\\ palettegen${unitInfo.backgroundColor ? '' : `=stats_mode=single`}\\ [p];`,
        `[b][p]\\ paletteuse${unitInfo.backgroundColor ? '=alpha_threshold=0': `=dither=floyd_steinberg:alpha_threshold=100:new=1`}`,
      ].join(''),
      gifPath,
    ].join(' '));
  }

  if (!unitInfo.backgroundColor) {
    await runCommand([
      ffmpegPath,
      `-framerate ${metadata.frameRate}`, // fps for input files
      `-i ${frameFileNameFormatWithPath}`,
      `-r ${metadata.frameRate}`, // fps for apng
      '-plays 0',
      '-vf setpts=PTS-STARTPTS',
      '-f apng',
      '-y', // override existing PNG if GIF is recreated
      gifPath.replace('.gif', '.png'),
    ].join(' '));

    // APNG -> WEBP
    // await runCommand([
    //   ffmpegPath, // actually "magick"
    //   '-dispose previous',
    //   `APNG:${gifPath.replace('.gif', '.png')}`,
    //   // `${frameFileNameFormatWithPath.slice(0, frameFileNameFormatWithPath.indexOf('-F%04d-'))}-*.png`,
    //   '-define webp:lossless=true',
    //   // `-delay ${metadata.frameRate / 60}`,
    //   // '-loop 0',
    //   gifPath.replace('.gif', '.webp'),
    // ].join(' '));
  }

  console.log(`[${unitInfo.id}] Cleaning up ${intermediateFiles.length} intermediate files`);
  for (const fileName of intermediateFiles) {
    fs.rmSync(fileName);
  }
  return warnings;
}

async function getAnimations (unitInfo) {
  const id = unitInfo.id;
  // eslint-disable-next-line no-console
  const log = (...args) => console.log(`[${id}]`,...args);
  const { scalingInformationByFrameByPart, ...unitInfoToLog } = unitInfo;
  log({unitInfoToLog});

  // check for existing files
  if (unitInfo.cgs) {
    let hasSkipped = false;
    for(const type in unitInfo.cgs) {
      const filepath = `${argv.gifpath}/${getFileNameForUnitInfo(unitInfo, type)}`;
      if (fs.existsSync(filepath)) {
        log(`Skipping ${type} as ${filepath} already exists`);
        delete unitInfo.cgs[type];
        hasSkipped = true;
      }
    }

    if (Object.keys(unitInfo.cgs).length === 0) {
      log('Skipping animation generation as cgs portion is empty');
      if (!hasSkipped) {
        throw new Error(`cgs field is empty for entry ${id}`);
      } else {
        return;
      }
    }
  }

  console.time('animation generation');
  log('Getting page instance');
  const page = await getPageInstance();

  // load animations
  console.time('render time');
  log('Generating frames for', unitInfo.id);
  /**
   * @type {[AnimationMetadata[], string[]]}
   */
  const [types, initializationWarnings] = await initializePageInstanceWithUnitInfo(page, unitInfo);
  console.timeEnd('render time');

  // generate gifs
  console.time('GIF creation time');
  log('Generating GIFs', types);
  const warnings = [];
  if (initializationWarnings.length > 0) {
    warnings.push({ initializationWarnings });
  }
  await types.reduce((acc, animationMetadata) => {
    // const result = await page.evaluate(async ([pageType, backgroundColor]) => {
    //   let errorArgs;
    //   const originalConsoleError = window.console.error;
    //   const handleError = function(...args) {
    //     originalConsoleError.apply(this, args);
    //     errorArgs = args;
    //     throw new Error(...args);
    //   };
    //   window.console.error = handleError;
    //   window.addEventListener('error', handleError);
    //   /* global GIF app */
    //   console.log('generating gif', pageType, backgroundColor);
    //   const gif = await app.frameMaker.toGif({
    //     spritesheets: app._spritesheets,
    //     animationName: pageType,
    //     GifClass: GIF,
    //     backgroundColor,
    //     useTransparency: !backgroundColor,
    //     cacheNewCanvases: false,
    //     onProgressUpdate: (amt) => {
    //       console.log(`[${pageType}] Creating GIF [${(amt * 100).toFixed(2)}%]`);
    //     }
    //   });
    //   window.console.error = originalConsoleError;
    //   window.removeEventListener('error', handleError);
    //   if (errorArgs) {
    //     throw new Error(...errorArgs);
    //   }
    //   console.log('finished generating gif', gif, pageType);
    //   return gif;
    // }, [type, unitInfo.backgroundColor]);

    // const path = `${argv.gifpath}/${getFileNameForUnitInfo(unitInfo, type)}`;
    // log('Saving GIF', path);
    // return base64BlobToFile(result.blob, path);
    const hasLargeCanvas = (animationMetadata.width * animationMetadata.height > 1_000_000) || (animationMetadata.width * animationMetadata.height * animationMetadata.numFrames > 100_000_000);
    const hasManyParts = animationMetadata.partCountByFrameIndex.some((count) => count > 40);
    const useFfmpeg = argv.forceffmpeg || hasLargeCanvas || hasManyParts || animationMetadata.numFrames > 50;
    return acc.then(async () => {
      const pageInstance = await getPageInstance();
      const warningsForAnimation = await (!useFfmpeg
        ? generateGifThroughPage(animationMetadata, unitInfo, pageInstance)
        : generateAnimationThroughFfmpeg(animationMetadata, unitInfo)
      );
      if (warningsForAnimation.length > 0) {
        warnings.push({
          animationMetadata,
          warnings: warningsForAnimation,
        });
      }
      if (!useFfmpeg && unitInfo.outputApng && !unitInfo.backgroundColor) {
        const warningsForAnimationApng = await generateAnimationThroughFfmpeg(animationMetadata, unitInfo, { renderGif: false });
        if (warningsForAnimationApng.length > 0) {
          warnings.push({
            animationMetadata,
            warnings: warningsForAnimationApng,
          });
        }
      }
    });
  }, Promise.resolve());

  // await Promise.all(gifPromises);
  console.timeEnd('GIF creation time');
  log('Finished getting animations');
  console.timeEnd('animation generation');
  count++;

  // reset the browser every so often to avoid hangups
  if (count > 1) {
    // await closeConnection();
    await refreshActivePageInstance();
    count = 0;
  }

  return warnings;
}

function createMultipleGifs(units = []) {
  const unitsToGenerate = units.slice();
  const errors = [];
  const warnings = [];

  return units.reduce((acc) => {
    return acc.then(() => {
      console.log(`[Units remaining: ${unitsToGenerate.length} of ${units.length}]`);
      const unit = unitsToGenerate.shift();
      return getAnimations(unit)
        .then((animationWarnings) => animationWarnings && animationWarnings.length > 0 && warnings.push({ warnings: animationWarnings, unit }))
        .catch(err => errors.push({ err, unit }));
    });
  }, Promise.resolve([]))
    .then(() => ({ errors, warnings }));
}


async function start() {
  // console.log('Received args',argv);

  console.log('Checking existence of gif folder:', argv.gifpath);
  if (!fs.existsSync(argv.gifpath)) {
    fs.mkdirSync(argv.gifpath);
  }

  if (unitInput.length === 0) {
    throw Error('No input specified');
  }

  let server;
  const isActive = await serverIsActive();
  if (!isActive) {
    console.log(`Server not found. Starting server on port ${argv.port}.`);
    server = require('./web_deployment');
  }

  console.time('Total Generation Time');
  const results = await createMultipleGifs(unitInput);

  const currentTime = Date.now();
  if (results.errors.length > 0) {
    console.log('Encountered errors with the following units');
    results.errors.forEach(e => {
      console.log(e.err, `\n${e.unit.id} ${Object.keys(e.unit.cgs)}`);
    });
    const errorFileName = `report-errors-${currentTime}.json`;
    console.log(`Writing errors to [${errorFileName}]`);
    fs.writeFileSync(errorFileName, JSON.stringify({
      args: argv,
      errors: results.errors.map(({ err, unit }) => ({ err: `${err}`, unit })),
    }, null, '\t'), { encoding: 'utf8' });
  }
  if (results.warnings.length > 0) {
    const warningfileName = `report-warnings-${currentTime}.json`;
    console.log(`Writing warnings to [${warningfileName}]`);
    fs.writeFileSync(warningfileName, JSON.stringify({
      args: argv,
      warnings: results.warnings,
    }, null, '\t'), { encoding: 'utf8' });
  }

  if (!argv.notheadless) {
    closeConnection();
  }
  console.log('Done creating GIFs');
  console.timeEnd('Total Generation Time');

  if (server) {
    console.log('Closing server opened on port 5000');
    server.close();
  }
}

start();
