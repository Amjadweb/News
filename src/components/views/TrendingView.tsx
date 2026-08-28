import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingTopic, NewsArticle } from '../../types';
import { NewsCard } from '../NewsCard';
import { Flame, TrendingUp, Radio, Building2, ArrowRight } from 'lucide-react';
import { fetchTrendingSafe, fetchArticlesSafe } from '../../services/api';

export const TrendingView: React.FC = () => {
  const { t, language, navigateTo } = useApp();
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const [fetchedTrending, fetchedNews] = await Promise.all([
        fetchTrendingSafe(),
        fetchArticlesSafe({ sort: 'Trending' }),
      ]);
      setTrending(fetchedTrending);
      setArticles(fetchedNews);
    } catch (err) {
      console.warn('Using cached trending data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">
          <Flame className="w-3.5 h-3.5" />
          <span>Velocity & Emerging Radar</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t.trendingTopics}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Real-time algorithmic detection of accelerating stories across national and international wires.
        </p>
      </div>

      {/* Trending Topics Radar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {trending.map((topic) => (
          <div
            key={topic.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 hover:border-emerald-500 transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {topic.category}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                +{topic.growthPercentage}% Velocity
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'bn' && topic.topicBn ? topic.topicBn : topic.topic}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>{topic.mentionCount} Wire Dispatches</span>
                <span>•</span>
                <span>{topic.sourcesCount} Verified Sources</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <button
                onClick={() => navigateTo('search', { query: topic.topic })}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Inspect Topic Cluster</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trending Articles Feed */}
      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>High-Velocity Dispatches Today</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.filter((a) => a.isTrending).map((art) => (
            <NewsCard key={art.id} article={art} layout="standard" />
          ))}
        </div>
      </div>
    </div>
  );
};
