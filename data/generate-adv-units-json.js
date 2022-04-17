const fs = require('fs');
const argv = require('yargs')
  .usage('Usage: $0 -f [folder]')
  .default("f", '')
    .alias('f', 'folder')
    .describe('g', 'Folder containing the CSVs and PNGs at the same level')
  .default('j', '')
    .alias('j', 'json')
    .describe('j', 'JSON file containing an array of file paths')
  .default('d', '')
    .alias('d', 'dataminejson')
    .describe('d', 'JSON file from a MST datamine from bfmt-data-helper')
  .help('h')
    .alias('h', 'help')
  .argv;
const path = require('path');

function getFilenames(directory) {
  return new Promise((fulfill, reject) => {
    fs.readdir(directory, (err, items) => {
      if (err) {
        reject(err);
      } else {
        fulfill(items.filter(f => f.endsWith('.csv') || f.endsWith('.png')));
      }
    });
  });
}

// input: some_file_with_params.extension
function getFileParams(file, useRegex) {
  const extension = path.extname(file);
  const filename = path.basename(file, extension);
  let type, animType, fileType, id;
  
  // [type]_[animType]_[type]_[anime-modifier]
  const params = filename.split('_');
  type = params.shift().toLowerCase(); // ex: unit, monster, partner
  const isSummoner = filename.endsWith('_L') || filename.endsWith('_U');
  if (type !== 'monster' && useRegex !== true) {
    if (params[0] === 'anime') {
      const specialEnds = ['L', 'U']
      fileType = params.shift();

      if (type === 'monster') {
        id = params.join('_');
      } else {
        if (specialEnds.indexOf(params[params.length - 1]) > -1) {
          params.pop();
        }
        id = params.pop();
      }
    } else if (params.indexOf('cgg') > -1){
      id = params.pop();
      fileType = params.pop().toLowerCase(); // ex: cgg, anime, cgs
    } else { // cgs
      id = params.pop();
      fileType = params.pop();
      animType = params.join('_').toLowerCase() || 'default'; // ex: idle, move, atk
    }
  } else {
    const remainingParamsString = params.join('_');
    fileType = ['anime', 'cgg', 'cgs'].find((type) => remainingParamsString.includes(`${type}_`) || remainingParamsString.includes(`_${type}`));
    // animType = ['atk', 'idle', 'move', 'hit'].find((type) => remainingParamsString.includes(`${type}_`) || remainingParamsString.includes(`_${type}`));
    const fileNameToTest = path.basename(file);
    if (fileType === 'anime') {
      const spritesheetRegex = isSummoner ? /anime_(.*)(\_L|\_U)+\.png$/ : /anime_(.*)\.png$/;
      id = spritesheetRegex.exec(fileNameToTest)[1];
    } else if (fileType === 'cgg') {
      id = /cgg_(.*)\.csv$/.exec(fileNameToTest)[1];
    } else { // cgs
      id = /cgs_(.*)\.csv$/.exec(fileNameToTest)[1];
      const animTypeRegex = new RegExp(`${type}_(.*)_cgs`);
      animType = animTypeRegex.exec(filename)[1];
    }
    // id = filename
    //   .replace(`${fileType}_`, '').replace(`_${fileType}`, '')
    //   .replace(animType ? `${animType}_` : '', '').replace(animType ? `_${animType}` : '', '');
  }

  return { type, animType, fileType, id, extension: extension.slice(1).toLowerCase() , fullName: file };
}

function processFileNamesForUnits(files, filePrefix, useRegexForFileParams) {
  const info = {};
  const validTypes = ['anime', 'cgs', 'cgg'];
  const validExtensions = ['csv', 'png'];
  files.map(f => getFileParams(f, useRegexForFileParams))
    .filter(f => validTypes.indexOf(f.fileType) > -1 && validExtensions.indexOf(f.extension) > -1)
    .forEach(file => {
      if (file.fileType === 'cgs') {
        console.log(`${file.fullName} ->`, file.type, file.animType, file.fileType, file.id);
      } else {
        console.log(`${file.fullName} ->`, file.type, file.fileType, file.id);
      }

      if (!info[file.id]) {
        info[file.id] = {
          id: file.id,
          anime: [],
          cgg: '',
          cgs: {},
          type: file.type
          // bgColor: '#2C2F33'
        }
      }

      const fullPath = filePrefix + file.fullName;
      if (file.fileType === 'anime') {
        info[file.id].anime.push(fullPath);
      } else if (file.fileType === 'cgg') {
        info[file.id].cgg = fullPath;
      } else if (file.fileType === 'cgs') {
        info[file.id].cgs[file.animType] = fullPath;
      } else {
        console.log("Unknown type", file);
      }
    });

  const removedEntries = [];
  const isNonEmpty = (entry) => {
    const result = entry.anime.length !== 0 && entry.cgg.length > 0 &&
      Object.keys(entry.cgs).length > 0;

    if (!result) {
      console.log("Filtering out",entry);
      removedEntries.push(entry);
    }

    return result;
  }

  console.log(info);
  const infoArray = Object.values(info).filter(isNonEmpty);
  
  return [infoArray, removedEntries];
}

