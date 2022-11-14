const path = require("path");
const fs = require('fs');
const argv = require('./get-cli-arguments');
const { canReachHref, ensurePathExists, base64BlobToFile, downloadFile } = require('./desktop-js/utils');
const { createPuppeteerWrapper } = require('./desktop-js/puppeteer-utils');
/**
 * @type {UnitInfo[]}
 */
const unitInput = require('./advanced-units-input');

const { getPageInstance: getPageInstanceInWrapper, closeConnection, refreshActivePageInstance } = createPuppeteerWrapper();

/**
 * @typedef {object} UnitInfo
 * @property {string} id
 * @property {string[]} anime
 * @property {string} cgg
 * @property {{ [key: string]: string }} cgs
 * @property {string} type
 * @property {object} scalingInformationByFrameByPart SAM animations only
 * @property {boolean} outputApng
 * @property {boolean} doTrim
 * @property {string} backgroundColor
 * @property {string?} server
 * @property {string?} serverHref
 * @property {string?} samJsonLocation
 */

/**
 * @typedef AnimationMetadata
 * @property {string} name
 * @property {number} numFrames
 * @property {number} width
 * @property {number} height
 * @property {object} bounds
 * @property {number} frameRate
 * @property {number[]} partCountByFrameIndex
 * @property {SheetMetadata} sheetMetadata
 */

/**
 * @typedef SheetMetadata
 * @property {string} name
 * @property {number} gameOriginX
 * @property {number} gameOriginY
 * @property {number} horizontalFrameCount
 * @property {number} verticalFrameCount
 * @property {number[]} delays in number of frames to wait
 */

let count = 0;

function serverIsActive () {
  return canReachHref(`http://localhost:${argv.port}`);
}

async function getPageInstance () {
  return getPageInstanceInWrapper(`http://localhost:${argv.port}`, { headless: !argv.notheadless })
}

/**
 * @param {import("puppeteer").Page} pageInstance
 * @param {Function} evaluationFunction
 * @param {any[]} functionArgs
 * @returns {Promise<[any, any[]]>}
 */
function evaluateOnPageWithErrorHandling (pageInstance, evaluationFunction, functionArgs) {
	const wrappedFunction = new Function(`
		return async (args) => {
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
			let result;
			try {
				result = await Promise.resolve().then(() => (${evaluationFunction.toString()})(args));
			} catch (e) {
				errorArgs = [e];
			}
			window.console.error = originalConsoleError;
			window.console.warn = originalConsoleWarn;
			window.removeEventListener('error', handleError);
			if (errorArgs) {
				throw new Error(...errorArgs);
			}
			return [result, warnings];
		}
	`)();
	return pageInstance.evaluate(wrappedFunction, functionArgs);
}

/**
 * @param {UnitInfo} unitInfo
 */
const getFileNameForUnitInfoFrame = (unitInfo, cgsType, frameIndex, delay) => `${unitInfo.type || 'unit'}_${unitInfo.id}_${cgsType}${unitInfo.backgroundColor ? `_bg-${unitInfo.backgroundColor}` : ''}-F${String.prototype.padStart.call(`${frameIndex}`, 4, '0')}-${delay}.png`;
/**
 * @param {UnitInfo} unitInfo
 * @param {string?} cgsType
 */
const getSheetFolderNameForUnitInfo = (unitInfo, cgsType) => path.join(...[
	"assets-animations",
  `${unitInfo.type || 'unit'}_${unitInfo.id}`,
  cgsType && `${cgsType}${unitInfo.backgroundColor ? `_bg-${unitInfo.backgroundColor}` : ''}`
].filter(v => !!v));
/**
 * @param {UnitInfo} unitInfo
 * @param {string} cgsType
 */
const getSheetFileNameForUnitInfo = (unitInfo, cgsType) => `${unitInfo.type || 'unit'}_${unitInfo.id}_${cgsType}${unitInfo.backgroundColor ? `_bg-${unitInfo.backgroundColor}` : ''}.png`;
/**
 * @param {UnitInfo} unitInfo
 * @param {string?} cgsType
 */
 const getGodotAnimationFolderPathForUnitInfo = (unitInfo) => path.join(
	"animations",
  `${unitInfo.type || 'unit'}_${unitInfo.id}`,
);
const replaceBackslashes = (str = '') => str.replace(/\\/g, '/');

/**
 * @param {import("puppeteer").Page} pageInstance
 * @param {UnitInfo} unitInfo
 * @returns {Promise<[AnimationMetadata[], any[]]>}
 */
