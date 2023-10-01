const argv = require('yargs')
  .usage('Usage: $0 -g [path/to/gif-or-sheet/folder] -t [path/to/temp/folder] -p [portnumber]')
  .default('g', 'gifs')
  .alias('g', 'gifpath')
  .describe('g', 'Folder to save all GIFs or sheets into')
  .default('n', false)
  .alias('n', 'notheadless')
  .default('t', 'temp')
  .alias('t', 'tempfolder')
  .describe('t', 'Folder to save temp files to (when using desktop script)')
  .default('p', 5000)
  .alias('p', 'port')
  .describe('p', 'Port to host server on (or port server is hosted on)')
	.default('f', false)
	.alias('f', 'forceffmpeg')
	.alias('f', 'framesonly')
	.describe('f', 'Whether to enforce ffmpeg usage for all animations (when using desktop script) or only output individual frames (when using godot script)')
	.default('a', '')
	.alias('a', 'absolutepathtoffmpeg')
	.describe('a', 'Absolute path to the ffmpeg executable')
  .alias('s', 'sheetonly')
  .describe('w', 'Whether to output webp. If not specified, will output png by default')
  .alias('w', 'webp')
  .default('w', false)
  .describe('s', 'Whether to output sprite sheets instead of GIFs (when using desktop script)')
  .default('s', false)
  .help('h')
  .alias('h', 'help')
  .argv;

module.exports = argv;