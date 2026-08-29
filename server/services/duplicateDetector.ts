import { NewsArticle } from '../../src/types';

/**
 * Normalizes text for similarity comparison by stripping punctuation,
 * converting to lower case, and filtering out common stopwords.
 */
export function normalizeText(text: any): string {
  if (!text) return '';
  const str = typeof text === 'string' ? text : String(text);
  return str
    .toLowerCase()
    .replace(/[^\w\s\u0980-\u09FF]/g, ' ') // Support English and Bengali Unicode
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenizes normalized text into non-stopword tokens
 */
const STOPWORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'in', 'to', 'for', 'of', 'with', 'by', 'as',
  'from', 'that', 'this', 'it', 'be', 'are', 'was', 'were', 'has', 'have', 'had', 'been', 'will', 'would',
  'o', 'ebong', 'er', 'te', 'theke', 'kore', 'holo', 'hobe', 'kora', 'niye', 'she', 'tara', 'tader'
]);

export function tokenizeText(text: string): Set<string> {
  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return new Set(words);
}

/**
 * Calculates Jaccard token similarity between two token sets.
 * Returns value between 0.0 (completely distinct) and 1.0 (identical tokens).
 */
export function calculateJaccardSimilarity(tokensA: Set<string>, tokensB: Set<string>): number {
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  let intersectionCount = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) {
      intersectionCount++;
    }
  }

  const unionCount = tokensA.size + tokensB.size - intersectionCount;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Canonicalizes a URL by stripping tracking parameters (utm_*, ref, source, fbclid, etc.)
 */
export function canonicalizeUrl(urlStr: string): string {
  if (!urlStr) return '';
  try {
    const parsed = new URL(urlStr);
    parsed.hash = '';
    const paramsToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (
        key.startsWith('utm_') ||
        key === 'ref' ||
        key === 'source' ||
        key === 'fbclid' ||
        key === 'gclid' ||
        key === 'ocid'
      ) {
        paramsToDelete.push(key);
      }
    });
    paramsToDelete.forEach((k) => parsed.searchParams.delete(k));
    return parsed.toString().replace(/\/+$/, '');
  } catch {
    return urlStr.split('?')[0].replace(/\/+$/, '');
  }
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  isSameEventCluster: boolean;
  matchedArticleId?: string;
  matchedArticleTitle?: string;
  reason?: 'EXACT_URL' | 'EXTERNAL_ID' | 'HIGH_TITLE_SIMILARITY' | 'SAME_EVENT_CLUSTER';
  similarityScore: number;
}

/**
 * Multi-factor duplicate & event cluster detection engine.
 * Protects against republishing identical or near-identical stories across feeds.
 */
export function checkDuplicate(
  candidate: {
    title: string;
    sourceUrl?: string;
    externalId?: string;
    content?: string;
    publishedAt?: string;
  },
  existingArticles: NewsArticle[]
): DuplicateCheckResult {
  const candidateUrl = candidate.sourceUrl ? canonicalizeUrl(candidate.sourceUrl) : '';
  const candidateTokens = tokenizeText(candidate.title);
  const candidateTime = candidate.publishedAt ? new Date(candidate.publishedAt).getTime() : Date.now();

  for (const existing of existingArticles) {
    // 1. Direct URL check
    if (candidateUrl && existing.sourceUrl) {
      const existingUrl = canonicalizeUrl(existing.sourceUrl);
      if (existingUrl === candidateUrl) {
        return {
          isDuplicate: true,
          isSameEventCluster: true,
          matchedArticleId: existing.id,
          matchedArticleTitle: existing.title,
          reason: 'EXACT_URL',
          similarityScore: 1.0,
        };
      }
    }

    // 2. Primary Source / fullCoverage source URLs check
    if (candidateUrl && existing.primarySource?.url) {
      if (canonicalizeUrl(existing.primarySource.url) === candidateUrl) {
        return {
          isDuplicate: true,
          isSameEventCluster: true,
          matchedArticleId: existing.id,
          matchedArticleTitle: existing.title,
          reason: 'EXACT_URL',
          similarityScore: 1.0,
        };
      }
    }

    // 3. External GUID/ID check
    if (
      candidate.externalId &&
      existing.externalId &&
      candidate.externalId.trim() === existing.externalId.trim()
    ) {
      return {
        isDuplicate: true,
        isSameEventCluster: true,
        matchedArticleId: existing.id,
        matchedArticleTitle: existing.title,
        reason: 'EXTERNAL_ID',
        similarityScore: 1.0,
      };
    }

    // 4. Title Token Similarity Check
    const existingTokens = tokenizeText(existing.title);
    const titleSim = calculateJaccardSimilarity(candidateTokens, existingTokens);

    // Exact or near-identical headline (> 0.65 Jaccard overlap)
    if (titleSim >= 0.65) {
      return {
        isDuplicate: true,
        isSameEventCluster: true,
        matchedArticleId: existing.id,
        matchedArticleTitle: existing.title,
        reason: 'HIGH_TITLE_SIMILARITY',
        similarityScore: titleSim,
      };
    }

    // 5. Same Event Window Clustering Check (Within 24 hours with >= 0.45 title similarity)
    const existingTime = new Date(existing.publishedAt || existing.updatedAt).getTime();
    const timeDiffHours = Math.abs(candidateTime - existingTime) / (1000 * 60 * 60);

    if (timeDiffHours <= 24 && titleSim >= 0.45) {
      return {
        isDuplicate: false, // Not a byte-for-byte duplicate, but part of the same event
        isSameEventCluster: true,
        matchedArticleId: existing.id,
        matchedArticleTitle: existing.title,
        reason: 'SAME_EVENT_CLUSTER',
        similarityScore: titleSim,
      };
    }
  }

  return {
    isDuplicate: false,
    isSameEventCluster: false,
    similarityScore: 0,
  };
}
