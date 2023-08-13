const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
  const { level = 'graded-news-stories' } = ctx.params;

  const baseUrl = 'https://breakingnewsenglish.com/';
  const reqUrl = `https://breakingnewsenglish.com/${level}.html`;
  const response = await got({
    method: 'get',
    url: reqUrl,
  });

  const $ = cheerio.load(response.data);
  const list = $('div.content-container > ul > li > a')
    .slice(0, 4)
    .map((_, item) => {
      item = $(item);
      // const a = item.find('a').first();
      return {
        title: item.text(),
        link: `${baseUrl}${item.attr('href')}`,
      };
    }).get();

  const items = await Promise.all(
    list.map((item) =>
      ctx.cache.tryGet(item.link, async () => {
        const res = await got({ method: 'get', url: item.link });
        console.log(res.data);
        const content = cheerio.load(res.data);
        const primary = content('#primary');
        const post = primary.find('article');
        item.description = post.text();
        return item;
      })
    )
  );



  // Generate the RSS feed
  ctx.state.data = {
    title: `breakingnews-${level}`,
    link: reqUrl,
    description: '',
    item: items,
  };


};

