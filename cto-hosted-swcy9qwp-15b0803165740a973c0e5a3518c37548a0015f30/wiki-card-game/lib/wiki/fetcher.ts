import { WikipediaArticle } from '@/lib/types';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

export async function fetchRandomArticle(): Promise<WikipediaArticle> {
  const url = new URL(WIKI_API);
  url.searchParams.append('action', 'query');
  url.searchParams.append('format', 'json');
  url.searchParams.append('generator', 'random');
  url.searchParams.append('grnnamespace', '0');
  url.searchParams.append('grnlimit', '1');
  url.searchParams.append('prop', 'pageimages|extracts|info');
  url.searchParams.append('pithumbsize', '500');
  url.searchParams.append('exintro', '1');
  url.searchParams.append('explaintext', '1');
  url.searchParams.append('inprop', 'url');
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  const pages = data.query.pages;
  const pageId = Object.keys(pages)[0];
  const page = pages[pageId];
  
  return {
    pageid: page.pageid,
    title: page.title,
    extract: page.extract || '',
    thumbnail: page.thumbnail,
    fullurl: page.fullurl || '',
    length: page.length || 1000,
  };
}

export async function fetchMultipleArticles(count: number): Promise<WikipediaArticle[]> {
  const articles: WikipediaArticle[] = [];
  const seenIds = new Set<number>();
  
  while (articles.length < count) {
    try {
      const article = await fetchRandomArticle();
      if (!seenIds.has(article.pageid)) {
        seenIds.add(article.pageid);
        articles.push(article);
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    }
  }
  
  return articles;
}
