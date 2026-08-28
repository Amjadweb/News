import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle } from '../../types';
import { NewsCard } from '../NewsCard';
import { Search, Filter, Bookmark, Radio, RefreshCw } from 'lucide-react';
import { fetchArticlesSafe } from '../../services/api';

export const SearchView: React.FC = () => {
  const { t, viewPayload, savedArticles } = useApp();
  const [query, setQuery] = useState(viewPayload?.query || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedOnly, setSavedOnly] = useState(Boolean(viewPayload?.savedOnly));
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (viewPayload?.query) setQuery(viewPayload.query);
    if (viewPayload?.savedOnly !== undefined) setSavedOnly(viewPayload.savedOnly);
    fetchSearchResults();
  }, [viewPayload, selectedCategory, savedOnly]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      let list = await fetchArticlesSafe({
        search: query.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });

      if (savedOnly) {
        list = list.filter((a) => savedArticles.includes(a.id));
      }
      setArticles(list);
    } catch (err) {
      console.warn('Search query fallback handled');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearchResults();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {savedOnly ? 'Saved Reading List' : 'Search Intelligence Wire'}
        </h1>

        <form onSubmit={handleSearchSubmit} className="relative max-w-2xl">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, topics, entities, or claims..."
            className="w-full pl-11 pr-24 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold transition-colors ${
              savedOnly
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Only ({savedArticles.length})</span>
          </button>

          {['All', 'Bangladesh', 'International', 'Technology', 'Artificial Intelligence', 'Business'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-950 dark:bg-slate-100'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Results List */}
      <div>
        <div className="flex items-center justify-between mb-4 text-xs text-slate-500">
          <span>Found {articles.length} verified dispatches</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-500">Searching records...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-2">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No dispatches found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching with broader keywords or clear your category filter.
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
