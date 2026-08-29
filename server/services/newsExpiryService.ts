import { NewsArticle } from '../../src/types';

export interface ExpiryResult {
  expiredCount: number;
  expiredArticleIds: string[];
  totalActiveCount: number;
  totalExpiredCount: number;
  processedAt: string;
}

/**
 * 12-Hour News Expiry Service.
 * Scans articles and transitions any story whose 12-hour window has elapsed to 'Expired'.
 * Manual stories are exempt unless explicitly flagged with autoExpire: true.
 */
export function runNewsExpiryCheck(
  articles: NewsArticle[],
  nowMs: number = Date.now()
): { updatedArticles: NewsArticle[]; result: ExpiryResult } {
  let expiredCount = 0;
  const expiredArticleIds: string[] = [];

  const updatedArticles = articles.map((article) => {
    // Skip drafts and already expired/rejected
    if (article.status === 'Draft' || article.status === 'Rejected' || article.status === 'Expired') {
      return article;
    }

    // Check manual exception rule:
    // Manual articles do NOT expire after 12 hours unless autoExpire is explicitly set to true.
    if (article.isManual && !article.autoExpire) {
      // Manual news remains active
      return article;
    }

    // Check expiration timestamp
    if (article.expiresAt) {
      const expireTime = new Date(article.expiresAt).getTime();
      if (!isNaN(expireTime) && nowMs >= expireTime) {
        expiredCount++;
        expiredArticleIds.push(article.id);
        return {
          ...article,
          status: 'Expired' as const,
          isBreaking: false, // Cooling down breaking flag
          updatedAt: new Date(nowMs).toISOString(),
        };
      }
    } else {
      // If expiresAt was not set, calculate from publishedAt (default 12 hours)
      const pubTime = new Date(article.publishedAt || article.createdAt || article.retrievedAt).getTime();
      if (!isNaN(pubTime)) {
        const twelveHoursMs = 12 * 60 * 60 * 1000;
        if (nowMs >= pubTime + twelveHoursMs) {
          expiredCount++;
          expiredArticleIds.push(article.id);
          return {
            ...article,
            status: 'Expired' as const,
            expiresAt: new Date(pubTime + twelveHoursMs).toISOString(),
            isBreaking: false,
            updatedAt: new Date(nowMs).toISOString(),
          };
        }
      }
    }

    return article;
  });

  const totalActiveCount = updatedArticles.filter(
    (a) => a.status === 'Published' || a.status === 'Approved'
  ).length;

  const totalExpiredCount = updatedArticles.filter((a) => a.status === 'Expired').length;

  return {
    updatedArticles,
    result: {
      expiredCount,
      expiredArticleIds,
      totalActiveCount,
      totalExpiredCount,
      processedAt: new Date(nowMs).toISOString(),
    },
  };
}
