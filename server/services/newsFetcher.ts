import Parser from 'rss-parser';
import { NewsArticle, NewsSourceRegistry, NewsCategory } from '../../src/types';
import { checkDuplicate } from './duplicateDetector';
import { processNewsItemWithAI, RawNewsItem } from './newsProcessor';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'TruthPulse-NewsIntelligence-Bot/2.0 (+https://truthpulse.ai)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description'],
    ],
  },
});

export interface IngestionReport {
  timestamp: string;
  sourcesAttempted: number;
  sourcesSuccessful: number;
  sourcesFailed: number;
  itemsFoundTotal: number;
  itemsNewAdded: number;
  itemsDuplicateSkipped: number;
  errors: { sourceName: string; error: string }[];
  newArticles: NewsArticle[];
}

const FALLBACK_FEEDS_BY_SOURCE_ID: Record<string, string[]> = {
  src_dhaka_tribune: [
    'https://www.thedailystar.net/frontpage/rss.xml',
    'https://www.thedailystar.net/news/bangladesh/rss.xml',
    'https://en.prothomalo.com/feed',
  ],
  src_daily_star: [
    'https://www.thedailystar.net/frontpage/rss.xml',
    'https://www.thedailystar.net/news/bangladesh/rss.xml',
    'https://en.prothomalo.com/feed',
  ],
  src_reuters_tech: [
    'https://feeds.arstechnica.com/arstechnica/index',
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml',
    'https://www.theverge.com/rss/index.xml',
  ],
  src_nature_science: [
    'https://www.nature.com/nature.rss',
    'https://www.sciencedaily.com/rss/top/science.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    'https://phys.org/rss-feed/',
  ],
  src_techcrunch: [
    'https://techcrunch.com/category/artificial-intelligence/feed/',
    'https://techcrunch.com/feed/',
    'https://feeds.arstechnica.com/arstechnica/index',
  ],
  src_bbc_world: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.nytimes.com/services/xml/nyt/World.xml',
  ],
};

const CATEGORY_FALLBACK_FEEDS: Record<string, string[]> = {
  'Bangladesh': ['https://www.thedailystar.net/frontpage/rss.xml', 'https://en.prothomalo.com/feed'],
  'Technology': ['https://feeds.arstechnica.com/arstechnica/index', 'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', 'https://www.theverge.com/rss/index.xml'],
  'Artificial Intelligence': ['https://techcrunch.com/category/artificial-intelligence/feed/', 'https://feeds.arstechnica.com/arstechnica/index'],
  'Science': ['https://www.nature.com/nature.rss', 'https://www.sciencedaily.com/rss/top/science.xml'],
  'International': ['https://feeds.bbci.co.uk/news/world/rss.xml', 'https://rss.nytimes.com/services/xml/nyt/World.xml'],
  'Business': ['https://rss.nytimes.com/services/xml/nyt/Business.xml', 'https://feeds.arstechnica.com/arstechnica/index'],
  'Finance & Economy': ['https://rss.nytimes.com/services/xml/nyt/Business.xml', 'https://feeds.arstechnica.com/arstechnica/index'],
};

/**
 * Robust timeout fetcher wrapper with automatic alternate URL failover
 */
