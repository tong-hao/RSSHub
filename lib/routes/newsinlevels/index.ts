import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

export const route: Route = {
    path: '/:category?',
    categories: ['level-1', 'level-2', 'level-3'],
    example: '/newsinlevels/level-1',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [],
    name: 'newsinlevels',
    maintainers: [],
    handler,
    url: 'newsinlevels.com',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'level-1';
    const currentUrl = `https://www.newsinlevels.com/level/${category}/`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'UTF-8'));

    const list = $('div.recent-news .news-block')
        .toArray()
        .map((item) => {
            item = $(item);
            const a = item.find('.news-block-right .title a').first();
            return {
                title: a.text(),
                // `link` 需要一个绝对 URL，但 `a.attr('href')` 返回一个相对 URL。
                link: String(a.attr('href')),
                pubDate: item.find('.news-block-right .news-excerpt p').text(),
            };
        });

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = load(iconv.decode(res.data, 'UTF-8'));
                const post = content('#nContent');
                item.title = String(item.title);
                item.description = `${post.html()}<hr>`;
                return item;
            })
        )
    );

    return {
        title: `newsinlevels-${category}`,
        link: currentUrl,
        description: 'Latest news articles from News in Levels',
        item: items,
    };
}
