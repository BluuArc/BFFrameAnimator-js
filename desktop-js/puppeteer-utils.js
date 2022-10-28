const puppeteer = require('puppeteer');

function createPuppeteerWrapper() {
	/**
	 * @type {puppeteer.Browser}
	 */
	let browserInstance;
	/**
	 * @type {puppeteer.Page}
	 */
	let pageInstance;

	/**
	 * @type {string}
	 */
	let startingUrl;

	async function getPageInstance (inputStartingUrl = startingUrl, { headless = true } = {}) {
		if (inputStartingUrl !== startingUrl) {
			startingUrl = inputStartingUrl;
		}
		if (!browserInstance) {
			let puppeteerArgs = { headless };
			if (!puppeteerArgs.headless) {
				puppeteerArgs.args = ['--enable-gpu-rasterization', '--window-size=500,500'];
				puppeteerArgs.defaultViewport = { width: 500, height: 500 };
			}
			browserInstance = await puppeteer.launch(puppeteerArgs);
		}

		if (!pageInstance) {
			pageInstance = await browserInstance.newPage();
			if (startingUrl) {
				await pageInstance.goto(startingUrl);
			}
		}

		return pageInstance;
	}

	async function closeConnection () {
		if (browserInstance || pageInstance) {
			await getPageInstance();
			await browserInstance.close();
			pageInstance = null;
			browserInstance = null;
			// wait 1s for browser to fully clear itself from memory?
			await new Promise((resolve) => { setTimeout(() => resolve(), 1_000); });
		}
		return;
	}

	async function refreshActivePageInstance() {
		const localPageInstance = await getPageInstance();
		await localPageInstance.goto(startingUrl);
	}

	return {
		getPageInstance,
		closeConnection,
		refreshActivePageInstance
	};
}

module.exports = {
	createPuppeteerWrapper,
};