import { NewsArticle, FactCheckItem, TrendingTopic } from '../types';
import { FALLBACK_ARTICLES, FALLBACK_FACT_CHECKS, FALLBACK_TRENDING } from '../data/fallbackData';

/**
 * Universal safe API fetcher for TruthPulse AI
 * Transparently falls back to local verified datasets if network or server is initialising.
 */

export async function fetchArticlesSafe(params?: {
  category?: string;
  search?: string;
  verificationStatus?: string;
  sort?: string;
}): Promise<NewsArticle[]> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.verificationStatus && params.verificationStatus !== 'All') {
      query.set('verificationStatus', params.verificationStatus);
    }
    if (params?.sort) query.set('sort', params.sort);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`/api/news${queryString}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        return data.articles;
      }
    }
  } catch (err) {
    // Network or server starting up: proceed smoothly to fallback
  }

  // Client-side fallback filtering
  let filtered = [...FALLBACK_ARTICLES];
  if (params?.category && params.category !== 'All') {
    filtered = filtered.filter((a) => a.category === params.category);
  }
  if (params?.verificationStatus && params.verificationStatus !== 'All') {
    filtered = filtered.filter((a) => a.verificationStatus === params.verificationStatus);
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.titleBn && a.titleBn.toLowerCase().includes(q)) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
  if (params?.sort === 'Important') {
    filtered.sort((a, b) => b.importanceScore - a.importanceScore);
  } else if (params?.sort === 'Trending') {
    filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  } else if (params?.sort === 'Most Read') {
    filtered.sort((a, b) => b.viewsCount - a.viewsCount);
  }

  return filtered;
}

export async function fetchArticleBySlugSafe(slugOrId: string): Promise<{
  article: NewsArticle;
  related: NewsArticle[];
}> {
  try {
    const res = await fetch(`/api/news/${encodeURIComponent(slugOrId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.article) {
        return {
          article: data.article,
          related: data.related || [],
        };
      }
    }
  } catch (err) {
    // Fallback to in-memory articles
  }

  // Find in fallback data
  const matched =
    FALLBACK_ARTICLES.find(
      (a) => a.slug === slugOrId || a.id === slugOrId || a.slug.toLowerCase().includes(slugOrId.toLowerCase())
    ) || FALLBACK_ARTICLES[0];

  const related = FALLBACK_ARTICLES.filter((a) => a.id !== matched.id && (a.category === matched.category || true)).slice(0, 3);

  return { article: matched, related };
}

export async function fetchFactChecksSafe(category?: string): Promise<FactCheckItem[]> {
  try {
    const url = category && category !== 'All' ? `/api/fact-check?category=${encodeURIComponent(category)}` : '/api/fact-check';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.factChecks) && data.factChecks.length > 0) {
        return data.factChecks;
      }
    }
  } catch (err) {
    // Fallback gracefully
  }

  let list = [...FALLBACK_FACT_CHECKS];
  if (category && category !== 'All') {
    list = list.filter((fc) => fc.category === category);
  }
  return list;
}

export async function fetchTrendingSafe(): Promise<TrendingTopic[]> {
  try {
    const res = await fetch('/api/trending');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.trending) && data.trending.length > 0) {
        return data.trending;
      }
    }
  } catch (err) {
    // Fallback gracefully
  }

  return FALLBACK_TRENDING;
}
