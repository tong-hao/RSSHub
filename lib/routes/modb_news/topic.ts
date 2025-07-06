import { Route } from '@/types';
import cache from '@/utils/cache';
import { load } from 'cheerio';
import got from '@/utils/got';
import timezone from '@/utils/timezone';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/',
    categories: [],
    example: '/',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: '墨天轮-新闻',
    maintainers: ['墨天轮-新闻'],
    handler,
};

async function handler() {
    const baseUrl = 'https://www.modb.pro';
    const response = await got({
        url: `${baseUrl}/api/knowledges/find/v2?pageNum=0&pageSize=20&type=3`,
    });
    const list = response.data.list.map((item) => ({
            title: item.title,
            link: `${baseUrl}/db/${item.id}`,
            pubDate: timezone(parseDate(item.createdTime), +8),
            author: item.createdByName,
            category: item.tags,
            // description: item.content,
        }));

    const items = await Promise.all(
        list.map((item) =>
            cache.tryGet(item.link, async () => {
                const res = await got({ method: 'get', url: item.link });
                const content = load(res.data);
                const post = content('.main-box');
                item.description = post.html();
                return item;
            })
        )
    );

    return {
        title: '墨天轮-新闻',
        link: String(baseUrl),
        item: items,
    };
}
