const pino = require("pino");
const pretty = require("pino-pretty");
const log = pino(pretty());
const puppeteer = require("puppeteer");

(async () => {
  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate the page to a URL
  await page.goto(
    "https://www.douban.com/search?q=%E7%89%B9%E6%96%AF%E6%8B%89%E4%BC%A0"
  );

  const html = await page.evaluate((htm) => {
    setTimeout(() => {
      return document.body.innerHTML;
    }, 3000);
  });

  // Print the full title
  log.info('The title of this blog post is "%s".', html);

  await browser.close();
})();
