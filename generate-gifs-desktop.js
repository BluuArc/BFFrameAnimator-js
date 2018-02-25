const argv = require('yargs')
  .usage('Usage: $0 -g [path/to/gif/folder] -u [list of "unit_id-server" separated by commas], -a [path/to/units.json] -c [background color in hex or CSS color name]')
  .default("g", 'gifs')
    .alias('g', 'gifpath')
    .describe('g', 'Folder to save all GIFs into')
  .default("units", '')
    .alias('u', 'units')
    .describe('u', 'List of unit IDs and server separated by commas. Only supported by units in Brave Frontier 1. Ex: 10011-gl,10012-jp,10013-eu')
  .default('a', '')
    .alias('a', 'advancedunits')
    .describe('a', 'JSON file containing array of info entries for units')
  .default('c', '')
    .alias('c', 'color')
    .describe('c', 'Color of the background of the animation. Can use hex (#F00) or CSS color name (red).')
  .default('n', false)
    .alias('n', 'notheadless')
  .help('h')
    .alias('h', 'help')
  .argv;

const puppeteer = require('puppeteer');
const fs = require('fs');
let browserInstance, pageInstance;

function base64BlobToGIF(base64Blob, filename = 'result.gif') {
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

async function getPageInstance() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({ headless: !argv.notheadless });
  }

  if (!pageInstance) {
    pageInstance = await browserInstance.newPage();
    await pageInstance.goto('http://localhost:5000');
  }

  return pageInstance;
}

async function closeConnection() {
  if (browserInstance || pageInstance) {
    const page = await getPageInstance();
    await browserInstance.close();
  }
  return;
}

async function getAnimations(unitInfo) {
  const id = unitInfo.id;
  const log = (...args) => console.log(`[${id}]`,...args);
  log({unitInfo});

  // check for existing files
  if (unitInfo.cgs) {
    for(const type in unitInfo.cgs) {
      const filepath = `${argv.gifpath}/unit_${unitInfo.id}_${type}.gif`;
      if (fs.existsSync(filepath)) {
        log(`Skipping ${type} as ${filepath} already exists`);
        delete unitInfo.cgs[type];
      }
    }
  
    if (Object.keys(unitInfo.cgs).length === 0) {
      log(`Skipping animation generation as cgs portion is empty`);
      throw 'EmptyCGS';
    }
  }

  console.time("animation generation");
  log('Getting animations');
  log('Getting page instance');
  const page = await getPageInstance();

  // load animations
  console.time("render time");
  log('Generating frames for', unitInfo.id);
  const types = await page.evaluate((pageUnitInfo) => {
    myApp.setUnitInfo(null);
    myApp.setBasicInfo(null);
    if (pageUnitInfo.cgg !== undefined) {
      myApp.setUnitInfo(pageUnitInfo);
    } else {
      myApp.setBasicInfo(pageUnitInfo);
    }

    return myApp.generateFrames()
      .then(() => {
        // myApp.getFrameAnimatorInstance().pause();
        return myApp.getFrameMakerInstance().getAnimationTypes();
      });
  }, unitInfo);
  console.timeEnd("render time");

  // generate gifs
  console.time("GIF creation time");
  log('Generating GIFs');
  let gifPromises = types.map(type => {
    return page.evaluate((pageType) => myApp.createGif(pageType), type)
      .then(result => {
        log('Saving GIF for',unitInfo.id, type);
        return base64BlobToGIF(result.blob, `${argv.gifpath}/${unitInfo.type || 'unit'}_${unitInfo.id}_${type}.gif`);
      });
  });

  await Promise.all(gifPromises);
  console.timeEnd("GIF creation time");
  log('Finished getting animations');
  console.timeEnd("animation generation");
}

async function createMultipleGifs(units = []) {
  const unitsToGenerate = units.slice();
  const errors = [];

  function createGifHelper(doneFn, errorFn) {
    console.log(`[Units remaining: ${unitsToGenerate.length} of ${units.length}]`);
    if (unitsToGenerate.length === 0) {
      doneFn(errors);
    } else {
      const unit = unitsToGenerate.shift();
      getAnimations(unit)
        .then(() => createGifHelper(doneFn,errorFn))
        .catch((err) => {
          errors.push({ err, unit });
          return createGifHelper(doneFn,errorFn);
        })
    }
  }

  return new Promise((fulfill, reject) => {
    createGifHelper(fulfill, reject);
  });
}


async function start() {
  console.log("Received args",argv);

  console.log("Checking existence of gif folder:", argv.gifpath);
  if (!fs.existsSync(argv.gifpath)) {
    fs.mkdirSync(argv.gifpath);
  }

  let units = [];
  if (argv.units.trim().length > 0) {
    console.log("Processing units list");
    units = argv.units.split(",")
      .map(u => {
        const [id,server] = u.split('-');
        return {
          id,
          server,
          bgColor: argv.color
        };
      });
  }

  let advancedUnits = [];
  if (argv.advancedunits.trim().length > 0) {
    console.log("Reading advanced units")
    const data = fs.readFileSync(argv.advancedunits,'utf8');
    advancedUnits = JSON.parse(data);

    if(argv.color) {
      advancedUnits = advancedUnits.map(u => {
        u.bgColor = argv.color;
        return u;
      });
    }
  }

  console.log({units, advancedUnits});

  if (units.length === 0 && advancedUnits.length === 0) {
    throw Error("No input specified");
  }

  const unitErrors = await createMultipleGifs(units);
  const advancedErrors = await createMultipleGifs(advancedUnits);

  if(unitErrors.length > 0) {
    console.log("Encountered errors with the following units");
    unitErrors.forEach(e => {
      console.log(e,e.err, e.unit);
    });
  }
  if (advancedErrors.length > 0) {
    console.log("Encountered errors with the following advanced units");
    advancedErrors.forEach(e => {
      console.log(e.err, e.unit);
    });
  }
  closeConnection();
  console.log("Done creating GIFs");
}

start();
