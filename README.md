# BFFrameAnimator-js

A JavaScript version of the original [BFFrameAnimator](https://github.com/BluuArc/BFFrameAnimator)

## Requirements
* Node 8.9.4+ (lower version untested) + NPM
* Latest version of Chrome or Firefox (works better and faster in Chrome)

## Setup

1. Clone the repository
2. Run `npm install` in a terminal pointing to the directory of the repository

## Running the Server

* Run `npm run start` in a terminal pointing to the directory of the repository

## Making Batches of GIFs from the Command Line

* ~~Server must be running in order for this to work~~
  * As of v2 (released December 2018), the script will attempt to start the server if it is not already running
* Edit the contents of `advanced-units-input.js` to generate the desired GIFs
* Run the command `npm run generate-gifs` with any of the following parameters
  * `-g <directory>`, where directory is the folder that will hold all of the GIFs
    * defaults to `gifs`  
  * For example `npm run generate-gifs -- -g gifs-sample` would generate GIFs for the units specified in `advanced-units-input.js` into the `gifs-sample` folder.
    * The script will ignore any files already existing in the folder for easier resuming, so be sure to remove the relevant files you want to be regenerated
