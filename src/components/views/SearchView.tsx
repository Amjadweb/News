import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle } from '../../types';
import { NewsCard } from '../NewsCard';
import {
  Search,
  Bookmark,
  RefreshCw,
  History,
  Clock,
  X,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { fetchArticlesSafe } from '../../services/api';

const RECENT_SEARCHES_KEY = 'truthpulse_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export const SearchView: React.FC = () => {
  const { t, viewPayload, savedArticles } = useApp();
  const [query, setQuery] = useState(viewPayload?.query || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedOnly, setSavedOnly] = useState(Boolean(viewPayload?.savedOnly));
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize recent searches from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
            .slice(0, MAX_RECENT_SEARCHES);
        }
      }
    } catch (err) {
      console.warn('Could not read recent searches from localStorage', err);
    }
    return [];
  });

  const saveSearchQuery = useCallback((searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not save recent search to localStorage', err);
      }
      return updated;
    });
  }, []);

  const handleDeleteRecent = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Could not update recent searches', err);
      }
      return updated;
    });
  };

  const handleClearAllRecents = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (err) {
      console.warn('Could not clear recent searches', err);
    }
  };

  const fetchSearchResults = useCallback(
    async (searchQuery: string, category: string, isSavedOnly: boolean) => {
      setLoading(true);
      try {
        const res = await fetchArticlesSafe({
          search: searchQuery.trim() || undefined,
          category: category !== 'All' ? category : undefined,
        });
        let list = Array.isArray(res) ? res : res.articles || [];

        if (isSavedOnly) {
          list = list.filter((a) => savedArticles.includes(a.id));
        }
        setArticles(list);
      } catch (err) {
        console.warn('Search query fallback handled', err);
      } finally {
        setLoading(false);
      }
    },
    [savedArticles]
  );

  useEffect(() => {
    const initialQuery = viewPayload?.query || '';
    const initialSavedOnly = Boolean(viewPayload?.savedOnly);

    if (viewPayload?.query) {
      setQuery(viewPayload.query);
      saveSearchQuery(viewPayload.query);
    }
    if (viewPayload?.savedOnly !== undefined) {
      setSavedOnly(viewPayload.savedOnly);
    }

    fetchSearchResults(initialQuery, selectedCategory, initialSavedOnly);
  }, [viewPayload, selectedCategory, savedOnly, fetchSearchResults, saveSearchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      saveSearchQuery(trimmed);
    }
    fetchSearchResults(query, selectedCategory, savedOnly);
  };

  const handleSelectRecentSearch = (selectedTerm: string) => {
    setQuery(selectedTerm);
    saveSearchQuery(selectedTerm);
    fetchSearchResults(selectedTerm, selectedCategory, savedOnly);
  };

  const handleClearSearchInput = () => {
    setQuery('');
    fetchSearchResults('', selectedCategory, savedOnly);
  };

  const suggestedTopics = [
    'Artificial Intelligence',
    'Bangladesh Economy',
    'Cybersecurity',
    'Renewable Energy',
    'Semiconductors',
    'Climate Policy',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-5 shadow-lg shadow-slate-950/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
            {savedOnly ? t.savedReadingList || 'Saved Reading List' : t.searchWireHeading || 'Search Intelligence Wire'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time keyword lookup, claim verification retrieval, and multi-source cross-reference exploration.
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder || 'Search keywords, topics, entities, or claims...'}
            className="w-full pl-11 pr-32 py-3.5 bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {query && (
              <button
                type="button"
                onClick={handleClearSearchInput}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Clear input"
                aria-label="Clear input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Recent Searches Section */}
        {recentSearches.length > 0 ? (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold tracking-wide">
                <History className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.recentSearches || 'Recent Searches'}</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full font-mono">
                  {recentSearches.length}
                </span>
              </div>
              <button
                onClick={handleClearAllRecents}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                title="Clear all recent searches"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t.clearRecentSearches || 'Clear History'}</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {recentSearches.map((term) => {
                const isActive = query.trim().toLowerCase() === term.toLowerCase();
                return (
                  <div
                    key={term}
                    onClick={() => handleSelectRecentSearch(term)}
                    className={`group inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all border select-none ${
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-xs'
                        : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/90 hover:text-white'
                    }`}
                  >
                    <Clock className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
                    <span className="truncate max-w-[160px] sm:max-w-xs">{term}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteRecent(term, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title={`Remove "${term}" from history`}
                      aria-label={`Remove ${term}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.suggestedTopics || 'Suggested Topics'}</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {suggestedTopics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSelectRecentSearch(topic)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer"
                >
                  <Search className="w-3 h-3 text-slate-500" />
                  <span>{topic}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs border-t border-slate-800/60">
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
              savedOnly
                ? 'bg-emerald-500 text-slate-950 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{t.savedOnlyLabel || 'Saved Only'} ({savedArticles.length})</span>
          </button>

          {['All', 'Bangladesh', 'International', 'Technology', 'Artificial Intelligence', 'Business'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-950 dark:bg-slate-100 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat === 'All' ? t.filterAll || 'All Categories' : cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Results List */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Found <strong className="text-slate-900 dark:text-white">{articles.length}</strong> {t.verifiedDispatchesFound || 'verified dispatches found'}
            {query.trim() && (
              <span> for &ldquo;<span className="text-emerald-600 dark:text-emerald-400 font-medium">{query.trim()}</span>&rdquo;</span>
            )}
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-500">Searching records...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No dispatches found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with broader keywords, selecting a different category, or checking your spelling.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <NewsCard key={art.id} article={art} layout="standard" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

