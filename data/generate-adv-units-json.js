const fs = require('fs');
const argv = require('yargs')
  .usage('Usage: $0 -f [folder]')
  .default("f", '')
    .alias('f', 'folder')
    .describe('g', 'Folder containing the CSVs and PNGs at the same level')
  .help('h')
    .alias('h', 'help')
  .argv;

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
function getFileParams(file) {
  const [filename, extension] = file.split('.');
  let type, animType, fileType, id;
  
  // [type]_[animType]_[type]_[anime-modifier]
  const params = filename.split('_');
  type = params.shift().toLowerCase(); // ex: unit, monster, partner
  if (params[0] === 'anime') {
    const specialEnds = ['L', 'U']
    fileType = params.shift();

    if (specialEnds.indexOf(params[params.length - 1]) > -1) {
      params.pop();
    }
    id = params.pop();
  } else if (params.indexOf('cgg') > -1){
    id = params.pop();
    fileType = params.pop().toLowerCase(); // ex: cgg, anime, cgs
  } else { // cgs
    id = params.pop();
    fileType = params.pop();
    animType = params.join('_').toLowerCase(); // ex: idle, move, atk
  }
  
  return { type, animType, fileType, id, extension: extension.toLowerCase() , fullName: file };
}

async function processDirectory(directory) {
  const filePrefix = `data/${directory}/`;
  const files = await getFilenames(directory);

  const info = {};
  const validTypes = ['anime', 'cgs', 'cgg'];
  const validExtensions = ['csv', 'png'];
  files.map(f => getFileParams(f))
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

  const isNonEmpty = (entry) => {
    const result = entry.anime.length !== 0 && entry.cgg.length > 0 &&
      Object.keys(entry.cgs).length > 0;

    if (!result) {
      console.log("Filtering out",entry);
    }

    return result;
  }

  console.log(info);
  const infoArray = Object.keys(info).map(id => info[id])
    .filter(isNonEmpty);
  console.log(`Found ${infoArray.length} animation sets in ${directory}`);
  return infoArray;
}
 
async function processXBB() {
  const targetDirectory = 'xbb';
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
  } else {
    const arr = await processDirectory(argv.folder);
    fs.writeFileSync(`${argv.folder}.json`, JSON.stringify(arr, null, 2), 'utf8');
    console.log(`Done saving files for ${arr.length} animation sets found in ${argv.folder}`);
  }
})()
