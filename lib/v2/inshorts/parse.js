const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

//==统计单词==
const words = require('@/utils/words');
words.loadWords();
// const [rate, unknowWords] = words.wordsRate(item.html());
// <hr>${unknowWords}
//==========

module.exports = async (ctx) => {
  const { type = 'technology' } = ctx.params;

  const baseUrl = 'https://inshorts.com';
  const reqUrl = `https://inshorts.com/en/read/${type}`;
   console.log(reqUrl);
  const response = await got({
    method: 'get',
    url: reqUrl,
  });

  console.log(response.data);


  const $ = cheerio.load(response.data);

  const items = $('div[itemprop="articleBody"]')
    .toArray()
    .map((item) => {
      item = $(item);
      const title = item.parent().prev();

      // 图片
      const backgroundImage = item.parent().parent().parent().prev().children().css('background-image');
      const regex = /url\(['"]?(.*?)['"]?\)/;
      const match = backgroundImage.match(regex);
      const imageURL = match ? match[1] : null;
      const [rate, unknowWords] = words.wordsRate(item.html());
      return {
        title: `【${rate}】${title.find('span[itemprop="headline"]').text()} `,
        pubDate: title.find('span[itemprop="datePublished"]').attr('content'),
        description: `<img src=${imageURL}><br/>${item.html()}<hr>${unknowWords}`,
      };
    });

  // Generate the RSS feed
  ctx.state.data = {
    title: `inshorts-${type}`,
    link: reqUrl,
    description: 'Latest news articles from News in Levels',
    item: items,
  };


};

