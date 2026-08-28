import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle, NewsCategory } from '../../types';
import { NewsCard } from '../NewsCard';
import { Radio, Filter, ArrowUpDown, Calendar, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react';
import { fetchArticlesSafe } from '../../services/api';

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest');
  const [verificationFilter, setVerificationFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayNews();
  }, [selectedCategory, sortBy, verificationFilter]);

  const fetchTodayNews = async () => {
    setLoading(true);
    try {
      const data = await fetchArticlesSafe({
        category: selectedCategory,
        verificationStatus: verificationFilter,
        sort: sortBy,
      });
      setArticles(data);
    } catch (err) {
      console.warn('Using cached today articles');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner with Dhaka Time Stamp */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/90 text-white text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Today's Verified Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.todaysNews}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time feed of today's corroborated dispatches, chronologically recorded and verified against official registries.
          </p>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs font-mono space-y-1.5 shrink-0">
          <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>Asia/Dhaka Standard Time</span>
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
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting and Verification Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            {['Latest', 'Important', 'Trending', 'Most Read', 'Recently Updated'].map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortBy === s
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {['All', 'Verified', 'Mostly Verified', 'Mixed Evidence'].map((v) => (
              <button
                key={v}
                onClick={() => setVerificationFilter(v)}
                className={`px-2 py-0.5 rounded-md border text-[11px] transition-colors ${
                  verificationFilter === v
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading verified dispatches...</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No articles matched your criteria</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try switching to another category or resetting the verification filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setVerificationFilter('All');
              setSortBy('Latest');
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <NewsCard key={art.id} article={art} layout="standard" />
          ))}
        </div>
      )}
    </div>
  );
};
