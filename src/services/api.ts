import { NewsArticle, FactCheckItem, TrendingTopic, NewsSyncStatus, NewsSourceRegistry } from '../types';
import { FALLBACK_ARTICLES, FALLBACK_FACT_CHECKS, FALLBACK_TRENDING } from '../data/fallbackData';

/**
 * Universal safe API fetcher for TruthPulse AI
 * Directly connects to the dynamic Express backend with real-time news rotation and 12-hour expiration.
 */

export async function fetchSyncStatusSafe(): Promise<NewsSyncStatus | null> {
  try {
    const res = await fetch('/api/news/sync-status');
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.status) {
        return data.status;
      }
    }
  } catch (err) {
    // Graceful offline fallback
  }
  return null;
}

export async function fetchTopNewsSafe(limit: number = 20, category?: string): Promise<{
  articles: NewsArticle[];
  syncStatus?: NewsSyncStatus;
}> {
  try {
    const query = new URLSearchParams({ limit: limit.toString() });
    if (category && category !== 'All') query.set('category', category);

    const res = await fetch(`/api/news/top?${query.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.articles) && data.articles.length > 0) {
        return { articles: data.articles, syncStatus: data.syncStatus };
      }
    }
  } catch (err) {
    // Network or server booting: fallback gracefully
  }

  // Client-side fallback filtered by category
  let filtered = [...FALLBACK_ARTICLES];
  if (category && category !== 'All') {
    filtered = filtered.filter((a) => a.category === category);
  }
  return { articles: filtered.slice(0, limit) };
}

export async function fetchArticlesSafe(params?: {
  category?: string;
  search?: string;
  verificationStatus?: string;
  sort?: string;
  limit?: number;
  page?: number;
}): Promise<{ articles: NewsArticle[]; syncStatus?: NewsSyncStatus; total?: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.category && params?.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.verificationStatus && params?.verificationStatus !== 'All') {
      query.set('verificationStatus', params.verificationStatus);
    }
    if (params?.sort) query.set('sort', params.sort);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.page) query.set('page', params.page.toString());

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetch(`/api/news${queryString}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        return { articles: data.articles, syncStatus: data.syncStatus, total: data.total };
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
    filtered.sort((a, b) => (b.importanceScore || 0) - (a.importanceScore || 0));
  } else if (params?.sort === 'Trending') {
    filtered.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
  } else if (params?.sort === 'Most Read') {
    filtered.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  }

  return { articles: filtered, total: filtered.length };
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

export async function fetchSavedArticlesSafe(savedIds: string[]): Promise<NewsArticle[]> {
  if (!savedIds || savedIds.length === 0) return [];
  try {
    const res = await fetch('/api/news?limit=100');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.articles)) {
        const found = data.articles.filter((a: NewsArticle) => savedIds.includes(a.id) || savedIds.includes(a.slug));
        if (found.length > 0) return found;
      }
    }
  } catch (err) {
    // Graceful fallback
  }

  // Check fallback articles
  return FALLBACK_ARTICLES.filter((a) => savedIds.includes(a.id) || savedIds.includes(a.slug));
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

export async function triggerPipelineSyncSafe(token: string): Promise<any> {
  const res = await fetch('/api/admin/pipeline/trigger', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function triggerTestScenarioSafe(token: string): Promise<any> {
  const res = await fetch('/api/admin/test-rotation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function createManualArticleSafe(articleData: any, token: string): Promise<any> {
  const res = await fetch('/api/admin/news/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(articleData),
  });
  return res.json();
}

export async function deleteArticleSafe(id: string, token: string): Promise<any> {
  const res = await fetch(`/api/admin/news/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function saveSourceSafe(source: Partial<NewsSourceRegistry>, token: string): Promise<any> {
  if (source.id && !source.id.startsWith('new')) {
    const res = await fetch(`/api/admin/sources/${encodeURIComponent(source.id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ updates: source }),
    });
    return res.json();
  } else {
    const res = await fetch('/api/admin/sources', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ source }),
    });
    return res.json();
  }
}

export async function deleteSourceSafe(id: string, token: string): Promise<any> {
  const res = await fetch(`/api/admin/sources/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