async function processDirectory(directory) {
  const filePrefix = `data/${directory}/`;
  const files = await getFilenames(directory);

  const [infoArray] = processFileNamesForUnits(files, filePrefix);
  console.log(`Found ${infoArray.length} animation sets in ${directory}`);
  return infoArray;
}

function processJson(jsonPath) {
  /**
   * @type {String[]}
   */
  const fileNames = require(jsonPath);
  const [infoArray, removedArray] = processFileNamesForUnits(fileNames, '', true);
  console.log(`Found ${infoArray.length} animation sets in ${jsonPath}`);
  return [infoArray, removedArray];
}

function processDatamineJson(datamineJsonPath, actualPathsCollectionJsonPath) {
  /**
   * @type {Object[]}
   */
  const datamineJson = require(datamineJsonPath);
  /**
   * @type {String[]}
   */
  const actualPathsCollection = require(actualPathsCollectionJsonPath);

  const getCorrespondingPath = (fileName) => {
    const correspondingPath = actualPathsCollection.find((fullPath) => fullPath.endsWith(fileName));
    if (!correspondingPath) {
      console.log(`no corresponding path found for [${fileName}]`);
      return `[REPLACE_ME]/${fileName}`;
    } else {
      return correspondingPath;
    }
  };

  const info = {};
  const firstEntry = datamineJson[0];
  const SUMMONER_LOWER_SHEET_KEY = 'NgRIeeJc';
  const SUMMONER_UPPER_SHEET_KEY = 'WpFjS0PA';
  const firstEntryHasAnimationProperties = 'animationFileSpriteSheet' in firstEntry || 'animationFileCgg' in firstEntry || 'animationFileCgs' in firstEntry || 'fileByAnimationType' in firstEntry;
  if (firstEntryHasAnimationProperties) {
    datamineJson.forEach((entry) => {
      let { animationFileSpriteSheet, animationFileCgg, animationFileCgs } = entry;
      const isSummoner = !!entry[SUMMONER_LOWER_SHEET_KEY];
      const isUnitCgsMst = !!entry.fileByAnimationType;
      let allCgs;
      let id, unitType;
      if (isSummoner) {
        animationFileSpriteSheet = entry[SUMMONER_UPPER_SHEET_KEY];
        const [upperUnitType, upperSpritesheetIdentifier, ...upperIdParts] = path.basename(entry[SUMMONER_UPPER_SHEET_KEY], path.extname(entry[SUMMONER_UPPER_SHEET_KEY])).split('_');
        const upperId = upperIdParts.join('_');

        const [lowerUnitType, lowerSpritesheetIdentifier, ...lowerIdParts] = path.basename(entry[SUMMONER_LOWER_SHEET_KEY], path.extname(entry[SUMMONER_LOWER_SHEET_KEY])).split('_');
        const lowerId = lowerIdParts.join('_');
        id = `${upperId}-${lowerId}`;
        unitType = lowerUnitType; // lower and upper are identical
      } else if (isUnitCgsMst) {
        allCgs = entry.fileByAnimationType.split('|').map((entry) => { const [number, fileName] = entry.split(':'); return fileName; });
        animationFileCgs = allCgs[0];
        const isSamFile = animationFileCgs && path.extname(animationFileCgs).endsWith('sam');
        id = /_(\d)+\./.exec(path.basename(animationFileCgs))[0];
        animationFileSpriteSheet = `unit_anime${id}${isSamFile ? 'sam' : 'png'}`;
        animationFileCgg = `unit_cgg${id}${isSamFile ? 'sam' : 'csv'}`;
        unitType = 'unit';
      }
      if (!id) {
        // e.g. monster_anime_some_long_id -> some_long_id
        const [inputUnitType, spritesheetIdentifier, ...idParts] = path.basename(animationFileSpriteSheet, path.extname(animationFileSpriteSheet)).split('_');
        id = idParts.join('_');
        unitType = inputUnitType;
      }

      let currentEntry = info[id];
      if (!currentEntry) {
        currentEntry = info[id] = {
          id,
          anime: new Set(),
          cgg: '',
          cgs: {},
          type: unitType,
        };
      }

      currentEntry.anime.add(getCorrespondingPath(animationFileSpriteSheet));
      if (!path.extname(animationFileSpriteSheet).endsWith('sam')) {
        if (animationFileCgg) {
          currentEntry.cgg = getCorrespondingPath(animationFileCgg);
        }
        if (animationFileCgs) {
          const [unitType, animationType, ...otherParts] = animationFileCgs.split('_');
          currentEntry.cgs[animationType] = getCorrespondingPath(animationFileCgs);
        }

        if (isSummoner) {
          currentEntry.anime = new Set([
            getCorrespondingPath(entry[SUMMONER_LOWER_SHEET_KEY]),
            getCorrespondingPath(entry[SUMMONER_UPPER_SHEET_KEY])
          ]);
          // currentEntry.anime.add(getCorrespondingPath(entry[SUMMONER_UPPER_SHEET_KEY]));

          ['LI5euJ7T', '7CcgbUt0', 'pRKFVb2k'].forEach((key) => {
            const potentialCgsCsv = entry[key];
            if (potentialCgsCsv) {
              const [unitType, animationType, ...otherParts] = potentialCgsCsv.split('_');
              currentEntry.cgs[animationType] = getCorrespondingPath(potentialCgsCsv);
            }
          });
        } else if (isUnitCgsMst && allCgs) {
          allCgs.forEach((cgsEntry) => {
            const [unitType, animationType, ...otherParts] = cgsEntry.split('_');
            currentEntry.cgs[animationType] = getCorrespondingPath(cgsEntry);
          });
        }
      }
    });
  }

  const removedEntries = [];
  const unknownUrlEntries = [];
  const isNonEmpty = (entry) => {
    const hasEntries = entry.anime.size > 0 && entry.cgg.length > 0 &&
      Object.keys(entry.cgs).length > 0;
    const urlHasReplaceMe = (str = '') => str.startsWith('[REPLACE_ME]');
    const hasBrokenUrl = hasEntries && (
      Array.from(entry.anime).some(urlHasReplaceMe) ||
      urlHasReplaceMe(entry.cgg) ||
      Object.values(entry.cgs).some(urlHasReplaceMe)
    );

    if (!hasEntries) {
      console.log("Filtering out",entry);
      removedEntries.push(entry);
    } else if (hasBrokenUrl) {
      console.log("Filtering out",entry);
      unknownUrlEntries.push(entry);
    }

    return hasEntries && !hasBrokenUrl;
  }

  console.log(info);
  const infoArray = Object.values(info)
    .filter(isNonEmpty);
  infoArray.forEach((entry) => {
    // convert Set to Array for JSON.stringify
    entry.anime = Array.from(entry.anime);
  });

  removedEntries.forEach((entry) => {
    // convert Set to Array for JSON.stringify
    entry.anime = Array.from(entry.anime);
  });

  unknownUrlEntries.forEach((entry) => {
    // convert Set to Array for JSON.stringify
    entry.anime = Array.from(entry.anime);
  });

  return [infoArray, removedEntries, unknownUrlEntries];
}

