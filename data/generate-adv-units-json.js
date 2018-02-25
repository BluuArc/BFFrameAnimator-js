const fs = require('fs');

function getFilenames(directory) {
  return new Promise((fulfill, reject) => {
    fs.readdir(directory, (err, items) => {
      if (err) {
        reject(err);
      } else {
        fulfill(items);
      }
    });
  });
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

processXBB()
  .then(arr => {
    console.log(arr);
    fs.writeFileSync('xbb.json', JSON.stringify(arr), 'utf8');
    console.log(`Done saving files for ${arr.length} XBB animations`);
  });
