const argv = require('yargs')
  .usage('Usage: $0 -g [path/to/gif/folder]')
  .default('g', 'gifs')
  .alias('g', 'gifpath')
  .describe('g', 'Folder to save all GIFs into')
  .default('n', false)
  .alias('n', 'notheadless')
  .help('h')
  .alias('h', 'help')
  .argv;

const puppeteer = require('puppeteer');
const fs = require('fs');
const unitInput = require('./advanced-units-input'); // read from advanced-units-input.js

let browserInstance, pageInstance;

let count = 0;

function base64BlobToGIF (base64Blob, filename = 'result.gif') {
  return new Promise((fulfill, reject) => {
    const decodedBlob = new Buffer(base64Blob, 'base64');
    fs.writeFile(filename, decodedBlob, err => {
      if (err) {
        reject(err);
      } else {
        fulfill();
      }
    });
  });
}

async function getPageInstance () {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({ headless: !argv.notheadless });
  }

  if (!pageInstance) {
    pageInstance = await browserInstance.newPage();
    await pageInstance.goto('http://localhost:5000');
  }

  return pageInstance;
}

async function closeConnection () {
  if (browserInstance || pageInstance) {
    await getPageInstance();
    await browserInstance.close();
    pageInstance = null;
    browserInstance = null;
  }
  return;
}

async function getAnimations (unitInfo) {
  const id = unitInfo.id;
  // eslint-disable-next-line no-console
  const log = (...args) => console.log(`[${id}]`,...args);
  log({unitInfo});

  // check for existing files
  if (unitInfo.cgs) {
    let hasSkipped = false;
    for(const type in unitInfo.cgs) {
      const filepath = `${argv.gifpath}/unit_${unitInfo.id}_${type}.gif`;
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
  const types = await page.evaluate(async (pageUnitInfo) => {
    window.requestIdleCallback = (fn) => window.setTimeout(() => fn(), 0);
    /* global FrameMaker */
    let frameMaker, spriteSheets;
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

    const animationNames = frameMaker.loadedAnimations;
    for (const name of animationNames) {
      const animation = frameMaker.getAnimation(name);
      const numFrames = animation.frames.length;
      for (let i = 0; i < numFrames; ++i) {
        // await this._waitForIdleFrame();
        await frameMaker.getFrame({
          spritesheets: spriteSheets,
          animationName: name,
          animationIndex: i,
        });
      }
    }
    return animationNames;
    // myApp.setUnitInfo(null);
    // myApp.setBasicInfo(null);
    // if (pageUnitInfo.cgg !== undefined) {
    //   myApp.setUnitInfo(pageUnitInfo);
    // } else {
    //   myApp.setBasicInfo(pageUnitInfo);
    // }

    // return myApp.generateFrames()
    //   .then(() => {
    //     // myApp.getFrameAnimatorInstance().pause();
    //     return myApp.getFrameMakerInstance().getAnimationTypes();
    //   });
  }, unitInfo);
  console.timeEnd('render time');

  // generate gifs
  console.time('GIF creation time');
  log('Generating GIFs', types);
  const gifPromises = types.map(async type => {
    const result = await page.evaluate(async (pageType) => {
      /* global GIF app */
      const gif = await app.frameMaker.toGif({
        animationName: pageType,
        GifClass: GIF,
      });
      console.log('finished generating gif', gif, pageType);
      return gif;
    }, type);
    
    const path = `${argv.gifpath}/${unitInfo.type || 'unit'}_${unitInfo.id}_${type}.gif`;
    log('Saving GIF', path, result.url);
    return base64BlobToGIF(result.blob, path);
  });

  await Promise.all(gifPromises);
  console.timeEnd('GIF creation time');
  log('Finished getting animations');
  console.timeEnd('animation generation');
  count++;

  // reset the browser every so often to avoid hangups
  if (count > 5) {
    await closeConnection();
    count = 0;
  }
}

function createMultipleGifs(units = []) {
  const unitsToGenerate = units.slice();
  const errors = [];

  return units.reduce((acc) => {
    return acc.then(() => {
      console.log(`[Units remaining: ${unitsToGenerate.length} of ${units.length}]`);
      const unit = unitsToGenerate.shift();
      return getAnimations(unit).catch(err => errors.push({ err, unit }))
        .then(() => unitsToGenerate.length === 0 && errors);
    });
  }, Promise.resolve([]));
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

  console.time('Total Generation Time');
  const unitErrors = await createMultipleGifs(unitInput);

  if(unitErrors.length > 0) {
    console.log('Encountered errors with the following units');
    unitErrors.forEach(e => {
      console.log(e,e.err, e.unit);
    });
  }
  if (!argv.notheadless) {
    closeConnection();
  }
  console.log('Done creating GIFs');
  console.timeEnd('Total Generation Time');
}

start();
