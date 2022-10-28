const fs = require('fs');
const rp = require('request-promise');

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
async function ensurePathExists (folderPath) {
	if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
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