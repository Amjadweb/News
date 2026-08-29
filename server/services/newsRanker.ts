import { NewsArticle, NewsCategory } from '../../src/types';

/**
 * Calculates dynamic ranking score for a single article at the current point in time.
 * Score decays smoothly as the article approaches its 12-hour expiration window.
 */
export function calculateArticleRankScore(article: NewsArticle, nowTimestamp: number = Date.now()): number {
  const publishedTime = new Date(article.publishedAt || article.createdAt || article.retrievedAt).getTime();
  const ageInHours = Math.max(0, (nowTimestamp - publishedTime) / (1000 * 60 * 60));

  // 1. Recency Decay (0 to 40 points)
  // Linear decay over 12 hours. Brand-new stories get ~40 pts, 6h old gets ~20 pts, >12h gets 0.
  const recencyWeight = Math.max(0, (1 - ageInHours / 12)) * 40;

  // 2. Importance Score (0 to 25 points)
  const importanceScore = Math.min(100, Math.max(0, article.importanceScore || 50));
  const importanceWeight = (importanceScore / 100) * 25;

  // 3. Source Reliability & Priority (0 to 15 points)
  const sourceReliability = article.primarySource?.reliabilityScore ?? 85;
  const sourceWeight = (sourceReliability / 100) * 15;

  // 4. Engagement & Views Velocity (0 to 10 points)
  const views = Math.max(0, article.viewsCount || 0);
  const engagementWeight = Math.min(10, Math.log10(views + 1) * 3);

  // 5. Breaking News Surge (+20 points)
  // Breaking news receives an immediate boost during its initial 4-hour window
  const breakingBonus = article.isBreaking && ageInHours <= 4 ? 20 : 0;

  // 6. Editorial Feature / Curated Boost (+10 points)
  const editorialBonus = article.isEditorPick || article.isFeatured ? 10 : 0;

  // 7. Manual Published Article Retention Bonus (+5 points)
  const manualBonus = article.isManual ? 5 : 0;

  const totalScore = Number(
    (
      recencyWeight +
      importanceWeight +
      sourceWeight +
      engagementWeight +
      breakingBonus +
      editorialBonus +
      manualBonus
    ).toFixed(2)
  );

  return totalScore;
}

export interface RankerOptions {
  limit?: number;
  category?: string;
  excludeExpired?: boolean;
  enforceCategoryDiversity?: boolean;
  maxPerCategory?: number;
}

/**
 * Dynamic Ranking Engine.
 * Ranks all eligible articles dynamically, applies category diversity balancing,
 * and ensures the Top 15-20 homepage feed always stays fresh, balanced, and active.
 */
export function rankNewsArticles(
  articles: NewsArticle[],
  options: RankerOptions = {}
): NewsArticle[] {
  const {
    limit = 20,
    category,
    excludeExpired = true,
    enforceCategoryDiversity = true,
    maxPerCategory = 5,
  } = options;

  const now = Date.now();

  // 1. Filter out Drafts, Rejected, or Expired articles (if requested)
  let eligible = articles.filter((a) => {
    if (a.status === 'Draft' || a.status === 'Rejected' || a.status === 'Pending Review') {
      return false;
    }

    if (excludeExpired) {
      if (a.status === 'Expired') return false;

      // Check ISO expiration date (for auto-collected news or manual news with autoExpire)
      if (a.expiresAt && !a.isManual) {
        const expireTime = new Date(a.expiresAt).getTime();
        if (now >= expireTime) return false;
      } else if (a.isManual && a.autoExpire && a.expiresAt) {
        const expireTime = new Date(a.expiresAt).getTime();
        if (now >= expireTime) return false;
      }
    }

    if (category && category !== 'All') {
      if (a.category !== category) return false;
    }

    return true;
  });

  // If strict filtering left us with fewer than required stories (e.g. in test or low-flow moments),
  // pull in the newest published/archived stories to never leave an empty homepage!
  if (eligible.length < Math.min(limit, 10)) {
    const fallbackEligible = articles.filter(
      (a) => a.status === 'Published' || a.status === 'Archived' || a.status === 'AI Analyzed'
    );
    const existingIds = new Set(eligible.map((e) => e.id));
    for (const fb of fallbackEligible) {
      if (!existingIds.has(fb.id)) {
        eligible.push(fb);
      }
      if (eligible.length >= limit) break;
    }
  }

  // 2. Compute dynamic rank score for each article
  const scoredArticles = eligible.map((art) => {
    const score = calculateArticleRankScore(art, now);
    return {
      ...art,
      dynamicRankScore: score,
    };
  });

  // 3. Sort by dynamic rank score descending (highest score first)
  scoredArticles.sort((a, b) => (b.dynamicRankScore || 0) - (a.dynamicRankScore || 0));

  // 4. Apply Category Diversity Balancing (if requested and viewing general Top News)
  if (enforceCategoryDiversity && (!category || category === 'All')) {
    const balancedList: NewsArticle[] = [];
    const categoryCounts: Record<string, number> = {};
    const deferredList: NewsArticle[] = [];

    // First pass: select top items respecting category quotas
    for (const art of scoredArticles) {
      const cat = art.category || 'General';
      const count = categoryCounts[cat] || 0;

      // Breaking or Top 3 stories always pass
      if (art.isBreaking || balancedList.length < 3 || count < maxPerCategory) {
        balancedList.push(art);
        categoryCounts[cat] = count + 1;
      } else {
        deferredList.push(art);
      }

      if (balancedList.length >= limit) break;
    }

    // Second pass: fill remaining slots from deferred list if needed
    while (balancedList.length < limit && deferredList.length > 0) {
      balancedList.push(deferredList.shift()!);
    }

    return balancedList.slice(0, limit);
  }

  return scoredArticles.slice(0, limit);
}
