import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle, FactCheckItem, TrendingTopic } from '../../types';
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
} from 'lucide-react';
import { fetchArticlesSafe, fetchFactChecksSafe, fetchTrendingSafe } from '../../services/api';

export const HomeView: React.FC = () => {
  const { t, language, navigateTo, formatDhakaTime } = useApp();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [factChecks, setFactChecks] = useState<FactCheckItem[]>([]);
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const [fetchedArticles, fetchedFc, fetchedTrending] = await Promise.all([
        fetchArticlesSafe(),
        fetchFactChecksSafe(),
        fetchTrendingSafe(),
      ]);

      setArticles(fetchedArticles);
      setFactChecks(fetchedFc.slice(0, 3));
      setTrending(fetchedTrending);
    } catch (err) {
      console.warn('Network notice: utilizing local verified news cache');
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
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

      {/* 2. TODAY'S TOP VERIFIED STORIES GRID */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.todaysNews}
            </h2>
          </div>
          <button
            onClick={() => navigateTo('today')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>{t.exploreAllNews}</span>
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
            {bangladeshNews.map((art) => (
              <NewsCard key={art.id} article={art} layout="horizontal" />
            ))}
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
                      Verdict: {fc.verdict}
                    </span>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium">
                      {fc.confidenceScore}% Confidence
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    "{fc.claim}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. DATA ANALYZER AI INTERACTIVE CTA BANNER */}
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white p-6 sm:p-8 border border-emerald-800/40 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
            <Database className="w-3.5 h-3.5" />
            <span>Autonomous Tabular Profiling & Data Truth Verification</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.dataAnalyzerCTA}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.dataAnalyzerSubtitle}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigateTo('analyzer')}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Database className="w-4 h-4" />
              <span>{t.uploadCTA}</span>
            </button>

            <button
              onClick={() => navigateTo('analyzer', { preloaded: 'sales' })}
              className="bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium px-4 py-2.5 rounded-xl text-xs transition-colors"
            >
              Test with Global Tech Trade Data →
            </button>
          </div>
        </div>
      </section>

      {/* 5. TECH & ARTIFICIAL INTELLIGENCE SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.techAndAI}
            </h2>
          </div>
          <button
            onClick={() => navigateTo('category', { category: 'Artificial Intelligence' })}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            {t.exploreAllNews}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {techAndAINews.map((art) => (
            <NewsCard key={art.id} article={art} layout="standard" />
          ))}
        </div>
      </section>

      {/* 6. HOW TRUTHPULSE AI WORKS (TRUST & TRANSPARENCY SECTION) */}
      <section className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Editorial Architecture</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t.howItWorksTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            TruthPulse AI operates under a multi-stage verification pipeline ensuring every story, claim, and dataset is cross-checked against accredited sources before certification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Source Collection</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Automated ingestion from accredited official APIs, RSS wires, and public datasets.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Event Deduplication</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Multi-source clustering combines corroborating coverage into unified Event Groups.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Claim Extraction</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Synthesizes key assertions, calculates confidence metrics, and flags potential contradictions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="w-7 h-7 rounded-lg bg-slate-900 text-white dark:bg-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center">
              4
            </span>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Editorial Review</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Human newsroom oversight audits high-risk items prior to final publishing.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
