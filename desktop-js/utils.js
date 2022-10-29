const fs = require('fs');
const rp = require('request-promise');
const path = require("path");

/**
 * @param {string} base64Blob
 * @param filename
 * @returns {Promise<void>}
 */
function base64BlobToFile (base64Blob, filename = 'result.gif') {
	return new Promise((fulfill, reject) => {
		const decodedBlob = Buffer.from(base64Blob, 'base64');
		fs.writeFile(filename, decodedBlob, err => {
			if (err) {
				reject(err);
			} else {
				fulfill();
			}
		});
	});
}

/**
 * @param {string} folderPath
 */
function ensurePathExists (folderPath) {
	const foldersToCheck = folderPath.split(path.sep);
	const checkedFolders = [];
	foldersToCheck.forEach((folderName) => {
		const currentFolderPath = path.join(...checkedFolders, folderName)
		if (!fs.existsSync(currentFolderPath)) {
			fs.mkdirSync(currentFolderPath);
		}
		checkedFolders.push(folderName);
	});
}

/**
 * @param {string} href
 */
function canReachHref (href) {
	return rp(href).then(() => true).catch(() => false);
}

module.exports = {
	base64BlobToFile,
	ensurePathExists,
	canReachHref,
};