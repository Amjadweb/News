import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle, FactCheckItem, TrendingTopic, NewsSyncStatus } from '../../types';
import { NewsCard } from '../NewsCard';
import { StatusBadge, ConfidenceScorePill } from '../StatusBadge';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Radio,
  Flame,
  Globe2,
  Cpu,
  Coins,
  Medal,
  RefreshCw,
  ExternalLink,
  Layers,
  FileCheck,
  Clock,
  Zap,
} from 'lucide-react';
import { fetchTopNewsSafe, fetchFactChecksSafe, fetchTrendingSafe, fetchSyncStatusSafe } from '../../services/api';

export const HomeView: React.FC = () => {
  const { t, language, navigateTo, formatDhakaTime } = useApp();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [syncStatus, setSyncStatus] = useState<NewsSyncStatus | null>(null);
  const [factChecks, setFactChecks] = useState<FactCheckItem[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [topNewsResult, fetchedFc, fetchedTrending, fetchedStatus] = await Promise.all([
        fetchTopNewsSafe(20),
        fetchFactChecksSafe(),
        fetchTrendingSafe(),
        fetchSyncStatusSafe(),
      ]);

      setArticles(topNewsResult.articles);
      if (topNewsResult.syncStatus) {
        setSyncStatus(topNewsResult.syncStatus);
      } else if (fetchedStatus) {
        setSyncStatus(fetchedStatus);
      }
      setFactChecks(fetchedFc.slice(0, 3));
      setTrending(fetchedTrending);
    } catch (err) {
      console.warn('Network notice: utilizing local verified news cache');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const breakingArticles = articles.filter((a) => a.isBreaking);
  const featuredArticle = breakingArticles[0] || articles[0];
  const bangladeshNews = articles.filter((a) => a.category === 'Bangladesh');
  const techAndAINews = articles.filter(
    (a) => a.category === 'Technology' || a.category === 'Artificial Intelligence'
  );
  const worldNews = articles.filter((a) => a.category === 'International');
  const businessAndSports = articles.filter(
    (a) => a.category === 'Business' || a.category === 'Finance & Economy' || a.category === 'Sports'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* REAL-TIME DYNAMIC ROTATION STATUS BAR */}
      <div className="bg-slate-900/90 dark:bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shadow-sm backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white">Live News Rotation Pipeline Active</span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-slate-400">
            {syncStatus ? `${syncStatus.activeCount ?? syncStatus.activeArticlesCount ?? 0} stories live (${syncStatus.activeSources ?? syncStatus.activeSourcesCount ?? 0} sources)` : 'Auto-updates every 15 min'}
          </span>
          <span className="hidden md:inline text-slate-500">•</span>
          <span className="hidden md:inline text-slate-400">
            12-Hour Expiration Active
          </span>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {(syncStatus?.lastSyncTime || syncStatus?.lastSyncCompletedAt) && (
            <span className="text-[11px] text-slate-400 font-mono hidden lg:inline">
              Updated: {new Date(syncStatus.lastSyncTime || syncStatus.lastSyncCompletedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchHomeData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-[11px] font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh Feed'}</span>
          </button>
        </div>
      </div>

      {/* 1. TOP BREAKING & VERIFIED SPOTLIGHT HERO */}
      {featuredArticle && (
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 text-white p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  {t.breakingNews}
                </span>
                <span className="bg-slate-800 text-slate-200 text-xs font-medium px-3 py-1 rounded-full border border-slate-700">
                  {featuredArticle.category}
                </span>
                <StatusBadge status={featuredArticle.verificationStatus} size="sm" />
                <ConfidenceScorePill score={featuredArticle.confidenceScore} />
              </div>

              <h1
                onClick={() =>
                  navigateTo('news-detail', {
                    slug: featuredArticle.slug,
                    articleId: featuredArticle.id,
                  })
                }
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight hover:text-emerald-400 cursor-pointer transition-colors leading-tight"
              >
                {language === 'bn' && featuredArticle.titleBn
                  ? featuredArticle.titleBn
                  : featuredArticle.title}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-2xl">
                {language === 'bn' && featuredArticle.summaryBn
                  ? featuredArticle.summaryBn
                  : featuredArticle.summary}
              </p>

              {/* Key Verified Facts Strip */}
              {featuredArticle.keyFacts && featuredArticle.keyFacts.length > 0 && (
                <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/80 space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t.keyFacts} (Cross-Checked)</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 pl-1">
                    {featuredArticle.keyFacts.slice(0, 2).map((fact, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                <span>
                  Source:{' '}
                  <strong className="text-white">{featuredArticle.primarySource?.name}</strong>
                </span>
                <span>•</span>
                <span>{formatDhakaTime(featuredArticle.publishedAt)}</span>
                <button
                  onClick={() =>
                    navigateTo('news-detail', {
                      slug: featuredArticle.slug,
                      articleId: featuredArticle.id,
                    })
                  }
                  className="ml-auto inline-flex items-center gap-1 text-emerald-400 font-semibold hover:underline"
                >
                  <span>{t.readMore}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div
              onClick={() =>
                navigateTo('news-detail', {
                  slug: featuredArticle.slug,
                  articleId: featuredArticle.id,
                })
              }
              className="lg:col-span-5 h-64 sm:h-80 rounded-xl overflow-hidden cursor-pointer relative group border border-slate-800"
            >
              <img
                src={featuredArticle.imageUrl}
                alt={featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              {featuredArticle.imageCaption && (
                <div className="absolute bottom-3 left-3 right-3 text-xs text-slate-300 italic bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-xs">
                  {featuredArticle.imageCaption}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. TODAY'S TOP DYNAMICALLY RANKED STORIES GRID (TOP 6 OF TOP 20) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.todaysNews}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold hidden sm:inline-block">
              Top Ranked Feed
            </span>
          </div>
          <button
            onClick={() => navigateTo('today')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t.exploreAllNews} ({articles.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.slice(0, 6).map((art) => (
            <NewsCard key={art.id} article={art} layout="standard" />
          ))}
        </div>
      </section>

      {/* 3. DUAL COLUMN: BANGLADESH DISPATCHES & TRENDING TOPICS */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Bangladesh Focus (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🇧🇩</span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {t.bangladeshSpotlight}
              </h2>
            </div>
            <button
              onClick={() => navigateTo('category', { category: 'Bangladesh' })}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t.exploreAllNews}
            </button>
          </div>

          <div className="space-y-4">
            {bangladeshNews.length > 0 ? (
              bangladeshNews.slice(0, 4).map((art) => (
                <NewsCard key={art.id} article={art} layout="horizontal" />
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                No active Bangladesh stories at this sync cycle. Ingestion is scheduled to fetch updates shortly.
              </div>
            )}
          </div>
        </div>

        {/* Trending Velocity & Quick Fact Check sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Trending Topics Card */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                {t.trendingTopics}
              </h3>
            </div>

            <div className="space-y-3">
              {trending.map((tr) => (
                <div
                  key={tr.id}
                  onClick={() => navigateTo('trending', { topicId: tr.id })}
                  className="group p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                      {language === 'bn' && tr.topicBn ? tr.topicBn : tr.topic}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded text-[10px]">
                      +{tr.growthPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300">
                    <span>{tr.mentionCount} Mentions</span>
                    <span>•</span>
                    <span>{tr.sourcesCount} Accredited Sources</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigateTo('trending')}
              className="w-full text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-2 block"
            >
              View Full Trend Radar →
            </button>
          </div>

          {/* Recent Fact Checks Widget */}
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {t.recentFactChecks}
                </h3>
              </div>
              <button
                onClick={() => navigateTo('fact-check')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                Inspect
              </button>
            </div>

            <div className="space-y-3">
              {factChecks.map((fc) => (
                <div
                  key={fc.id}
                  onClick={() => navigateTo('fact-check', { factCheckId: fc.id })}
                  className="p-3 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:border-emerald-500 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        fc.verdict === 'TRUE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : fc.verdict === 'FALSE'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {fc.verdict}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{fc.category}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                    {language === 'bn' && fc.claimBn ? fc.claimBn : fc.claim}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. TECHNOLOGY & AI FRONTIERS */}
      {techAndAINews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                AI & Technology Frontiers
              </h2>
            </div>
            <button
              onClick={() => navigateTo('category', { category: 'Technology' })}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t.exploreAllNews}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techAndAINews.slice(0, 3).map((art) => (
              <NewsCard key={art.id} article={art} layout="standard" />
            ))}
          </div>
        </section>
      )}

      {/* 5. GLOBAL & INTERNATIONAL DISPATCHES */}
      {worldNews.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Global Dispatches
              </h2>
            </div>
            <button
              onClick={() => navigateTo('category', { category: 'International' })}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t.exploreAllNews}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {worldNews.slice(0, 3).map((art) => (
              <NewsCard key={art.id} article={art} layout="standard" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
