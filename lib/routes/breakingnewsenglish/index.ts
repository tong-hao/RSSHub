import { Route } from '@/types';
import cache from '@/utils/cache';
import got from '@/utils/got';
import { load } from 'cheerio';
import iconv from 'iconv-lite';

export const route: Route = {
    path: '/:category?',
    categories: ['graded-news-stories'],
    example: '/breakingnewsenglish/graded-news-stories',
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
    name: 'breakingnewsenglish',
    maintainers: [],
    handler,
    url: 'breakingnewsenglish.com',
};

async function handler(ctx) {
    const category = ctx.req.param('category') ?? 'graded-news-stories';
    const rootUrl = 'https://breakingnewsenglish.com';
    const currentUrl = `${rootUrl}/${category}.html`;

    const response = await got({
        method: 'get',
        url: currentUrl,
        responseType: 'buffer',
    });

    const $ = load(iconv.decode(response.data, 'utf-8'));

    let items = $('div.content-container > ul > li > a')
        .slice(0, 10)
        .toArray()
        .map((item) => {
            item = $(item);
            return {
                title: item.text(),
                link: `${rootUrl}/${item.attr('href')}`,
                // pubDate: '',
                // description: '',
            };
        });

    items = await Promise.all(
        items.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = load(iconv.decode(res.data, 'utf-8'));
                const primary = content('#primary');
                const post = primary.find('article');
                item.description = post.text();
                return item;
            })
        )
    );

    return {
        title: `breakingnewsenglish-${category}`,
        link: currentUrl,
        item: items,
    };
}
