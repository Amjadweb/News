import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { NewsArticle } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  Tag,
  Sparkles,
  Search,
  Bookmark,
  ChevronRight,
  Clock,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  TrendingUp,
  Hash,
  Filter
} from 'lucide-react';

interface RelatedTopicsSectionProps {
  currentArticle: NewsArticle;
  allArticles: NewsArticle[];
}

interface ScoredArticle {
  article: NewsArticle;
  matchedKeywords: string[];
  relevanceScore: number;
}

export const RelatedTopicsSection: React.FC<RelatedTopicsSectionProps> = ({
  currentArticle,
  allArticles,
}) => {
  const { t, language, formatDhakaTime, navigateTo, savedArticles, toggleSaveArticle, addToast } = useApp();
  const [activeKeywordFilter, setActiveKeywordFilter] = useState<string>('ALL');

  /**
   * 1. EXTRACT & DETECT RELEVANT KEYWORDS FROM CURRENT STORY
   * Gathers explicit tags, named entities (orgs, people, locations), and high-signal topic terms.
   */
  const detectedKeywords = useMemo(() => {
    const rawKeywords = new Set<string>();

    // 1. Explicit tags
    if (Array.isArray(currentArticle.tags)) {
      currentArticle.tags.forEach((tag) => {
        if (tag && tag.trim().length > 1) {
          rawKeywords.add(tag.trim());
        }
      });
    }

    // 2. Named entities
    if (currentArticle.entities) {
      if (Array.isArray(currentArticle.entities.organizations)) {
        currentArticle.entities.organizations.forEach((org) => {
          if (org && org.trim().length > 1) rawKeywords.add(org.trim());
        });
      }
      if (Array.isArray(currentArticle.entities.people)) {
        currentArticle.entities.people.forEach((p) => {
          if (p && p.trim().length > 1) rawKeywords.add(p.trim());
        });
      }
      if (Array.isArray(currentArticle.entities.locations)) {
        currentArticle.entities.locations.forEach((loc) => {
          if (loc && loc.trim().length > 2 && loc.toLowerCase() !== 'dhaka, bangladesh') {
            rawKeywords.add(loc.trim());
          }
        });
      }
    }

    // 3. High-signal domain keywords from title / summary if not already present
    const combinedText = `${currentArticle.title} ${currentArticle.summary}`.toLowerCase();
    const commonTopics = [
      'Artificial Intelligence',
      'AI',
      'FinTech',
      'SaaS',
      'Cybersecurity',
      'IT Export',
      'Software',
      'Solar Energy',
      'Renewable Energy',
      'Remittance',
      'Foreign Reserve',
      'Inflation',
      'Microcredit',
      'Public Health',
      'Elections',
      'RMG Sector',
      'Apparel Exports',
      'Climate Resilience',
      'Infrastructure',
      'Deepfake',
      'Fact Check',
    ];

    commonTopics.forEach((topic) => {
      if (combinedText.includes(topic.toLowerCase())) {
        rawKeywords.add(topic);
      }
    });

    // Deduplicate case-insensitively
    const seen = new Set<string>();
    const uniqueList: string[] = [];
    rawKeywords.forEach((kw) => {
      const lower = kw.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueList.push(kw);
      }
    });

    return uniqueList.slice(0, 8); // Top detected keywords
  }, [currentArticle]);

  /**
   * 2. MATCH & SCORE ALL OTHER ARTICLES BASED ON DETECTED KEYWORDS
   */
  const scoredSuggestions = useMemo(() => {
    if (!allArticles || allArticles.length === 0) return [];

    const candidates = allArticles.filter(
      (a) => a.id !== currentArticle.id && a.slug !== currentArticle.slug
    );

    const scored: ScoredArticle[] = [];

    candidates.forEach((candidate) => {
      const matchedKw: string[] = [];
      let score = 0;

      const candTags = (candidate.tags || []).map((t) => t.toLowerCase());
      const candTitle = (candidate.title || '').toLowerCase();
      const candSummary = (candidate.summary || '').toLowerCase();
      const candTitleBn = (candidate.titleBn || '').toLowerCase();
      const candSummaryBn = (candidate.summaryBn || '').toLowerCase();
      const candOrgs = (candidate.entities?.organizations || []).map((o) => o.toLowerCase());
      const candPeople = (candidate.entities?.people || []).map((p) => p.toLowerCase());
      const candLocations = (candidate.entities?.locations || []).map((l) => l.toLowerCase());

      detectedKeywords.forEach((keyword) => {
        const kwLower = keyword.toLowerCase();
        let matched = false;

        // Tag exact or partial match
        if (candTags.some((t) => t.includes(kwLower) || kwLower.includes(t))) {
          score += 4;
          matched = true;
        }

        // Entity match
        if (
          candOrgs.some((o) => o.includes(kwLower) || kwLower.includes(o)) ||
          candPeople.some((p) => p.includes(kwLower) || kwLower.includes(p)) ||
          candLocations.some((l) => l.includes(kwLower) || kwLower.includes(l))
        ) {
          score += 3;
          matched = true;
        }

        // Title / Summary match
        if (
          candTitle.includes(kwLower) ||
          candSummary.includes(kwLower) ||
          candTitleBn.includes(kwLower) ||
          candSummaryBn.includes(kwLower)
        ) {
          score += 2;
          matched = true;
        }

        if (matched && !matchedKw.includes(keyword)) {
          matchedKw.push(keyword);
        }
      });

      // Bonus for same category
      if (candidate.category === currentArticle.category) {
        score += 1.5;
      }

      // Confidence score weighting
      score += (candidate.confidenceScore || 80) / 100;

      if (matchedKw.length > 0 || candidate.category === currentArticle.category) {
        scored.push({
          article: candidate,
          matchedKeywords: matchedKw,
          relevanceScore: score,
        });
      }
    });

    // Sort by relevance score descending
    scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return scored;
  }, [allArticles, currentArticle, detectedKeywords]);

  /**
   * 3. FILTER BY ACTIVE TOPIC PILL
   */
  const displayedArticles = useMemo(() => {
    if (activeKeywordFilter === 'ALL') {
      return scoredSuggestions.slice(0, 6);
    }
    return scoredSuggestions
      .filter((item) =>
        item.matchedKeywords.some(
          (kw) => kw.toLowerCase() === activeKeywordFilter.toLowerCase()
        )
      )
      .slice(0, 6);
  }, [scoredSuggestions, activeKeywordFilter]);

  // Keyword counts for badges
  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    detectedKeywords.forEach((kw) => {
      const matchCount = scoredSuggestions.filter((item) =>
        item.matchedKeywords.some((k) => k.toLowerCase() === kw.toLowerCase())
      ).length;
      counts[kw] = matchCount;
    });
    return counts;
  }, [detectedKeywords, scoredSuggestions]);

  if (detectedKeywords.length === 0 && scoredSuggestions.length === 0) {
    return null;
  }

  const handleSearchKeyword = (e: React.MouseEvent, keyword: string) => {
    e.stopPropagation();
    navigateTo('search', { query: keyword });
  };

  return (
    <section className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
      {/* Header with Title and Description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-[11px] font-bold uppercase tracking-wider">
            <Tag className="w-3 h-3 text-red-600" />
            <span>{t.keywordMatchBadge || 'Keyword Intelligence'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-serif">
            {t.relatedTopicsHeading || 'Related Topics & Keyword Intelligence'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            {t.relatedTopicsSubtitle ||
              'Explore stories connected by detected keywords, cross-referenced entities, and thematic tags.'}
          </p>
        </div>

        {/* Explore in Category Action */}
        <button
          onClick={() => navigateTo('category', { category: currentArticle.category })}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 self-start md:self-auto transition-colors group"
        >
          <span>
            {language === 'bn'
              ? `${currentArticle.category} বিভাগের সব খবর`
              : `More in ${currentArticle.category}`}
          </span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Detected Keywords Filter Bar */}
      <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t.detectedKeywords || 'Detected Topics in This Story'}:</span>
          </div>
          <span className="text-[11px]">
            {language === 'bn' ? 'ফিল্টার করতে যেকোনো বিষয়ে ক্লিক করুন' : 'Click a topic to filter stories'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* ALL TOPICS BUTTON */}
          <button
            onClick={() => setActiveKeywordFilter('ALL')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeKeywordFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm scale-[1.02]'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.allKeywords || 'All Topics'}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeKeywordFilter === 'ALL'
                  ? 'bg-white/20 dark:bg-slate-900/20'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {scoredSuggestions.length}
            </span>
          </button>

          {/* INDIVIDUAL DETECTED KEYWORDS */}
          {detectedKeywords.map((kw) => {
            const count = keywordCounts[kw] || 0;
            const isActive = activeKeywordFilter.toLowerCase() === kw.toLowerCase();

            return (
              <div
                key={kw}
                className={`inline-flex items-center rounded-xl transition-all border ${
                  isActive
                    ? 'bg-red-600 text-white border-red-600 shadow-sm scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400'
                }`}
              >
                <button
                  onClick={() => setActiveKeywordFilter(isActive ? 'ALL' : kw)}
                  className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  <Hash className="w-3 h-3 opacity-70" />
                  <span>{kw}</span>
                  {count > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white/25 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>

                {/* Quick Search Shortcut inside pill */}
                <button
                  onClick={(e) => handleSearchKeyword(e, kw)}
                  title={`${t.exploreKeywordInSearch || 'Search wire for'} "${kw}"`}
                  className={`pr-2.5 pl-1 py-1.5 text-xs transition-opacity hover:opacity-100 ${
                    isActive ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                >
                  <Search className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Articles Grid */}
      {displayedArticles.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {t.noKeywordMatches ||
              'No other dispatches found matching this specific keyword in the immediate wire.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setActiveKeywordFilter('ALL')}
              className="text-xs font-bold text-red-600 hover:underline"
            >
              {language === 'bn' ? 'সকল সম্পর্কিত সংবাদ দেখুন' : 'View all related stories'}
            </button>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <button
              onClick={(e) => handleSearchKeyword(e, activeKeywordFilter)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600"
            >
              <Search className="w-3 h-3" />
              <span>
                {t.exploreKeywordInSearch || 'Search wire for'} "{activeKeywordFilter}"
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedArticles.map(({ article: rel, matchedKeywords }) => {
            const isSaved = savedArticles.includes(rel.id);
            const title = language === 'bn' && rel.titleBn ? rel.titleBn : rel.title;
            const summary = language === 'bn' && rel.summaryBn ? rel.summaryBn : rel.summary;

            return (
              <div
                key={rel.id}
                onClick={() => navigateTo('news-detail', { slug: rel.slug })}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-red-400 dark:hover:border-red-600/60 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Card Top: Matched Keywords Ribbon */}
                <div className="p-4 sm:p-5 space-y-3">
                  {/* Matched Keywords Tags Ribbon */}
                  {matchedKeywords.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5 text-red-500" />
                        <span>{t.matchedKeywordsLabel || 'Matched'}:</span>
                      </span>
                      {matchedKeywords.slice(0, 3).map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-[10px] font-bold border border-red-200/80 dark:border-red-900/80"
                        >
                          #{kw}
                        </span>
                      ))}
                      {matchedKeywords.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-mono">
                          +{matchedKeywords.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <span>{rel.category}</span>
                    </div>
                  )}

                  {/* Thumbnail / Image if available */}
                  {rel.imageUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                      <img
                        src={rel.imageUrl}
                        alt={title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <StatusBadge status={rel.verificationStatus} size="sm" />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveArticle(rel.id);
                        }}
                        aria-label={isSaved ? 'Remove from saved' : 'Save article'}
                        className={`absolute top-2 right-2 p-2 rounded-xl backdrop-blur-md transition-colors ${
                          isSaved
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-black/40 text-white hover:bg-black/60'
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  )}

                  {/* Title */}
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug font-serif">
                    {title}
                  </h4>

                  {/* Summary Snippet */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {summary}
                  </p>
                </div>

                {/* Card Footer Meta */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50/80 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {rel.primarySource?.name || 'TruthPulse Wire'}
                    </span>
                    <span>•</span>
                    <span>{formatDhakaTime(rel.publishedAt)}</span>
                  </div>

                  <div className="flex items-center gap-1 font-bold text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform">
                    <span>{language === 'bn' ? 'পড়ুন' : 'Read'}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