function initializePageInstanceWithUnitInfo(pageInstance, unitInfo, returnValues = true) {
	/**
	 * @param {UnitInfo} pageUnitInfo
	 */
	const pageFunction = async ([pageUnitInfo, shouldReturnMapping]) => {
			window.requestIdleCallback = (fn) => window.setTimeout(() => fn(), 0);
			/**
			 * @type {import('./js/FrameMaker/index').default}
			 */
			let frameMaker;
			/**
			 * @type {HTMLImageElement[]}
			 */
			let spriteSheets;
			if (pageUnitInfo.server) { // is simplified input
				const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(pageUnitInfo.id, pageUnitInfo.server, !!pageUnitInfo.doTrim);
				frameMaker = maker;
				spriteSheets = [spritesheet];
			} else if (pageUnitInfo.serverHref) {
				const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnitOnServer(pageUnitInfo.id, pageUnitInfo.serverHref, !!pageUnitInfo.doTrim);
				frameMaker = maker;
				spriteSheets = [spritesheet];
			} else { // is advanced unit
				const { maker, spritesheets } = await FrameMaker.fromAdvancedInput(pageUnitInfo, !!pageUnitInfo.doTrim);
				frameMaker = maker;
				spriteSheets = spritesheets.slice();
			}

			/**
			 * @type {import("./js/app").default}
			 */
			const windowApp = window.app;
			windowApp._frameMaker = frameMaker;
    	windowApp._spritesheets = spriteSheets;

			const animationNames = frameMaker.loadedAnimations;
			/**
			 * @type {AnimationMetadata[]}
			 */
			let result = [];
			if (shouldReturnMapping) {
				result = await animationNames.reduce((acc, name) => {
					return acc.then(async (currentMapping) => {
						const animation = frameMaker.getAnimation(name);
						const firstFrame = await frameMaker.getFrame({
							spritesheets: spriteSheets,
							animationName: name,
							animationIndex: 0,
							cacheNewCanvases: false,
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
						const sheetMetadata = app.generateAnimationMetadataForSheet(name);
						return currentMapping.concat({
							name,
							numFrames: animation.frames.length,
							width: firstFrame.width,
							height: firstFrame.height,
							bounds: animation.bounds,
							frameRate,
							partCountByFrameIndex,
							sheetMetadata,
						});
					});
				}, Promise.resolve([]));
			}
			return result;
	};
	return evaluateOnPageWithErrorHandling(pageInstance, pageFunction, [unitInfo, returnValues]);
}

/**
 * @param {UnitInfo} unitInfo
 * @param {AnimationMetadata[]} animationMetadataEntries
 */
function generateGodotAnimationForSpritesheetOutput(unitInfo, animationMetadataEntries) {
	const godotSheetFolderPath = replaceBackslashes(getSheetFolderNameForUnitInfo(unitInfo)).replace("assets-animations", "res://assets/animations");
	const godotAnimationFolderPath = replaceBackslashes(getGodotAnimationFolderPathForUnitInfo(unitInfo));
	const outputFolderPath = path.join(argv.gifpath, getGodotAnimationFolderPathForUnitInfo(unitInfo));
	ensurePathExists(outputFolderPath);

	let spriteNodeName = `Unit${unitInfo.id}Sprite`;
	if (unitInfo.type && /^[a-zA-Z]/.test(unitInfo.type[0])) {
		spriteNodeName = `${unitInfo.type[0].toUpperCase()}${unitInfo.type.slice(1)}${unitInfo.id}Sprite`;
	}
	const spriteScriptContents = `extends BaseSprite
func _ready():
	set_animation_json("${godotSheetFolderPath}/animation.json")
`;
	const spriteControllerScriptContents = `extends BaseSpriteController
func _ready():
	set_sprite($${spriteNodeName})
`;
	const baseFileName = path.basename(outputFolderPath); // base file name is identical to name of output folder
	const externalResources = animationMetadataEntries.map(({ name: animationName }) => {
		const spritesheetPath = [
			godotSheetFolderPath,
			getSheetFileNameForUnitInfo(unitInfo, animationName),
		].join("/");
		return {
			path: spritesheetPath,
			type: "Texture"
		};
	}).concat([
		{
			path: `res://${godotAnimationFolderPath}/${baseFileName}_sprite.gd`,
			type: "Script"
		},
		{
			path: `res://${godotAnimationFolderPath}/${baseFileName}_sprite_controller.gd`,
			type: "Script"
		},
	]);

	const individualFrames = [];
	const spriteFrames = [];
	animationMetadataEntries.forEach((entry) => {
		const sheetFileName = getSheetFileNameForUnitInfo(unitInfo, entry.name);
		const sheetResourceId = externalResources.findIndex((externalResource) => externalResource.path.endsWith(sheetFileName)) + 1; // IDs are 1-indexed
		// gather individual frames as resources
		const startId = individualFrames.length + 1;
		const { width, height, numFrames, name: animationName } = entry;
		const { horizontalFrameCount } = entry.sheetMetadata;
		let xIndex = 0, yIndex = 0;
		for (let i = 0; i < numFrames; ++i) {
			individualFrames.push({
				flags: 4,
				atlas: `ExtResource( ${sheetResourceId} )`,
				region: `Rect2( ${[xIndex * width, yIndex * height, width, height].join(", ")} )`
			});
			xIndex++;
			if (xIndex >= horizontalFrameCount) {
				xIndex = 0;
				yIndex++;
			}
		}

		// define animation as SpriteFrames
		spriteFrames.push({
			frames: Array.from({ length: numFrames }).map((_, index) => `SubResource( ${index + startId} )`),
			loop: animationName !== "atk",
			name: animationName,
			speed: "60.0"
		});
	});

	// number of resources (external, individual frames and 1 for SpriteFrames) + 1 (gd_scene?)
	const loadSteps = externalResources.length + individualFrames.length + 2;
	const spriteFramesId = individualFrames.length + 1;
	const spriteControllerSceneContents = `[gd_scene load_steps=${loadSteps} format=2]

${externalResources.map((e, i) => `[ext_resource path="${e.path}" type="${e.type}" id=${i+1}]`).join("\n")}

${individualFrames.map((e, i) => `[sub_resource type="AtlasTexture" id=${i + 1}]
flags = ${e.flags}
atlas = ${e.atlas}
region = ${e.region}
`).join("\n")}
[sub_resource type="SpriteFrames" id=${spriteFramesId}]
animations = [
${spriteFrames.map((e) => `{
		"frames": [ ${e.frames.join(", ")} ],
		"loop": ${e.loop},
		"name": "${e.name}",
		"speed": ${e.speed}
}`).join(",\n")}
]

[node name="${spriteNodeName}Controller" type="CanvasLayer"]
script = ExtResource( ${externalResources.findIndex((e) => e.path === `res://${godotAnimationFolderPath}/${baseFileName}_sprite_controller.gd`) + 1} )

[node name="${spriteNodeName}" type="AnimatedSprite" parent="."]
frames = SubResource( ${spriteFramesId} )
animation = "${animationMetadataEntries[0].name}"
centered = false
script = ExtResource( ${externalResources.findIndex((e) => e.path === `res://${godotAnimationFolderPath}/${baseFileName}_sprite.gd`) + 1} )
`;

	[
		[spriteScriptContents, `${baseFileName}_sprite.gd`],
		[spriteControllerScriptContents, `${baseFileName}_sprite_controller.gd`],
		[spriteControllerSceneContents, `${baseFileName}_sprite_controller.tscn`],
	].forEach(([contents, filename]) => {
		const fileOutputPath = path.join(outputFolderPath, filename);
		console.log(`[${unitInfo.id}] Saving ${fileOutputPath}`);
		fs.writeFileSync(fileOutputPath, contents, { encoding: "utf8" });
	});
}

/**
 * @param {UnitInfo} unitInfo
 * @param {AnimationMetadata[]} animationMetadataEntries
 */
function generateGodotAnimationForIndividualFrameOutput(unitInfo, animationMetadataEntries) {
	const godotAssetFolderPath = replaceBackslashes(getSheetFolderNameForUnitInfo(unitInfo)).replace("assets-animations", "res://assets/animations");
	const godotAnimationFolderPath = replaceBackslashes(getGodotAnimationFolderPathForUnitInfo(unitInfo));
	const outputFolderPath = path.join(argv.gifpath, getGodotAnimationFolderPathForUnitInfo(unitInfo));
	ensurePathExists(outputFolderPath);
	let spriteNodeName = `Unit${unitInfo.id}Sprite`;
	if (unitInfo.type && /^[a-zA-Z]/.test(unitInfo.type[0])) {
		spriteNodeName = `${unitInfo.type[0].toUpperCase()}${unitInfo.type.slice(1)}${unitInfo.id}Sprite`;
	}
	const spriteScriptContents = `extends BaseSprite
func _ready():
	set_animation_json("${godotAssetFolderPath}/animation.json")
`;
	const spriteControllerScriptContents = `extends BaseSpriteController
func _ready():
	set_sprite($${spriteNodeName})
`;
	/**
	 * @type {Array<{ path: string, type: string }>}
	 */
	let externalResources = [];
	/**
	 * @type {{ [animationName: string]: string[] }}
	 */
	const frameFilenamesForAnimationName = {};
	const baseFileName = path.basename(outputFolderPath); // base file name is identical to name of output folder
	animationMetadataEntries.forEach(({ name: animationName }) => {
		const frameOutputFolder = path.join(argv.gifpath, getSheetFolderNameForUnitInfo(unitInfo, animationName));
		const godotFrameFolderPath = replaceBackslashes(getSheetFolderNameForUnitInfo(unitInfo, animationName)).replace("assets-animations", "res://assets/animations")
		const frameFileNames = fs.readdirSync(frameOutputFolder).sort();
		frameFilenamesForAnimationName[animationName] = frameFileNames;
		externalResources = externalResources.concat(frameFileNames.map((fileName) => ({
			path: `${godotFrameFolderPath}/${fileName}`,
			type: "Texture"
		})));
	});
	externalResources = externalResources.concat([
		{
			path: `res://${godotAnimationFolderPath}/${baseFileName}_sprite.gd`,
			type: "Script"
		},
		{
			path: `res://${godotAnimationFolderPath}/${baseFileName}_sprite_controller.gd`,
			type: "Script"
		},
	]);

	const spriteFrames = animationMetadataEntries.map(({ name: animationName }) => {
		const frameFileNames = frameFilenamesForAnimationName[animationName];
		return {
			frames: frameFileNames.map((fileName) => `ExtResource( ${externalResources.findIndex((externalResource) => externalResource.path.endsWith(fileName)) + 1} )`), // IDs are 1-indexed
			loop: animationName !== "atk",
			name: animationName,
			speed: "60.0", // TODO: grab from file name?
		}
	});

	// number of resources (external resources and 1 for SpriteFrames) + 1 (gd_scene?)
	const loadSteps = externalResources.length + 2;
	const spriteFramesId = 1; // only 1 subresource
	const spriteControllerSceneContents = `[gd_scene load_steps=${loadSteps} format=2]

${externalResources.map((e, i) => `[ext_resource path="${e.path}" type="${e.type}" id=${i+1}]`).join("\n")}

[sub_resource type="SpriteFrames" id=${spriteFramesId}]
animations = [
${spriteFrames.map((e) => `{
		"frames": [ ${e.frames.join(", ")} ],
		"loop": ${e.loop},
		"name": "${e.name}",
		"speed": ${e.speed}
}`).join(",\n")}
]

[node name="${spriteNodeName}Controller" type="CanvasLayer"]
script = ExtResource( ${externalResources.findIndex((e) => e.path === `res://${godotAnimationFolderPath}/${baseFileName}_sprite_controller.gd`) + 1} )

