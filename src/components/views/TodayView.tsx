import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle, NewsCategory, NewsSyncStatus } from '../../types';
import { NewsCard } from '../NewsCard';
import { Radio, Filter, ArrowUpDown, Calendar, RefreshCw, CheckCircle2, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import { fetchArticlesSafe, fetchSyncStatusSafe } from '../../services/api';

const CATEGORIES = [
  'All',
  'Bangladesh',
  'International',
  'Technology',
  'Artificial Intelligence',
  'Business',
  'Finance & Economy',
  'Sports',
  'Health',
  'Science',
  'Education',
  'Entertainment',
  'Environment',
];

export const TodayView: React.FC = () => {
  const { t, formatDhakaTime } = useApp();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [syncStatus, setSyncStatus] = useState<NewsSyncStatus | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTodayNews();
  }, [selectedCategory, sortBy, verificationFilter]);

  const fetchTodayNews = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const [data, status] = await Promise.all([
        fetchArticlesSafe({
          category: selectedCategory,
          verificationStatus: verificationFilter,
          sort: sortBy,
        }),
        fetchSyncStatusSafe(),
      ]);

      setArticles(data.articles);
      if (data.syncStatus) setSyncStatus(data.syncStatus);
      else if (status) setSyncStatus(status);
    } catch (err) {
      console.warn('Using cached today articles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner with Dhaka Time Stamp and Pipeline Status */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Today's Live Intelligence Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.todaysNews}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time feed of dynamic news stories, refreshed every 15 minutes with 12-hour expiration decay and automated ranking.
          </p>
          {syncStatus && (
            <div className="flex items-center gap-3 pt-1 text-xs text-emerald-400 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {syncStatus.activeCount ?? syncStatus.activeArticlesCount ?? 0} Active Stories
              </span>
              <span>•</span>
              <span>{syncStatus.activeSources ?? syncStatus.activeSourcesCount ?? 0} Wire Sources</span>
              <span>•</span>
              <span>12h Expiration Active</span>
            </div>
          )}
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1.5 shrink-0">
          <div className="text-emerald-400 font-semibold flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>Asia/Dhaka Standard Time</span>
            </div>
            <button
              onClick={() => fetchTodayNews(true)}
              disabled={refreshing}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white"
              title="Refresh News Feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
          <div className="text-slate-200 text-sm font-bold">
            {new Date().toLocaleDateString('en-US', {
              timeZone: 'Asia/Dhaka',
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </div>
          <div className="text-[11px] text-slate-400">
            Current Dhaka Time: {new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka' })}
          </div>
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-xs">
        {/* Category Chips Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? 'All Desks' : cat}
            </button>
          ))}
        </div>

        {/* Verification and Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {['All', 'VERIFIED', 'DEVELOPING', 'UNVERIFIED', 'DISPUTED'].map((st) => (
              <button
                key={st}
                onClick={() => setVerificationFilter(st)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                  verificationFilter === st
                    ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 font-semibold">Rank By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-900 dark:text-white font-medium"
            >
              <option value="Latest">Dynamic Decay Rank</option>
              <option value="Important">Importance Score</option>
              <option value="Trending">Trending Velocity</option>
              <option value="Most Read">Most Read</option>
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Querying dynamic news rotation pipeline...
          </p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Clock className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Active Stories in this Selection
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All previous stories in this category may have reached their 12-hour expiration window or are currently being refreshed by the pipeline.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setVerificationFilter('All');
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{articles.length}</strong> active verified news stories
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <NewsCard key={art.id} article={art} layout="standard" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
