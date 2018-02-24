# BFFrameAnimator-js

## Requirements
* Node 8.9.4+ (lower version untested)

## Setup

1. Clone the repository
2. Run `npm install` in a terminal pointing to the directory of the repository

## Running the Server
* Run `npm run server` in a terminal pointing to the directory of the repository

## Making Batches of GIFs from the Command Line

* Server must be running in order for this to work
* Run the command `node generate-gifs-desktop.js` with any of the following parameters
  * `-g <directory>`, where directory is the folder that will hold all of the GIFs
  * `-u <list>`, where `<list>` is a list of unit IDs and server separated by commas.
    * For example:`-u 10011-gl,10012-jp,10013-eu` would get animations for 10011 using files from the Global server, 10012 using files from the JP server, and 10013 from the EU server.
    * **NOTE:** Only supported by units in Brave Frontier 1.
  * `-a <path/to/json>`, where `<path/to/json>` is a path to a JSON file containing entries for animations. A sample is available in `sample-advanced-units.json`.
    * You can specify files for other games that use similar formats (e.g. FFBE, BF2) or special units (e.g. mobs, Summoner sprites) here.
  * `-c <CSS or HEX color>`, where you can specify the color of the background of the generated GIFs using [CSS Colors](https://www.w3schools.com/cssref/css_colors.asp) or [Hex Colors](https://www.w3schools.com/colors/colors_hexadecimal.asp)
  * For example `node generate-gifs-desktop.js -a sample-advanced-units.json -c gray -g gifs-sample` would generate GIFs for the units specified in `sample-advanced-units.json` with the `gray` background color into the `gifs-sample` folder.