async function processXBB() {
  const targetDirectory = './xbb';
  const filePrefix = 'data/xbb/';
  const files = await getFilenames(targetDirectory);

  const info = {};

  files.forEach(file => {
    const [filename, extension] = file.split('.');
    const params = filename.split('_');
    const id = params.pop();

    if (!info[id]) {
      info[id] = {
        id: id,
        anime: [],
        cgg: '',
        cgs: {}
      };
    }

    if (params.indexOf('cgg') > -1) {
      info[id].cgg = filePrefix + file;
    } else if (params.indexOf('anime') > -1) {
      info[id].anime.push(filePrefix + file);
    } else if (params.indexOf('cgs') > -1) {
      info[id].cgs.xbb = filePrefix + file;
    } else {
      console.log("Unknown type", file);
    }
  });

  const infoArray = Object.keys(info).map(id => info[id])
    .filter(i => i.anime.length !== 0);
  console.log(`Found ${infoArray.length} XBB animations`);
  return infoArray;
}

(async () => {
  if (argv.folder === 'xbb') {
    const arr = await processXBB();
    console.log(arr);
    fs.writeFileSync('xbb.json', JSON.stringify(arr), 'utf8');
    console.log(`Done saving files for ${arr.length} XBB animations`);
  } else if (argv.dataminejson) {
    const [infoArray, removedArray, unknownUrlEntries] = processDatamineJson(argv.dataminejson, argv.json);
    const fileName = path.basename(argv.dataminejson, path.extname(argv.dataminejson));
    fs.writeFileSync(`${fileName}-processed.json`, JSON.stringify(infoArray, null, 2), 'utf8');
    fs.writeFileSync(`${fileName}-excluded.json`, JSON.stringify(removedArray, null, 2), 'utf8');
    fs.writeFileSync(`${fileName}-unknown-urls.json`, JSON.stringify(unknownUrlEntries, null, 2), 'utf8');
    console.log(`Done saving files for ${infoArray.length + removedArray.length + unknownUrlEntries.length} animation sets found in ${argv.json}`);
  } else if (argv.json) {
    const [infoArray, removedArray] = processJson(argv.json);
    const fileName = path.basename(argv.json, path.extname(argv.json));
    fs.writeFileSync(`${fileName}-processed.json`, JSON.stringify(infoArray, null, 2), 'utf8');
    fs.writeFileSync(`${fileName}-excluded.json`, JSON.stringify(removedArray, null, 2), 'utf8');
    console.log(`Done saving files for ${infoArray.length + removedArray.length} animation sets found in ${argv.json}`);
  } else {
    const arr = await processDirectory(argv.folder);
    fs.writeFileSync(`${argv.folder}.json`, JSON.stringify(arr, null, 2), 'utf8');
    console.log(`Done saving files for ${arr.length} animation sets found in ${argv.folder}`);
  }
})()