[node name="${spriteNodeName}" type="AnimatedSprite" parent="."]
frames = SubResource( ${spriteFramesId} )
animation = "${animationMetadataEntries[0].name}"
centered = false
script = ExtResource( ${externalResources.findIndex((e) => e.path === `res://${godotAnimationFolderPath}/${baseFileName}_sprite.gd`) + 1} )
`;

	[
		[spriteScriptContents, `${baseFileName}_sprite.gd`],
		[spriteControllerScriptContents, `${baseFileName}_sprite_controller.gd`],
		[spriteControllerSceneContents, `${baseFileName}_sprite_controller.tscn`],
	].forEach(([contents, filename]) => {
		const fileOutputPath = path.join(outputFolderPath, filename);
		console.log(`[${unitInfo.id}] Saving ${fileOutputPath}`);
		fs.writeFileSync(fileOutputPath, contents, { encoding: "utf8" });
	});
}

/**
 * @param {AnimationMetadata} animationMetadata
 * @param {UnitInfo} unitInfo
 * @param {import("puppeteer").Page} pageInstance
 */
async function generateAnimationSheet (animationMetadata, unitInfo, pageInstance) {
	console.log(`[${unitInfo.id}] Generating sprite sheet`);
	const pageFunction = async ([animationName, backgroundColor]) => {
		console.log('generating sheet', { animationName, backgroundColor });
		/**
		 * @type {import("./js/app").default}
		 */
		const windowApp = window.app;
		const result = await windowApp.frameMaker.toSheet({
			spritesheets: windowApp._spritesheets,
			animationName,
			backgroundColor,
			useTransparency: !backgroundColor,
			cacheNewCanvases: false,
			onProgressUpdate: (amt) => {
				console.log(`[${animationName}] Creating sheet [${(amt * 100).toFixed(2)}%]`);
			}
		});
		console.log('finished generating sheet', result, animationName);
		return result;
	};
	const [result, warnings] = await evaluateOnPageWithErrorHandling(pageInstance, pageFunction, [animationMetadata.name, unitInfo.backgroundColor]);
	const outputPath = path.join(
		argv.gifpath,
		getSheetFolderNameForUnitInfo(unitInfo),
		getSheetFileNameForUnitInfo(unitInfo, animationMetadata.name),
	);
	console.log(`[${unitInfo.id}] Saving sheet`, outputPath);
	await base64BlobToFile(result.blob, outputPath);
	return warnings;
}

/**
 * @param {AnimationMetadata} animationMetadata
 * @param {UnitInfo} unitInfo
 */
async function generateIndividualAnimationFrames (animationMetadata, unitInfo) {
	const log = (...args) => console.log(`[${unitInfo.id}]`, ...args);
	log(`[${unitInfo.id}] Generating individual frames`);
	const warnings = [];
	const targetFolder = path.join(argv.gifpath, getSheetFolderNameForUnitInfo(unitInfo, animationMetadata.name));
	ensurePathExists(targetFolder);

	/**
	 * @type {import("puppeteer").Page}
	 */
  let localPageInstance;
	let pixelsRenderedInPageInstance = 0;
	const refreshBrowserInstanceWithUnitInfo = async () => {
		log('Refreshing page instance');
		await refreshActivePageInstance();
		localPageInstance = await getPageInstance();
		await initializePageInstanceWithUnitInfo(localPageInstance, { ...unitInfo, bound: animationMetadata.bounds }, false);
		pixelsRenderedInPageInstance = 0;
	};
	// start with fresh instance for larger animations
	await refreshBrowserInstanceWithUnitInfo();

	const canvasSize = animationMetadata.width * animationMetadata.height;
  const DEFAULT_PART_CHUNK_SIZE = 20;
  const MAX_PIXELS_UPDATED_PER_FRAME_THRESHOLD = 10_000_000;
	/**
	 * @param {[AnimationMetadata, string?, number]} args
	 */
	const generateEntireFrame = async ([pageMetadata, backgroundColor, frameIndex]) => {
		console.log('generating frame', pageMetadata, backgroundColor, frameIndex);
		/**
		 * @type {import("./js/app").default}
		 */
		 const windowApp = window.app;
		 const originalFrame = await windowApp.frameMaker.getFrame({
			spritesheets: windowApp._spritesheets,
			animationName: pageMetadata.name,
			animationIndex: frameIndex,
			cacheNewCanvases: false,
		 });
		 let resultFrame = originalFrame;
		 if (backgroundColor) {
			resultFrame = windowApp.frameMaker.createFrameWithBackground(originalFrame, backgroundColor);
		 }
		 console.log('finished generating frame', pageMetadata);
		 const blobAsBase64 = await new Promise((fulfill, reject) => {
			resultFrame.toBlob((blob) => {
				windowApp.frameMaker._blobToBase64(blob).then(fulfill, reject);
			});
		});
		return {
			blob: blobAsBase64,
			delay: Math.floor(originalFrame.dataset.delay / 60 * 1000),
		}
	};
	/**
	 * @param {[AnimationMetadata, number, number, number]} args
	 */
	const generatePartialFrame = async ([pageMetadata, frameIndex, pagePartStartIndex, pagePartChunkSize]) => {
		console.log('generating frame', pageMetadata, frameIndex);
		/**
		 * @type {import("./js/app").default}
		 */
		 const windowApp = window.app;
		 const partialFrame = await windowApp.frameMaker.getFrame({
			spritesheets: windowApp._spritesheets,
			animationName: pageMetadata.name,
			animationIndex: frameIndex,
			cacheNewCanvases: false,
			startingPartIndex: pagePartStartIndex,
			numberOfPartsToRender: pagePartChunkSize,
		 });
		 console.log('finished generating frame', pageMetadata);
		 const blobAsBase64 = await new Promise((fulfill, reject) => {
			partialFrame.toBlob((blob) => {
				windowApp.frameMaker._blobToBase64(blob).then(fulfill, reject);
			});
		});
		return {
			blob: blobAsBase64,
			width: partialFrame.width,
			height: partialFrame.height,
			delay: Math.floor(partialFrame.dataset.delay / 60 * 1000),
		};
	};
	/**
	 * @param {[Array<{ blob: string, delay: number, width: number, height: number }>, string]} args
	 */
	const mergePartialFrames = async ([pageIntermediateBlobInfo, backgroundColor]) => {
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
				/**
				 * @type {import("./js/app").default}
				 */
				const windowApp = window.app;
				windowApp.frameMaker._blobToBase64(blob).then(fulfill, reject);
			});
		});

		return {
			blob: blobAsBase64,
			delay: pageIntermediateBlobInfo[0].delay,
		};
	};
	for (let i = 0; i < animationMetadata.numFrames; ++i) {
		const logForFrame = (...args) => log(`[${(new Date()).toLocaleTimeString()}][Frame ${i + 1}/${animationMetadata.numFrames}]`, ...args);
		const frameFilePath = path.join(targetFolder, getFileNameForUnitInfoFrame(unitInfo, animationMetadata.name, i + 1, animationMetadata.frameRate));
		if (fs.existsSync(frameFilePath)) {
			logForFrame(`Skipping generating frame as [${frameFilePath}] already exists`);
		} else {
			/**
			 * @type {{ blob: string, delay: number }}
			 */
			let blobInfoForFrame;
			let frameWarnings = [];
			const estimatedPixelsUpdatedInCurrentFrame = animationMetadata.partCountByFrameIndex[i] * 0.25 * canvasSize;
      const maxNumberOfPixelsUpdatedExceedsThreshold = estimatedPixelsUpdatedInCurrentFrame > MAX_PIXELS_UPDATED_PER_FRAME_THRESHOLD;
			if (animationMetadata.partCountByFrameIndex[i] <= DEFAULT_PART_CHUNK_SIZE && !maxNumberOfPixelsUpdatedExceedsThreshold) {
				// make entire frame in one go
				[blobInfoForFrame, frameWarnings] = await evaluateOnPageWithErrorHandling(localPageInstance, generateEntireFrame, [animationMetadata, unitInfo.backgroundColor, i]);
			} else {
				// chunk by 20 or amount of frames such that max number of pixels updated this frame is less than threshold
        let chunkSize = (maxNumberOfPixelsUpdatedExceedsThreshold && animationMetadata.partCountByFrameIndex[i] <= DEFAULT_PART_CHUNK_SIZE)
          ? Math.max(Math.floor(animationMetadata.partCountByFrameIndex[i] * (MAX_PIXELS_UPDATED_PER_FRAME_THRESHOLD / estimatedPixelsUpdatedInCurrentFrame)), 1)
          : DEFAULT_PART_CHUNK_SIZE;
				logForFrame(`Calculated chunk size ${chunkSize}`);
				/**
				 * @type {Array<{ blob: string, delay: number, width: number, height: number }>}
				 */
				const intermediateBlobInfo = [];
				let intermediateFrameWarnings = [];
				let startingPartIndex = animationMetadata.partCountByFrameIndex[i] - 1; // parts are rendered in reverse order, so start from last index
				while (startingPartIndex >= 0) {
					const partRangeMessage = chunkSize > 1
            ? `parts ${Math.max(startingPartIndex - (chunkSize - 1), 0)} to ${startingPartIndex}`
            : `part ${startingPartIndex}`;
					logForFrame(`Drawing ${partRangeMessage}`);
					let [blobInfoForCurrentChunk, intermediateFrameWarnings] = await evaluateOnPageWithErrorHandling(localPageInstance, generatePartialFrame, [animationMetadata, i, startingPartIndex, chunkSize]);
					if (intermediateFrameWarnings.length > 0) {
						frameWarnings.push({
							step: "generatePartialFrame",
							partIndexRange: [startingPartIndex - chunkSize, startingPartIndex],
							intermediateFrameWarnings,
						});
					}
					intermediateBlobInfo.push(blobInfoForCurrentChunk);

					// reset browser after every iteration
          await refreshBrowserInstanceWithUnitInfo();
          startingPartIndex -= chunkSize;
				}
				logForFrame(`Merging ${intermediateBlobInfo.length} intermediate frames`);
				[blobInfoForFrame, intermediateFrameWarnings] = await evaluateOnPageWithErrorHandling(localPageInstance, mergePartialFrames, [intermediateBlobInfo, unitInfo.backgroundColor]);
				if (intermediateFrameWarnings.length > 0) {
					frameWarnings.push({
						step: "mergePartialFrames",
						intermediateFrameWarnings,
					});
				}
			}

			logForFrame(`Saving frame`, frameFilePath);
			await base64BlobToFile(blobInfoForFrame.blob, frameFilePath);
			if (frameWarnings.length > 0) {
				warnings.push({
					frameIndex: i,
					warnings: frameWarnings,
				});
			}
			pixelsRenderedInPageInstance += animationMetadata.width * animationMetadata.height;
      if (pixelsRenderedInPageInstance > 25_000_000) {
        await refreshBrowserInstanceWithUnitInfo();
      }
		}
	}
	return warnings;
}

/**
 * @param {UnitInfo} unitInfo
 */
async function getIllustrationsForUnit (unitInfo) {
	if (!unitInfo.serverHref) {
		console.warn(`[${unitInfo.id}] Skipping getting illustrations. Must specify 'serverHref'.`);
		return;
	}
	await [
		[`unit_ills_battle_${unitInfo.id}.png`, `unit_${unitInfo.id}_ills_battle.png`],
		[`unit_ills_thum_${unitInfo.id}.png`, `unit_${unitInfo.id}_ills_thum.png`],
		[`unit_ills_full_${unitInfo.id}.png`, `unit_${unitInfo.id}_ills_full.png`],
	].reduce((acc, [serverFileName, outputFileName]) => {
		return acc.then(() => {
			const serverPath = `${unitInfo.serverHref}unit/img/${serverFileName}`;
			const outputPath = path.join(argv.gifpath, getSheetFolderNameForUnitInfo(unitInfo), outputFileName);
			console.log(`[${unitInfo.id}] Fetching image`, serverFileName);
			return downloadFile(serverPath, outputPath);
		});
	}, Promise.resolve());
}

/**
 * @param {UnitInfo} unitInfo
 */
async function getSamAssetsForUnit (unitInfo) {
	if (!unitInfo.serverHref) {
		console.warn(`[${unitInfo.id}] Skipping getting images. Must specify 'serverHref'.`);
		return;
	}

	/**
	 * @type {Buffer}
	 */
	const samJsonAsBuffer = await downloadFile(unitInfo.samJsonLocation);
	const samJson = JSON.parse(samJsonAsBuffer.toString("utf8"));
	const baseOutputPath = path.join(argv.gifpath, getSheetFolderNameForUnitInfo(unitInfo));
	await samJson.mImageVector.reduce((acc, { mImageName: fileName }) => {
		return acc.then(() => {
			const serverPath = `${unitInfo.serverHref}unit_sam/unit_${unitInfo.id}/${fileName}`;
			const outputPath = path.join(baseOutputPath, fileName);
			console.log(`[${unitInfo.id}] Fetching image`, fileName);
			return downloadFile(serverPath, outputPath);
		});
	}, Promise.resolve());

	await getIllustrationsForUnit(unitInfo);

	fs.writeFileSync(path.join(baseOutputPath, "sam_animation.json"), JSON.stringify(samJson, null, "\t"), "utf8");
}

/**
 * @param {UnitInfo} unitInfo
 */
async function createAnimationsForUnit (unitInfo) {
	const id = unitInfo.id;
	const log = (...args) => console.log(`[${id}]`, ...args);
	const warnings = [];

	ensurePathExists(path.join(argv.gifpath, getSheetFolderNameForUnitInfo(unitInfo)));

	const isSamUnit = !!unitInfo.samJsonLocation && (await canReachHref(unitInfo.samJsonLocation));
	if (isSamUnit) {
		log("Detected as SAM unit");
		console.time('image fetching');
		await getSamAssetsForUnit(unitInfo);
		console.timeEnd('image fetching');
		return warnings;
	}

	// the cgs property can be unset when using the simplified input
	if (unitInfo.cgs && Object.keys(unitInfo.cgs).length === 0) {
		log('Skipping animation generation as cgs portion is empty');
		throw new Error(`cgs field is empty for entry ${id}`);
	}

	console.time('animation generation');
  log('Getting animation metadata');
	const [animationMetadataEntries, initializationWarnings] = await initializePageInstanceWithUnitInfo(await getPageInstance(), unitInfo);

	console.time('sheet generation');
	log('Generating sheets', animationMetadataEntries);
	if (initializationWarnings.length > 0) {
    warnings.push({ initializationWarnings });
  }
	// all-or-nothing flag to more easily generate Godot animations
	const makeIndividualFrames = argv.framesonly || animationMetadataEntries.some((animationMetadata) => {
		const hasLargeCanvas = (animationMetadata.width * animationMetadata.height > 1_000_000) || (animationMetadata.width * animationMetadata.height * animationMetadata.numFrames > 100_000_000);
		const hasManyParts = animationMetadata.partCountByFrameIndex.some((count) => count > 40);
		return hasLargeCanvas || hasManyParts || animationMetadata.numFrames > 50;
	})
	await animationMetadataEntries.reduce((acc, animationMetadata) => {
		return acc.then(async () => {
			const pageInstance = await getPageInstance();
			const warningsForAnimation = await (!makeIndividualFrames
        ? generateAnimationSheet(animationMetadata, unitInfo, pageInstance)
        : generateIndividualAnimationFrames(animationMetadata, unitInfo)
      );
			if (warningsForAnimation.length > 0) {
        warnings.push({
          animationMetadata,
          warnings: warningsForAnimation,
        });
      }
		});
	}, Promise.resolve());
	console.timeEnd('sheet generation');

	console.time('text file generation');
	const animationJsonEntries = animationMetadataEntries.map((animationMetadata) => ({
		...animationMetadata.sheetMetadata,
		name: animationMetadata.name,
		filename: getSheetFileNameForUnitInfo(unitInfo, animationMetadata.name)
	}));
	const animationJsonPath = path.join(
		argv.gifpath,
		getSheetFolderNameForUnitInfo(unitInfo),
		'animation.json',
	);
	log(`Writing animation JSON to [${animationJsonPath}]`);
	fs.writeFileSync(animationJsonPath, JSON.stringify(animationJsonEntries, null, '\t'), { encoding: 'utf8' });

	if (!makeIndividualFrames) {
		await generateGodotAnimationForSpritesheetOutput(unitInfo, animationMetadataEntries);
	} else {
		await generateGodotAnimationForIndividualFrameOutput(unitInfo, animationMetadataEntries);
	}
	console.timeEnd('text file generation');

	if (unitInfo.serverHref) {
		console.time('image fetching');
		await getIllustrationsForUnit(unitInfo);
		console.timeEnd('image fetching');
	}
	console.timeEnd('animation generation');

	// reset the browser every so often to avoid hangups
  if (count > 1) {
    // await closeConnection();
    await refreshActivePageInstance();
    count = 0;
  }

	return warnings;
}

/**
 * @param {UnitInfo[]} units
 */
function createMultipleAnimations(units = []) {
	let remainingCount = units.length;
	const errors = [], warnings = [];

	return units.reduce(
		(acc, unit) =>
			acc.then(() => {
				console.log(`[Units remaining: ${remainingCount--} of ${units.length}]`);
				return createAnimationsForUnit(unit)
					.then((animationWarnings) => animationWarnings && animationWarnings.length > 0 && warnings.push({ warnings: animationWarnings, unit }))
					.catch(err => errors.push({ err, unit }));
			}),
		Promise.resolve()
	).then(() => ({ errors, warnings }));
}

async function start() {
	console.log('Checking existence of ouptut folder:', argv.gifpath);
  ensurePathExists(argv.gifpath);

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
	const results = await createMultipleAnimations(unitInput);

	const currentTime = Date.now();
  if (results.errors.length > 0) {
    console.log('Encountered errors with the following units');
    results.errors.forEach(e => {
      console.log(e.err, `\n${e.unit.id} ${e.unit.cgs ? Object.keys(e.unit.cgs) : JSON.stringify(e.unit)}`);
    });
    const errorFileName = `report-errors-${currentTime}.json`;
    console.log(`Writing errors to [${errorFileName}]`);
    fs.writeFileSync(errorFileName, JSON.stringify({
      args: argv,
      errors: results.errors.map(({ err, unit }) => ({ err: `${err}`, unit, errObject: err })),
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

	console.timeEnd('Total Generation Time');
	if (server) {
    console.log('Closing server opened on port 5000');
    server.close();
  }
}

start();