async function parseFeedWithResilientFallback(source: NewsSourceRegistry, timeoutMs: number = 8000) {
  const candidateUrls = [
    source.feedUrl,
    ...(FALLBACK_FEEDS_BY_SOURCE_ID[source.id] || []),
    ...(CATEGORY_FALLBACK_FEEDS[source.category] || []),
  ];

  const uniqueUrls = Array.from(new Set(candidateUrls.filter(Boolean)));
  let lastError: any = null;

  for (const url of uniqueUrls) {
    try {
      const feed = await Promise.race([
        parser.parseURL(url),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Feed request timed out after ${timeoutMs}ms`)), timeoutMs)
        ),
      ]);
      if (feed && feed.items && feed.items.length > 0) {
        if (url !== source.feedUrl) {
          console.log(`[NewsFetcher] Resilient fallback engaged for "${source.name}". Retrieved ${feed.items.length} items from alternative endpoint: ${url}`);
        }
        return { feed, resolvedUrl: url };
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error(`Failed to fetch feed for source ${source.name}`);
}

/**
 * Safe string extractor for RSS items where fields may be objects, arrays, or null
 */
export function extractSafeString(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    if (typeof val._ === 'string') return val._.trim();
    if (typeof val.text === 'string') return val.text.trim();
    if (typeof val.$t === 'string') return val.$t.trim();
    if (typeof val.value === 'string') return val.value.trim();
    if (typeof val.title === 'string') return val.title.trim();
    if (Array.isArray(val)) {
      return val.map(extractSafeString).filter(Boolean).join(' ').trim();
    }
    for (const key of Object.keys(val)) {
      if (key !== '$') {
        const nested = extractSafeString(val[key]);
        if (nested) return nested;
      }
    }
    try {
      if (val.toString && typeof val.toString === 'function' && val.toString !== Object.prototype.toString) {
        const res = val.toString();
        if (typeof res === 'string' && res !== '[object Object]') {
          return res.trim();
        }
      }
    } catch {}
  }
  return '';
}

/**
 * Extracts image URL from RSS item fields
 */
function extractImageUrl(item: any): string | undefined {
  if (item.enclosure?.url && typeof item.enclosure.url === 'string') {
    return item.enclosure.url;
  }
  if (item.mediaContent?.$?.url && typeof item.mediaContent.$.url === 'string') {
    return item.mediaContent.$.url;
  }
  if (item.mediaThumbnail?.$?.url && typeof item.mediaThumbnail.$.url === 'string') {
    return item.mediaThumbnail.$.url;
  }
  // Try extracting from content/description HTML
  const html = extractSafeString(item.contentEncoded || item.content || item.description || '');
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return undefined;
}

/**
 * Executes a full ingestion cycle across all active sources.
 */
export async function executeNewsIngestion(
  sources: NewsSourceRegistry[],
  existingArticles: NewsArticle[],
  options?: { maxItemsPerSource?: number; forceRun?: boolean }
): Promise<{
  report: IngestionReport;
  updatedSources: NewsSourceRegistry[];
  newArticles: NewsArticle[];
}> {
  const maxPerSource = options?.maxItemsPerSource ?? 5;
  const nowStr = new Date().toISOString();

  let sourcesAttempted = 0;
  let sourcesSuccessful = 0;
  let sourcesFailed = 0;
  let itemsFoundTotal = 0;
  let itemsNewAdded = 0;
  let itemsDuplicateSkipped = 0;
  const errors: { sourceName: string; error: string }[] = [];
  const newlyCreatedArticles: NewsArticle[] = [];

  const workingArticlesList = [...existingArticles];

  const updatedSources = await Promise.all(
    sources.map(async (source) => {
      if (!source.isActive && !options?.forceRun) {
        return source;
      }

      sourcesAttempted++;
      const updatedSource: NewsSourceRegistry = {
        ...source,
        lastFetchAttempt: nowStr,
      };

      try {
        const { feed, resolvedUrl } = await parseFeedWithResilientFallback(source, 8000);
        updatedSource.lastSuccessfulFetch = nowStr;
        updatedSource.errorCount = 0;
        updatedSource.healthStatus = 'Healthy';
        updatedSource.lastErrorMessage = undefined;
        sourcesSuccessful++;

        const items = feed.items || [];
        itemsFoundTotal += items.length;

        // Process top N items from this feed
        for (const item of items.slice(0, maxPerSource)) {
          const rawTitle = extractSafeString(item.title);
          if (!rawTitle || rawTitle.length < 5) continue;

          const candidateUrl = extractSafeString(item.link || item.guid) || resolvedUrl;
          const candidateTitle = rawTitle;
          const candidateSnippet = extractSafeString(item.contentSnippet || item.description || item.content || '')
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500);

          const candidateContent = extractSafeString(item.contentEncoded || item.content || candidateSnippet)
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          const rawItem: RawNewsItem = {
            title: candidateTitle,
            sourceName: source.name,
            sourceUrl: candidateUrl || source.feedUrl,
            externalId: extractSafeString(item.guid) || candidateUrl || `${source.id}_${Date.now()}`,
            contentSnippet: candidateSnippet,
            content: candidateContent || candidateSnippet,
            imageUrl: extractImageUrl(item),
            publishedAt: extractSafeString(item.isoDate || item.pubDate) || nowStr,
            categorySuggestion: source.category,
            author: extractSafeString(item.creator || (item as any).author) || undefined,
          };

          // Check duplicate
          const dupResult = checkDuplicate(rawItem, workingArticlesList);
          if (dupResult.isDuplicate) {
            itemsDuplicateSkipped++;
            continue;
          }

          // Process new item with AI
          const processedArticle = await processNewsItemWithAI(rawItem, source);
          newlyCreatedArticles.push(processedArticle);
          workingArticlesList.unshift(processedArticle);
          itemsNewAdded++;
          updatedSource.totalArticlesCollected = (updatedSource.totalArticlesCollected || 0) + 1;
        }
      } catch (err: any) {
        sourcesFailed++;
        const errMsg = err?.message || 'Unknown network/parsing error';
        updatedSource.errorCount = (updatedSource.errorCount || 0) + 1;
        updatedSource.lastErrorMessage = errMsg;
        updatedSource.healthStatus = updatedSource.errorCount >= 3 ? 'Failing' : 'Degraded';
        errors.push({ sourceName: source.name, error: errMsg });
        console.warn(`[NewsFetcher] Failed to fetch source ${source.name}: ${errMsg}`);
      }

      return updatedSource;
    })
  );

  const report: IngestionReport = {
    timestamp: nowStr,
    sourcesAttempted,
    sourcesSuccessful,
    sourcesFailed,
    itemsFoundTotal,
    itemsNewAdded,
    itemsDuplicateSkipped,
    errors,
    newArticles: newlyCreatedArticles,
  };

  return {
    report,
    updatedSources,
    newArticles: newlyCreatedArticles,
  };
}

/**
 * Creates dynamic test stories for verifying 12-hour expiration, replacement,
 * and ranking behavior (Step 22).
 */
export function generateTestScenarioStories(count: number = 20): NewsArticle[] {
  const now = Date.now();
  const testArticles: NewsArticle[] = [];

  const testTemplates = [
    { title: 'Bangladesh Bank Unveils Digital Currency Framework for Cross-Border Settlement', cat: 'Finance & Economy' as NewsCategory, src: 'Bangladesh Bank Wire', imp: 95, hoursOld: 1 },
    { title: 'Dhaka Metro Rail Line-6 Extends High-Speed Service to Southern Hubs', cat: 'Bangladesh' as NewsCategory, src: 'The Daily Star Desk', imp: 90, hoursOld: 2 },
    { title: 'Chattogram Port Completes Automated Smart Logistics Corridor', cat: 'Business' as NewsCategory, src: 'Financial Express Bangladesh', imp: 88, hoursOld: 3 },
    { title: 'National AI Supercomputing Hub Commissioned at Kaliakair Hi-Tech Park', cat: 'Artificial Intelligence' as NewsCategory, src: 'BASIS Tech Intelligence', imp: 94, hoursOld: 0.5, isBreaking: true },
    { title: 'Dhaka University Quantum Computing Lab Achieves 128-Qubit Simulation', cat: 'Science' as NewsCategory, src: 'Science Intelligence', imp: 86, hoursOld: 4 },
    { title: 'Clean Energy Grid Reaches 4,000 MW Solar Capacity in Northern Districts', cat: 'Environment' as NewsCategory, src: 'Renewable Energy Agency', imp: 82, hoursOld: 5 },
    { title: 'Global Tech Summit 2026 Selects Dhaka as South Asia AI Host', cat: 'Technology' as NewsCategory, src: 'Reuters Tech Service', imp: 91, hoursOld: 1.5 },
    { title: 'Bangladesh Tigers Clinch Historic T20 Victory with Record Run Chase', cat: 'Sports' as NewsCategory, src: 'Sports Wire BD', imp: 89, hoursOld: 2.5 },
    { title: 'Healthcare Modernization: 50 Rural Hospitals Deploy Tele-Robotic Surgery', cat: 'Health' as NewsCategory, src: 'Health Directorate BD', imp: 84, hoursOld: 6 },
    { title: 'Secondary Schools Integrate AI Literacy and Coding into Core Curriculum', cat: 'Education' as NewsCategory, src: 'Education Ministry Wire', imp: 80, hoursOld: 7 },
    { title: 'Dhaka International Film Festival Honors Breakthrough South Asian Directors', cat: 'Entertainment' as NewsCategory, src: 'Arts & Culture Desk', imp: 75, hoursOld: 8 },
    { title: 'Export Earnings from Semiconductor Design Cross $450 Million Milestone', cat: 'Business' as NewsCategory, src: 'EPB Trade Dispatch', imp: 87, hoursOld: 9 },
    { title: 'Agritech Drones Deploy Real-Time Pest Detection Across 12 Districts', cat: 'Technology' as NewsCategory, src: 'Agricultural Tech Council', imp: 81, hoursOld: 10 },
    { title: 'Sylhet Silicon Corridor Welcomes 15 European Cloud Engineering Hubs', cat: 'Bangladesh' as NewsCategory, src: 'Tech Reporter BD', imp: 85, hoursOld: 11 },
    // Stories older than 12 hours (should expire!)
    { title: 'Yesterday: Central Bank Liquidity Auction Concluded for Commercial Banks', cat: 'Finance & Economy' as NewsCategory, src: 'Financial Express Bangladesh', imp: 70, hoursOld: 13 },
    { title: 'Yesterday: International Trade Forum Concludes Bilateral Textile Talks', cat: 'International' as NewsCategory, src: 'BBC World Wire', imp: 72, hoursOld: 14 },
    { title: 'Yesterday: Weather Bureau Reported Monsoonal Rains in Coastal Belt', cat: 'Environment' as NewsCategory, src: 'Meteorological Dept', imp: 65, hoursOld: 15 },
    { title: 'Yesterday: Regional Science Fair Showcases High School Robotics Projects', cat: 'Science' as NewsCategory, src: 'Science Intelligence', imp: 68, hoursOld: 16 },
    { title: 'Yesterday: Civil Aviation Authority Reviewed Airport Modernization Works', cat: 'Bangladesh' as NewsCategory, src: 'Daily Star Desk', imp: 74, hoursOld: 18 },
    { title: 'Yesterday: City Corporation Launched Cleanliness Campaign in Old Dhaka', cat: 'Bangladesh' as NewsCategory, src: 'Dhaka City Reporter', imp: 60, hoursOld: 20 },
  ];

  for (let i = 0; i < Math.min(count, testTemplates.length); i++) {
    const t = testTemplates[i];
    const pubMs = now - t.hoursOld * 60 * 60 * 1000;
    const publishedAt = new Date(pubMs).toISOString();
    const expiresAt = new Date(pubMs + 12 * 60 * 60 * 1000).toISOString();
    const isExpired = now >= pubMs + 12 * 60 * 60 * 1000;

    const primarySource = {
      id: `src_test_${i}`,
      name: t.src,
      url: 'https://truthpulse.ai/source/' + i,
      publisher: t.src,
      domain: 'truthpulse.ai',
      publishedAt,
      retrievedAt: publishedAt,
      sourceType: 'Verified Outlet' as const,
      reliabilityScore: 92,
      isPrimary: true,
    };

    testArticles.push({
      id: `test_art_${Date.now()}_${i}`,
      slug: `dynamic-test-story-${i}-${Date.now().toString(36)}`,
      title: t.title,
      titleBn: `${t.title} (যাচাইকৃত সংস্করণ)`,
      summary: `Automated dynamic intelligence dispatch: ${t.title}. Published ${t.hoursOld}h ago, expires in 12h.`,
      summaryBn: `স্বয়ংক্রিয় তথ্য বুদ্ধিমত্তা বার্তা: ${t.title}। ১২ ঘণ্টার জীবনচক্রের অংশ।`,
      content: `## ${t.title}\n\nThis is a dynamic verified news dispatch ingested for the live rotation and expiration testing engine.\n\n- Published: ${publishedAt}\n- Expires At: ${expiresAt}\n- Status: ${isExpired ? 'Expired' : 'Published'}`,
      category: t.cat,
      tags: [t.cat, 'Dynamic Feed', 'Live Rotation'],
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
      expiresAt,
      retrievedAt: publishedAt,
      status: isExpired ? 'Expired' : 'Published',
      verificationStatus: 'Verified',
      confidenceScore: 92,
      importanceScore: t.imp,
      viewsCount: Math.floor(Math.random() * 200) + 20,
      isBreaking: (t as any).isBreaking || false,
      isTrending: t.imp >= 90,
      isEditorPick: t.imp >= 88,
      isManual: false,
      autoExpire: true,
      aiGenerated: true,
      sourceName: t.src,
      sourceUrl: 'https://truthpulse.ai/source/' + i,
      byline: 'TruthPulse Intelligence Bot',
      location: 'Dhaka',
      primarySource,
      sourceComparison: {
        totalChecked: 2,
        supporting: 2,
        conflicting: 0,
        sources: [primarySource],
        primarySourceAvailable: true,
      },
      keyFacts: [
        `Dispatched by accredited wire ${t.src}`,
        `Published timestamp verified at ${publishedAt}`,
        `Automatic 12-hour expiration set for ${expiresAt}`,
      ],
      extractedClaims: [],
    });
  }

  return testArticles;
}
