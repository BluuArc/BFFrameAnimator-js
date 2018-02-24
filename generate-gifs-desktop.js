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
    browserInstance = await puppeteer.launch({ headless: true });
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
  console.log({unitInfo});
  console.info('Getting animations for', unitInfo.id);
  console.log('Getting page instance');
  const page = await getPageInstance();

  // load animations
  console.log('Generating frames for', unitInfo.id);
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

  // generate gifs
  console.log('Generating GIFs for', unitInfo.id);
  let gifPromises = types.map(type => {
    return page.evaluate((pageType) => myApp.createGif(pageType), type)
      .then(result => {
        console.log('Saving GIF for',unitInfo.id, type);
        return base64BlobToGIF(result.blob, `${argv.gifpath}/unit_${unitInfo.id}_${type}.gif`);
      });
  });

  await Promise.all(gifPromises);
  console.log('Finished getting animations for', unitInfo.id);
}

async function sandbox() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5000');

  // Get the "viewport" of the page, as reported by the page.
  const result = await page.evaluate(() => {
    let unitInfo = {
      anime: ["http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/img/unit_anime_87515244.png"],
      cgg: "http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgg/unit_cgg_87515244.csv",
      cgs: {
        "idle": "http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgs/unit_idle_cgs_87515244.csv",
        "atk": "http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgs/unit_atk_cgs_87515244.csv"
      }
    };

    myApp.setUnitInfo(unitInfo);

    return myApp.generateFrames(unitInfo)
      .then(() => {
        myApp.getFrameAnimatorInstance().pause();
        return myApp.createGif('atk');
      });
  });

  console.log('Result:', result.blob);

  await base64BlobToGIF(result.blob);

  // let data = rp.get(result.link);
  // console.log({data});

  await browser.close();
}

const unitInfo = {
  id: '87515244',
  anime: ["http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/img/unit_anime_87515244.png"],
  cgg: "http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgg/unit_cgg_87515244.csv",
  cgs: {
    "idle": "http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgs/unit_idle_cgs_87515244.csv",
    "atk": "http://bf-prod-dlc-gumi-sg.akamaized.net/content/monster/cgs/unit_atk_cgs_87515244.csv"
  }
};

async function createMultipleGifs(units = []) {
  const unitsToGenerate = units.slice();
  const errors = [];

  function createGifHelper(doneFn, errorFn) {
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
    console.log("Encountered errors with the following units",unitErrors);
  }
  if (advancedErrors.length > 0) {
    console.log("Encountered errors with the following advanced units", advancedErrors);
  }
  closeConnection();
  console.log("Done creating GIFs");
}

start();
