import React from 'react';
import { NewsArticle } from '../types';
import { useApp } from '../context/AppContext';
import { StatusBadge, ConfidenceScorePill } from './StatusBadge';
import { Bookmark, ExternalLink, Clock, Building2, Sparkles, Flame, CheckCircle, ArrowRight } from 'lucide-react';

interface NewsCardProps {
  article: NewsArticle;
  layout?: 'standard' | 'horizontal' | 'compact' | 'featured';
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, layout = 'standard' }) => {
  const { t, language, formatDhakaTime, navigateTo, savedArticles, toggleSaveArticle } = useApp();

  const isSaved = savedArticles.includes(article.id);
  const displayTitle = language === 'bn' && article.titleBn ? article.titleBn : article.title;
  const displaySummary = language === 'bn' && article.summaryBn ? article.summaryBn : article.summary;

  const handleCardClick = () => {
    navigateTo('news-detail', { slug: article.slug, articleId: article.id });
  };

  // Horizontal layout for feeds
  if (layout === 'horizontal') {
    return (
      <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div
          onClick={handleCardClick}
          className="sm:w-56 h-40 rounded-lg overflow-hidden shrink-0 relative cursor-pointer bg-slate-100 dark:bg-slate-800"
        >
          <img
            src={article.imageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            <span className="bg-slate-900/85 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
              {article.category}
            </span>
          </div>
          {article.isBreaking && (
            <div className="absolute bottom-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              BREAKING
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-slate-900 dark:text-slate-100">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {article.primarySource?.name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDhakaTime(article.publishedAt)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <StatusBadge status={article.verificationStatus} size="sm" />
                <ConfidenceScorePill score={article.confidenceScore} showLabel={false} />
              </div>
            </div>

            <h3
              onClick={handleCardClick}
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer"
            >
              {displayTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
              {displaySummary}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                {article.sourceComparison.totalChecked} Sources Corroborated
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSaveArticle(article.id);
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
                }`}
                title="Save Article"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleCardClick}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 text-xs"
              >
                <span>{t.readMore}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact layout for sidebars or lists
  if (layout === 'compact') {
    return (
      <div
        onClick={handleCardClick}
        className="group cursor-pointer py-3 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-lg transition-colors"
      >
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300 mb-1">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[140px]">
            {article.primarySource?.name}
          </span>
          <StatusBadge status={article.verificationStatus} size="sm" showIcon={false} />
        </div>
        <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
          {displayTitle}
        </h4>
        <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
          <span>{formatDhakaTime(article.publishedAt)}</span>
          <span>•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {article.confidenceScore}% Confidence
          </span>
        </div>
      </div>
    );
  }

  // Standard vertical grid card
  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden hover:border-emerald-500/50 hover:shadow-lg transition-all flex flex-col justify-between">
      <div>
        <div
          onClick={handleCardClick}
          className="h-48 w-full overflow-hidden relative cursor-pointer bg-slate-100 dark:bg-slate-800"
        >
          <img
            src={article.imageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-1.5">
            <span className="bg-slate-900/85 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
              {article.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <ConfidenceScorePill score={article.confidenceScore} showLabel={false} />
          </div>

          {article.isBreaking && (
            <div className="absolute bottom-3 left-3 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              BREAKING
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-2.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1 truncate max-w-[150px]">
              <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              {article.primarySource?.name}
            </span>
            <span className="text-[11px]">{formatDhakaTime(article.publishedAt)}</span>
          </div>

          <h3
            onClick={handleCardClick}
            className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {displayTitle}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
            {displaySummary}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <StatusBadge status={article.verificationStatus} size="sm" />

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveArticle(article.id);
            }}
            className={`p-1.5 rounded-md border transition-colors ${
              isSaved
                ? 'bg-emerald-50 text-emerald-600 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-700'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title="Save"
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCardClick}
            className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-0.5 text-xs"
          >
            <span>{t.readMore}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
