const fs = require('fs');
const path = require('path');

/**
 * @param {string} filePath
 * @param {string} contents
 */
function saveFile(filePath, contents) {
	console.log(`Saving contents for [${filePath}]`);
	fs.writeFileSync(filePath, contents, { encoding: 'utf-8' });
}

function main() {
	// SAJSON generated from https://github.com/iammathew/SAJSON
	const saJsonFilePath = process.argv[2]; // 0 - node executable, 1 - script path
	if (!saJsonFilePath) {
		throw new Error('No file passed in. Expected: "node <script-name> <path-to-SAJSON-file>');
	}
	/**
	 * @type {string}
	 */
	let targetDirectory;
	const saJsonFilePathPathInfo = path.parse(saJsonFilePath);
	if (saJsonFilePathPathInfo.dir) {
		targetDirectory = saJsonFilePathPathInfo.dir;
	} else {
		targetDirectory = '.'; // default to current script directory
	}

	/**
	 * @type {import("./unit_anime_850198.json")}
	 */
	let json;
	try {
		json = JSON.parse(fs.readFileSync(saJsonFilePath, { encoding: 'utf-8' }));
	} catch (err) {
		console.error(err);
		throw new Error(`Error reading path [${saJsonFilePath}]`);
	}

	const fileNameWithoutExtension = path.basename(saJsonFilePath, path.extname(saJsonFilePath));
	const cggFileName = `${fileNameWithoutExtension}_cgg.csv`;
	const animationEntry = {
		id: fileNameWithoutExtension,
		sam: `SAM_IMAGE_PATH/${fileNameWithoutExtension}.sam`,
		anime: json.mImageVector.map((imageEntry) => `SAM_IMAGE_PATH/${imageEntry.mImageName}`),
		cgg: `SAJSON_PATH/${cggFileName}`,
		cgs: {},
		scalingInformationByFrameByPart: {},
	};

	const cggFrames = json.mFrames.map((frameEntry, frameIndex) => {
		const parts = frameEntry.mObjectVector.map((partEntry, partIndex) => {
			const imageEntry = json.mImageVector[partEntry.mResNum];

			const frameMatrix = partEntry.mTransform.mMatrix.m;
			const imageMatrix = imageEntry.mTransform.mMatrix.m;

			const [frameScaleX, frameScaleY] = [frameMatrix[0][0], frameMatrix[1][1]];
			const [imageScaleX, imageScaleY] = [imageMatrix[0][0], imageMatrix[1][1]];
			const scaleX = imageScaleX * frameScaleX;
			const scaleY = imageScaleY * frameScaleY;
			if (scaleX !== 1 || scaleY !== 1) {
				const scalingInfoKey = `${frameIndex}-${frameEntry.mObjectVector.length - partIndex}`; // offset to account for reversed parts
				const scaleInfoForPart = animationEntry.scalingInformationByFrameByPart[scalingInfoKey] = {};
				scaleInfoForPart.scaleX = scaleX;
				scaleInfoForPart.scaleY = scaleY;
				scaleInfoForPart.frameScaleX = frameScaleX;
				scaleInfoForPart.frameScaleY = frameScaleY;
				scaleInfoForPart.imageScaleX = imageScaleX;
				scaleInfoForPart.imageScaleY = imageScaleY;
			}
			return {
				xPositionRelativeToCenterForFrameInPx: frameMatrix[0][2] + imageMatrix[0][2],
				yPositionRelativeToCenterForFrameInPx: frameMatrix[1][2] + imageMatrix[1][2],
				flipType: 0,
				blendMode: 0,
				opacity: (partEntry.mColor.mAlpha / 255) * 100,
				rotationAngleInDegrees: 0,
				xPositionRelativeToTopLeftForSpritesheetInPx: 0,
				yPositionRelativeToTopLeftForSpritesheetInPx: 0,
				widthOfSelectionFromSpritesheetInPx: imageEntry.mWidth,
				heightOfSelectionFromSpritesheetInPx: imageEntry.mHeight,
				spritesheetIndex: partEntry.mResNum
			};
		}).reverse();

		return {
			anchorType: 0,
			numberOfParts: parts.length,
			parts
		};
	});

	/**
	 * @type {{ [animationName: string]: { frameIndex: number, xOffset: number, yOffset: number, frameDelay: number }[]}}
	 */
	const cgsFrames = {};
	json.mLabels.forEach((animationEntry) => {
		const startIndex = animationEntry.mStartFrameNum;
		const endIndex = animationEntry.mEndFrameNum;
		cgsFrames[animationEntry.mLabelName] = []
		const frames = cgsFrames[animationEntry.mLabelName];
		for (let i = startIndex; i <= endIndex; ++i) {
			frames.push({
				frameIndex: i,
				xOffset: 0,
				yOffset: 0,
				frameDelay: 60/json.mAnimRate
			});
		}
	})

	const cggRows = cggFrames.map((frameEntry) => {
		const partsAsRow = frameEntry.parts.map((part) => [
			part.xPositionRelativeToCenterForFrameInPx,
			part.yPositionRelativeToCenterForFrameInPx,
			part.flipType,
			part.blendMode,
			part.opacity,
			part.rotationAngleInDegrees,
			part.xPositionRelativeToTopLeftForSpritesheetInPx,
			part.yPositionRelativeToTopLeftForSpritesheetInPx,
			part.widthOfSelectionFromSpritesheetInPx,
			part.heightOfSelectionFromSpritesheetInPx,
			part.spritesheetIndex,
		].join(',')).join(',');
		return [
			frameEntry.anchorType,
			frameEntry.numberOfParts,
			partsAsRow
		].join(',');
	}).join('\n');
	saveFile(path.join(targetDirectory, cggFileName), cggRows, { encoding: 'utf-8' });

	Object.entries(cgsFrames).forEach(([animationName, cgsEntry]) => {
		const cgsFileName = `${fileNameWithoutExtension}_${animationName}_cgs.csv`;
		const cgsRows = cgsEntry.map((e) => [
			e.frameIndex,
			e.xOffset,
			e.yOffset,
			e.frameDelay
		].join(',')).join('\n');
		animationEntry.cgs[animationName] = `SAJSON_PATH/${cgsFileName}`;
		saveFile(path.join(targetDirectory, cgsFileName), cgsRows, { encoding: 'utf-8' });
	});

	saveFile(path.join(targetDirectory, `${fileNameWithoutExtension}_animation.json`), JSON.stringify(animationEntry, null, '\t'), { encoding: 'utf-8' });
}

main();