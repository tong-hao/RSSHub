const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

//==统计单词==
const words = require('@/utils/words');
words.loadWords();
//==========

module.exports = async (ctx) => {

  const baseUrl = 'https://www.newsinlevels.com/level/level-1/';
  const response = await got({
    method: 'get',
    url: baseUrl,
  });

  const $ = cheerio.load(response.data);
  const list = $('div.recent-news .news-block')
    .toArray()
    .map((item) => {
      item = $(item);
      const a = item.find('.news-block-right .title a').first();
      return {
        title: a.text(),
        // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
        link: `${a.attr('href')}`,
        pubDate: item.find('.news-block-right .news-excerpt p').text(),
      };
    });

  const items = await Promise.all(
    list.map((item) =>
      ctx.cache.tryGet(item.link, async () => {
        const res = await got({ method: 'get', url: item.link });
        const content = cheerio.load(res.data);
        const post = content('#nContent');
        const [rate, unknowWords] = words.wordsRate(item.html());
        item.title = `【${rate}】${item.title}`;
        item.description = `${post.html()}<hr>${unknowWords}`;
        return item;
      })
    )
  );

  // Generate the RSS feed
  ctx.state.data = {
    title: 'newsinlevels-level1',
    link: baseUrl,
    description: 'Latest news articles from News in Levels',
    item: items,
  };


};

