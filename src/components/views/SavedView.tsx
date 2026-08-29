import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle, NewsCategory } from '../../types';
import { NewsCard } from '../NewsCard';
import { StatusBadge, ConfidenceScorePill } from '../StatusBadge';
import {
  Bookmark,
  BookmarkCheck,
  Trash2,
  Share2,
  Search,
  Grid,
  List,
  Clock,
  BookOpen,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Radio,
  X,
  Copy,
  Check
} from 'lucide-react';
import { fetchSavedArticlesSafe, fetchTopNewsSafe } from '../../services/api';

export const SavedView: React.FC = () => {
  const {
    t,
    language,
    formatDhakaTime,
    savedArticles,
    toggleSaveArticle,
    clearAllSavedArticles,
    navigateTo,
    addToast,
  } = useApp();

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [suggestedArticles, setSuggestedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'recent' | 'date' | 'confidence'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [copiedExport, setCopiedExport] = useState(false);

  // Load saved articles from API / storage
  useEffect(() => {
    loadSaved();
  }, [savedArticles]);

  // Load top news for suggested items if empty or few
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const top = await fetchTopNewsSafe(6);
        setSuggestedArticles(top.articles || []);
      } catch (e) {
        // Fallback
      }
    };
    loadSuggestions();
  }, []);

  const loadSaved = async () => {
    setLoading(true);
    try {
      const items = await fetchSavedArticlesSafe(savedArticles);
      setArticles(items);
    } catch (err) {
      console.warn('Could not load saved articles', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate distinct categories present in saved articles
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    articles.forEach((a) => {
      if (a.category) cats.add(a.category);
    });
    return ['All', ...Array.from(cats)];
  }, [articles]);

  // Calculate estimated total reading time (minutes)
  const totalReadingTimeMinutes = useMemo(() => {
    if (articles.length === 0) return 0;
    const totalWords = articles.reduce((acc, curr) => {
      const summaryWords = (curr.summary || '').split(/\s+/).length;
      const contentWords = (curr.content || curr.summary || '').split(/\s+/).length;
      return acc + Math.max(summaryWords, contentWords);
    }, 0);
    return Math.max(1, Math.ceil(totalWords / 200));
  }, [articles]);

  // Filter and sort saved articles
  const filteredArticles = useMemo(() => {
    let list = [...articles];

    if (selectedCategory !== 'All') {
      list = list.filter((a) => a.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const titleMatch = a.title.toLowerCase().includes(q) || (a.titleBn && a.titleBn.toLowerCase().includes(q));
        const summaryMatch = a.summary.toLowerCase().includes(q) || (a.summaryBn && a.summaryBn.toLowerCase().includes(q));
        const tagMatch = a.tags.some((t) => t.toLowerCase().includes(q));
        const sourceMatch = a.primarySource?.name?.toLowerCase().includes(q);
        return titleMatch || summaryMatch || tagMatch || sourceMatch;
      });
    }

    if (sortBy === 'date') {
      list.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    } else if (sortBy === 'confidence') {
      list.sort((a, b) => (b.confidenceScore || 0) - (a.confidenceScore || 0));
    } else {
      // 'recent' preserved in order of savedArticles array (latest first)
      list.sort((a, b) => {
        const idxA = savedArticles.indexOf(a.id);
        const idxB = savedArticles.indexOf(b.id);
        return idxB - idxA;
      });
    }

    return list;
  }, [articles, selectedCategory, searchQuery, sortBy, savedArticles]);

  const handleExportList = () => {
    if (articles.length === 0) return;
    const textLines = articles.map((a, i) => {
      const title = language === 'bn' && a.titleBn ? a.titleBn : a.title;
      return `${i + 1}. ${title} [${a.category}] - ${a.primarySource?.name || 'TruthPulse AI'}`;
    });
    const exportContent = `TruthPulse AI Saved Reading List (${new Date().toLocaleDateString()}):\n\n` + textLines.join('\n');

    navigator.clipboard.writeText(exportContent).then(() => {
      setCopiedExport(true);
      addToast(t.readingListExported || 'Reading list exported to clipboard', 'success');
      setTimeout(() => setCopiedExport(false), 3000);
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>{t.navSaved || 'Personal Reading List'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            {t.savedArticlesHeading || 'Saved Dispatches & Reading List'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.savedArticlesSubtitle ||
              'Access and manage your bookmarked investigative reports, verified dispatches, and deep analytics saved in your browser.'}
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-emerald-400 font-semibold">
              <Bookmark className="w-3.5 h-3.5 text-red-400" />
              {savedArticles.length} {language === 'bn' ? 'টি সংরক্ষিত' : 'Bookmarked Items'}
            </span>

            {articles.length > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 font-mono text-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                ~{totalReadingTimeMinutes} {language === 'bn' ? 'মিনিট পড়ার সময়' : 'min total read'}
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-700 text-slate-400 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              {language === 'bn' ? 'ব্রাউজার লোকাল স্টোরেজে সংরক্ষিত' : 'Saved Locally'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        {savedArticles.length > 0 && (
          <div className="flex sm:flex-col items-center sm:items-end gap-2.5 shrink-0 pt-2 sm:pt-0">
            <button
              onClick={handleExportList}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors shadow-sm"
              title="Copy reading list titles"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedExport ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied!') : (t.exportSavedList || 'Export List')}</span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>{t.clearAllSaved || 'Clear All'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {articles.length === 0 && !loading ? (
        /* Empty State */
        <div className="space-y-10">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
              {t.noSavedArticlesTitle || 'Your Reading List is Empty'}
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              {t.noSavedArticlesDesc ||
                'Bookmark stories across TruthPulse AI by clicking the bookmark icon on any dispatch card or article page.'}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => navigateTo('home')}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t.exploreNewsCTA || 'Explore Top Stories'}</span>
              </button>

              <button
                onClick={() => navigateTo('today')}
                className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Radio className="w-4 h-4 text-red-500" />
                <span>{t.todaysNews || "Today's Wire"}</span>
              </button>
            </div>
          </div>

          {/* Suggested Articles to start bookmarking */}
          {suggestedArticles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'সংরক্ষণ করার জন্য প্রস্তাবিত সংবাদ' : 'Recommended Stories to Bookmark'}
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {language === 'bn' ? 'সংরক্ষণ করতে বুকমার্ক আইকনে ক্লিক করুন' : 'Click the bookmark icon on any story'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suggestedArticles.slice(0, 3).map((article) => (
                  <NewsCard key={article.id} article={article} layout="standard" />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Populated Saved Articles List */
        <div className="space-y-6">
          {/* Controls Bar: Search, Category Filters, Sort, View Switcher */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search within saved */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchSavedPlaceholder || 'Search within saved articles...'}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-red-500/50 dark:text-white placeholder:text-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter, Sort & View Mode Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-red-500/50 font-medium"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-red-500/50 font-medium"
                >
                  <option value="recent">{language === 'bn' ? 'সম্প্রতি সংরক্ষিত' : 'Recently Saved'}</option>
                  <option value="date">{language === 'bn' ? 'প্রকাশের তারিখ' : 'Date Published'}</option>
                  <option value="confidence">{language === 'bn' ? 'যাচাই স্কোর' : 'Highest Confidence'}</option>
                </select>
              </div>

              {/* Grid / List Layout Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid layout"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List layout"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              {language === 'bn'
                ? `${filteredArticles.length} টি সংরক্ষিত নিবন্ধ প্রদর্শিত হচ্ছে`
                : `Showing ${filteredArticles.length} of ${articles.length} bookmarked dispatches`}
            </span>

            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-red-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>{language === 'bn' ? 'ফিল্টার মুছুন' : 'Reset category'}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Article List / Grid Render */}
          {filteredArticles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                {language === 'bn'
                  ? 'আপনার অনুসন্ধানের সাথে কোনো সংরক্ষিত সংবাদ মেলেনি।'
                  : 'No saved stories match your current search or category filter.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="mt-3 text-xs text-red-600 hover:underline font-semibold"
              >
                {language === 'bn' ? 'সকল ফিল্টার রিসেট করুন' : 'Clear search and filter'}
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <NewsCard key={article.id} article={article} layout="standard" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <NewsCard key={article.id} article={article} layout="horizontal" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal for Clearing All Bookmarks */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-950 dark:text-white">
                {t.clearAllSaved || 'Clear All Saved Articles'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.clearAllSavedConfirm ||
                'Are you sure you want to remove all saved articles from your reading list? This action cannot be undone.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t.close || 'Cancel'}
              </button>
              <button
                onClick={() => {
                  clearAllSavedArticles();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition-colors"
              >
                {language === 'bn' ? 'হ্যাঁ, সবগুলো মুছুন' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
