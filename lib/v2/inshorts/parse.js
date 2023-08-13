const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
  const { type = 'technology' } = ctx.params;

  const baseUrl = 'https://inshorts.com';
  const reqUrl = `https://inshorts.com/en/read/${type}`;
  const response = await got({
    method: 'get',
    url: reqUrl,
  });

  const $ = cheerio.load(response.data);
  const items = $('div.card-stack .news-card')
    .toArray()
    .map((item) => {
      item = $(item);
      const a = item.find('.news-card-title a').first();

      // 图片
      const backgroundImage = item.find('.news-card-image').css('background-image');
      const regex = /url\(['"]?(.*?)['"]?\)/;
      const match = backgroundImage.match(regex);
      const imageURL = match ? match[1] : null;

      return {
        title: a.text(),
        link: `${baseUrl}${a.attr('href')}`,
        pubDate: parseDate(item.find('.news-card-title .news-card-author-time .time').attr('content')),
        description: `<img src="${imageURL}" >` + item.find('.news-card-content').html(),
      };
    });



  // Generate the RSS feed
  ctx.state.data = {
    title: `inshorts-${type}`,
    link: baseUrl,
    description: 'Latest news articles from News in Levels',
    item: items,
  };


};

