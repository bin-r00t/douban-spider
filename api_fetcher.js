/**
 * 获取豆瓣的书籍搜索结果并下载图片
 */


const pino = require("pino");
const pretty = require("pino-pretty");
const fs = require("fs");
const log = pino(pretty());
const puppeteer = require("puppeteer");

const api = {
  search: "https://m.douban.com/rexxar/api/v2/search",
};
api.searchUrl = function (
  q,
  type,
  loc_id,
  start = 0,
  count = 10,
  sort = "relevance"
) {
  return (
    this.search +
    "?q=" +
    new URLSearchParams([["q", q]]).get("q") +
    "&type=" +
    type +
    "&loc_id=" +
    loc_id +
    "&start=" +
    start +
    "&count=" +
    count +
    "&sort=" +
    sort
  );
};

fetch(api.searchUrl("特斯拉传"), {
  method: "GET",
  headers: {
    Origin: "https://www.douban.com",
    referer: "https://www.douban.com",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
  },
})
  .then((res) => res.json())
  .then((data) => {
    const result = data.subjects.items.map((item) => {
      return {
        id: item.target.id,
        cover_url: item.target.cover_url,
        title: item.target.title,
        abstract: item.target.abstract,
      };
      //   item.target.photos && log.info(item.target.photos.map(pto => pto.large.url));
    });
    result.map((item, index) => {
      const url = item.cover_url.replace("/h/120", "/h/480");
      fetch(url).then((res) => {
        log.info("Downloading image %s", item.id);
        const dest = fs.createWriteStream(`./images/${item.id}.jpg`, {
          flags: "w+",
        });
        const reader = res.body.getReader();

        const handleData = ({ done, value }) => {
          if (!done) {
            dest.write(value);
            return reader.read().then(handleData);
          }
        };
        reader
          .read()
          .then(handleData)
          .then(() => {
            dest.end();
            log.info("Download success");
          });
      });
    });
  });
