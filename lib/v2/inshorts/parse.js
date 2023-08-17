const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');


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
// var classValue = $('div[style="min-height: calc(100vh - 348px);"]').next();
// console.log(classValue.html());

  const items = $('div[itemprop="articleBody"]')
    .toArray()
    .map((item) => {
      item = $(item);
      const title = item.parent().prev();

      // 图片
      // const backgroundImage = item.find('.B5eCrU1ZL9vRc6SOMase').css('background-image');
      const backgroundImage = item.parent().parent().parent().prev().children().css('background-image');
      const regex = /url\(['"]?(.*?)['"]?\)/;
      const match = backgroundImage.match(regex);
      const imageURL = match ? match[1] : null;


      return {
        title: title.find('span[itemprop="headline"]').text(),
        //link: `${baseUrl}${a.attr('href')}`,
        pubDate: title.find('span[itemprop="datePublished"]').attr('content'),
        description: `<img src=${imageURL}>${item.html()}`,
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

