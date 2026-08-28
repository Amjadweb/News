import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle } from '../../types';
import { StatusBadge, ConfidenceScorePill } from '../StatusBadge';
import { NewsCard } from '../NewsCard';
import {
  ShieldCheck,
  Building2,
  Clock,
  ExternalLink,
  Bookmark,
  Share2,
  CheckCircle2,
  FileText,
  Layers,
  ChevronRight,
  MapPin,
  User,
  Quote,
  BookOpen,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  Newspaper,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { fetchArticleBySlugSafe } from '../../services/api';

export const NewsDetailView: React.FC = () => {
  const { t, language, formatDhakaTime, navigateTo, viewPayload, savedArticles, toggleSaveArticle, addToast } = useApp();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<'normal' | 'large' | 'xlarge'>('normal');

  const currentIdentifier =
    viewPayload?.slug ||
    viewPayload?.articleId ||
    viewPayload?.id ||
    'bangladesh-it-exports-surpass-record-2-billion-milestone-2026';

  useEffect(() => {
    fetchArticle();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  }, [currentIdentifier, viewPayload]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const result = await fetchArticleBySlugSafe(currentIdentifier);
      setArticle(result.article);
      setRelatedArticles(result.related || []);
    } catch (err) {
      console.warn('Utilizing local verified article cache');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(language === 'bn' ? 'সংবাদের লিংক কপি করা হয়েছে' : 'Article link copied to clipboard', 'success');
    }
  };

  const toggleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) {
      addToast(language === 'bn' ? 'আপনার ব্রাউজারে অডিও স্পিচ সমর্থিত নয়' : 'Audio narration is not supported in your browser', 'error');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const titleText = language === 'bn' && article?.titleBn ? article.titleBn : article?.title || '';
    const summaryText = language === 'bn' && article?.summaryBn ? article.summaryBn : article?.summary || '';
    const contentText = language === 'bn' && article?.contentBn ? article.contentBn : article?.content || article?.contentSnippet || '';

    const textToRead = `${titleText}. ${summaryText}. ${contentText.replace(/###/g, '').replace(/\*\*/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">
          {language === 'bn' ? 'বিস্তারিত সংবাদ ও যাচাইকৃত তথ্য লোড হচ্ছে...' : 'Loading comprehensive intelligence report & multi-source coverage...'}
        </p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {language === 'bn' ? 'সংবাদটি পাওয়া যায়নি' : 'Article Not Found'}
        </h2>
        <p className="text-sm text-slate-500">
          {language === 'bn' ? 'অনুরোধকৃত প্রতিবেদনটি মুছে ফেলা বা আর্কাইভ করা হতে পারে।' : 'The requested intelligence dispatch may have been archived.'}
        </p>
        <button
          onClick={() => navigateTo('home')}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
        >
          {language === 'bn' ? 'মূল পাতায় ফিরে যান' : 'Return to News Wire'}
        </button>
      </div>
    );
  }

  const isSaved = savedArticles.includes(article.id);
  const displayTitle = language === 'bn' && article.titleBn ? article.titleBn : article.title;
  const displaySummary = language === 'bn' && article.summaryBn ? article.summaryBn : article.summary;
  const displayContent = language === 'bn' && article.contentBn ? article.contentBn : (article.content || article.contentSnippet || '');
  const displayLocation = article.location || (language === 'bn' ? 'ঢাকা' : 'DHAKA');
  const readTime = article.readTimeMinutes || 4;

  const fontClass =
    fontSizeMultiplier === 'xlarge'
      ? 'text-lg sm:text-xl leading-loose'
      : fontSizeMultiplier === 'large'
      ? 'text-base sm:text-lg leading-relaxed'
      : 'text-sm sm:text-base leading-relaxed';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Google News Style Breadcrumb & Category Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <button onClick={() => navigateTo('home')} className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
            {t.home}
          </button>
          <ChevronRight className="w-3 h-3" />
          <button
            onClick={() => navigateTo('category', { category: article.category })}
            className="hover:text-red-600 dark:hover:text-red-400 uppercase tracking-wider text-[11px] font-bold text-red-600 dark:text-red-400"
          >
            {article.category}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="truncate max-w-[220px] text-slate-800 dark:text-slate-200">
            {displayTitle}
          </span>
        </nav>

        {/* Accessibility Toolbar: Text Size + TTS Narration */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTextToSpeech}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              isPlayingAudio
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            title="Listen to News"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
            <span>{isPlayingAudio ? (language === 'bn' ? 'থামান' : 'Stop Audio') : (language === 'bn' ? 'সংবাদ শুনুন' : 'Listen')}</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setFontSizeMultiplier('normal')}
              className={`px-2 py-1 rounded font-bold ${fontSizeMultiplier === 'normal' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : ''}`}
              title="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSizeMultiplier('large')}
              className={`px-2 py-1 rounded font-bold ${fontSizeMultiplier === 'large' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : ''}`}
              title="Large Font Size"
            >
              A+
            </button>
            <button
              onClick={() => setFontSizeMultiplier('xlarge')}
              className={`px-2 py-1 rounded font-bold ${fontSizeMultiplier === 'xlarge' ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600' : ''}`}
              title="Extra Large Font Size"
            >
              A++
            </button>
          </div>
        </div>
      </div>

      {/* BBC News Header Section */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 uppercase tracking-wider rounded">
            {article.category}
          </span>
          <StatusBadge status={article.verificationStatus} size="md" />
          <ConfidenceScorePill score={article.confidenceScore} />
        </div>

        {/* Main Headline - BBC Typography */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.15] font-serif">
          {displayTitle}
        </h1>

        {/* Lead / Subtitle */}
        <p className="text-base sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-normal border-l-4 border-red-600 pl-4 py-1">
          {displaySummary}
        </p>

        {/* BBC Dateline & Journalist Byline Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-3">
            {article.byline && (
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
                <User className="w-3.5 h-3.5 text-red-600" />
                <span>
                  {t.byline} {article.byline}
                </span>
                {article.bylineRole && (
                  <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">
                    ({article.bylineRole})
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{displayLocation}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDhakaTime(article.publishedAt)} (BST)</span>
            </div>

            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-red-600" />
              <span>
                {readTime} {t.minRead}
              </span>
            </div>
          </div>

          {/* Social / Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleSaveArticle(article.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isSaved
                  ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/50 dark:border-red-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>{isSaved ? (language === 'bn' ? 'সংরক্ষিত' : 'Saved') : (language === 'bn' ? 'সংরক্ষণ' : 'Save')}</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareArticle}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Lead Visual with BBC Style Caption */}
      <div className="space-y-2">
        <div className="h-80 sm:h-[450px] w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <img
            src={article.imageUrl}
            alt={displayTitle}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        {article.imageCaption && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-sans italic px-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block"></span>
            <span>{article.imageCaption}</span>
          </p>
        )}
      </div>

      {/* BBC News "At A Glance" Key Takeaways Module */}
      {article.keyFacts && article.keyFacts.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl border-l-4 border-l-red-600 border-y border-r border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
              <CheckCircle2 className="w-5 h-5 text-red-600" />
              <span>{t.atAGlance}</span>
            </h3>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {language === 'bn' ? 'যাচাইকৃত তথ্য' : 'Verified Bulletins'}
            </span>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
            {article.keyFacts.map((fact, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0"></span>
                <span className="leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Detailed Reporting Body (BBC In-Depth Article) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2 font-serif">
            <FileText className="w-5 h-5 text-red-600" />
            <span>{t.detailedReport}</span>
          </h2>
          <span className="text-xs text-slate-500">
            {language === 'bn' ? 'সম্পূর্ণ ও বিস্তারিত প্রতিবেদন' : 'Full In-Depth Coverage'}
          </span>
        </div>

        {/* Formatted Article Body */}
        <div className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 ${fontClass}`}>
          {displayContent.split('\n\n').map((paragraph, pIdx) => {
            if (paragraph.startsWith('### ')) {
              return (
                <h3
                  key={pIdx}
                  className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-serif mt-6 mb-3 pt-4 border-t border-slate-200/80 dark:border-slate-800"
                >
                  {paragraph.replace('### ', '')}
                </h3>
              );
            }
            if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
              const lines = paragraph.split('\n');
              return (
                <ul key={pIdx} className="space-y-2 my-4 pl-5 list-disc marker:text-red-600">
                  {lines.map((line, lIdx) => (
                    <li key={lIdx} className="leading-relaxed">
                      {line.replace(/^(\d+\.|\-)\s*/, '')}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p
                key={pIdx}
                className={
                  pIdx === 0
                    ? 'first-letter:text-4xl first-letter:font-black first-letter:text-red-600 first-letter:mr-2 first-letter:float-left font-serif leading-relaxed'
                    : 'leading-relaxed'
                }
              >
                {paragraph}
              </p>
            );
          })}
        </div>
      </div>

      {/* BBC Key Quotes / Statements Carousel/Grid */}
      {article.quotes && article.quotes.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 font-serif">
            <Quote className="w-5 h-5 text-red-600" />
            <span>{t.keyQuotes}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.quotes.map((q, idx) => (
              <div
                key={idx}
                className="bg-red-50/50 dark:bg-slate-900 p-5 rounded-2xl border border-red-100 dark:border-slate-800 relative space-y-3"
              >
                <Quote className="w-8 h-8 text-red-300 dark:text-red-950 absolute top-4 right-4 opacity-50" />
                <p className="text-sm sm:text-base font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed">
                  "{language === 'bn' && q.quoteBn ? q.quoteBn : q.quote}"
                </p>
                <div className="border-t border-red-200/60 dark:border-slate-800 pt-2.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{q.speaker}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{q.title}</p>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded">
                    {language === 'bn' ? 'উক্তি' : 'Statement'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BBC Specialist Analysis Box */}
      {article.analysis && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>{t.editorsAnalysis}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            {article.analysis.avatar && (
              <img
                src={article.analysis.avatar}
                alt={article.analysis.author}
                className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shrink-0"
              />
            )}
            <div>
              <h4 className="text-base font-bold text-white">{article.analysis.author}</h4>
              <p className="text-xs text-slate-400">{article.analysis.role}</p>
            </div>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-serif italic">
            "{language === 'bn' && article.analysis.textBn ? article.analysis.textBn : article.analysis.text}"
          </p>
        </div>
      )}

      {/* Google News Style "Full Coverage" (পূর্ণ কভারেজ / Multi-Source Perspective) */}
      {article.fullCoverageSources && article.fullCoverageSources.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Newspaper className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t.fullCoverage}</span>
                  <span className="text-xs font-normal text-slate-500">
                    ({article.fullCoverageSources.length} {language === 'bn' ? 'সংবাদমাধ্যম' : 'Verified Outlets'})
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.fullCoverageDesc}
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
              Google News Standard Corroboration
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {article.fullCoverageSources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{source.name}</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3 group-hover:text-red-600 transition-colors" />
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-snug">
                  {language === 'bn' && source.headlineBn ? source.headlineBn : source.headline}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {language === 'bn' && source.snippetBn ? source.snippetBn : source.snippet}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>{formatDhakaTime(source.publishedAt)}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                    {source.reliabilityScore}% {language === 'bn' ? 'নির্ভরযোগ্যতা' : 'Reliability'}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Trust & Transparency Corroboration Engine */}
      <div className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
              {t.whyTrustedHeading}
            </h3>
          </div>
          <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
            {language === 'bn' ? 'যাচাইকৃত সোর্স' : 'Corroborated by'} {article.sourceComparison.supporting} / {article.sourceComparison.totalChecked} {language === 'bn' ? 'মাধ্যম' : 'Outlets'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">
              {language === 'bn' ? 'প্রাথমিক সোর্স নিশ্চিতকরণ' : 'Primary Source Availability'}
            </span>
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {article.sourceComparison.primarySourceAvailable ? (language === 'bn' ? 'অফিসিয়াল ডিসপ্যাচ সংযুক্ত' : 'Official Dispatch Attached') : (language === 'bn' ? 'সেকেন্ডারি রিপোর্ট' : 'Secondary Reports')}
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">
              {language === 'bn' ? 'সম্মতি স্কোর' : 'Corroboration Confidence'}
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              {article.confidenceScore}% {language === 'bn' ? '(উচ্চ ঐকমত্য)' : '(High Multi-Agency Consensus)'}
            </span>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-800 space-y-1">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">
              {language === 'bn' ? 'দ্বন্দ্বপূর্ণ দাবি' : 'Conflicting Claims'}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {article.sourceComparison.conflicting === 0 ? (language === 'bn' ? 'কোনো অসংগতি পাওয়া যায়নি' : 'Zero Contradictions Detected') : `${article.sourceComparison.conflicting} Unresolved Claims`}
            </span>
          </div>
        </div>
      </div>

      {/* Chronological Timeline if present */}
      {article.timeline && article.timeline.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-red-600" />
            <span>{t.timelineEvents}</span>
          </h3>
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-red-600/40">
            {article.timeline.map((item, idx) => (
              <div key={idx} className="relative space-y-1">
                <span className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white dark:border-slate-900"></span>
                <span className="text-xs font-mono font-bold text-red-700 dark:text-red-400">
                  {formatDhakaTime(item.timestamp || item.date || item.time || '')}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Official Primary Publisher Attribution Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-xs text-red-400 font-semibold uppercase tracking-wider">
            {language === 'bn' ? 'অফিসিয়াল পাবলিশার সোর্স' : 'Official Publisher Attribution'}
          </div>
          <h4 className="text-base font-bold">{article.primarySource?.name}</h4>
          <p className="text-xs text-slate-400 max-w-2xl">
            {language === 'bn'
              ? 'এই সংবাদ সারাংশ ও ফ্যাক্ট-চেকিং উন্মুক্ত জনস্বার্থ নীতিমালার অধীনে তৈরি। মূল প্রাথমিক প্রতিবেদনটি সরাসরি উৎসে পড়তে পারেন।'
              : 'This article summary conforms with Fair Use & Public Interest reporting guidelines. Read the unabridged original reporting directly at the source.'}
          </p>
        </div>

        {article.primarySource?.url && (
          <a
            href={article.primarySource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-transform hover:scale-105"
          >
            <span>{t.viewOriginalSource}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Related Corroborated Dispatches */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-serif">
            {t.relatedStories}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <NewsCard key={rel.id} article={rel} layout="standard" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
