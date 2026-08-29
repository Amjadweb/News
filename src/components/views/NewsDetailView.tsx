import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle, NewsSourceItem } from '../../types';
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
  Copy,
  Check,
  Info,
  AlertTriangle,
  Send,
  Globe,
  ArrowUpRight,
  Award,
  Hash,
  Play,
  Pause,
  RotateCcw,
  SlidersHorizontal,
  X,
  Layers,
  Flag,
  TrendingUp
} from 'lucide-react';
import { fetchArticleBySlugSafe, fetchArticlesSafe } from '../../services/api';
import { RelatedTopicsSection } from '../RelatedTopicsSection';
import { FALLBACK_ARTICLES } from '../../data/fallbackData';

export const NewsDetailView: React.FC = () => {
  const { t, language, formatDhakaTime, navigateTo, viewPayload, savedArticles, toggleSaveArticle, addToast } = useApp();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Audio Speech Controls
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioRate, setAudioRate] = useState<number>(1.0);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  
  // Typography Sizing
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Modals & Interactivity
  const [sourceModalData, setSourceModalData] = useState<{
    name: string;
    url: string;
    domain: string;
    publisher?: string;
    reliabilityScore?: number;
    sourceType?: string;
    publishedAt?: string;
  } | null>(null);
  
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('broken_link');
  const [reportComment, setReportComment] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

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
      setAudioProgress(0);
    }
  }, [currentIdentifier, viewPayload]);

  const fetchArticle = async () => {
    setLoading(true);
    try {
      const [result, wireArticles] = await Promise.all([
        fetchArticleBySlugSafe(currentIdentifier),
        fetchArticlesSafe({ limit: 80 }),
      ]);
      setArticle(result.article);
      setRelatedArticles(result.related || []);
      if (wireArticles.articles && wireArticles.articles.length > 0) {
        setAllArticles(wireArticles.articles);
      } else {
        setAllArticles(FALLBACK_ARTICLES);
      }
    } catch (err) {
      console.warn('Utilizing verified article store fallback');
      setAllArticles(FALLBACK_ARTICLES);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Robust Source URL Opener:
   * 1. Normalizes URL to valid https protocol
   * 2. Attempts window.open with security flags
   * 3. Catches blocked popup exceptions in iframe sandbox and shows direct interactive modal
   */
  const handleOpenSourceUrl = (rawUrl?: string, sourceName?: string) => {
    const url = rawUrl || article?.primarySource?.url;
    if (!url) {
      addToast(language === 'bn' ? 'সোর্স লিংক পাওয়া যায়নি' : 'Source link not available', 'error');
      return;
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const name = sourceName || article?.primarySource?.name || 'Publisher Wire';
    const domain = article?.primarySource?.domain || 'official-wire.com';
    const publisher = article?.primarySource?.publisher || name;
    const reliabilityScore = article?.primarySource?.reliabilityScore || 98;
    const sourceType = article?.primarySource?.sourceType || 'Government Source';
    const publishedAt = article?.primarySource?.publishedAt || article?.publishedAt;

    try {
      const newTab = window.open(targetUrl, '_blank', 'noopener,noreferrer');
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        // Popups restricted or iframe sandbox intercept - launch fallback inspector
        setSourceModalData({
          name,
          url: targetUrl,
          domain,
          publisher,
          reliabilityScore,
          sourceType,
          publishedAt,
        });
        addToast(
          language === 'bn'
            ? 'পপআপ রেস্ট্রিকশনের কারণে উৎস বিবরণী নিচে প্রদর্শিত হয়েছে'
            : 'Source details opened in inspector below',
          'info'
        );
      } else {
        addToast(
          language === 'bn'
            ? `নতুন ট্যাবে ${name} ওপেন করা হয়েছে`
            : `Opened ${name} in a new tab`,
          'success'
        );
      }
    } catch (e) {
      setSourceModalData({
        name,
        url: targetUrl,
        domain,
        publisher,
        reliabilityScore,
        sourceType,
        publishedAt,
      });
    }
  };

  const handleCopySourceUrl = (urlToCopy?: string) => {
    const target = urlToCopy || article?.primarySource?.url || window.location.href;
    navigator.clipboard.writeText(target);
    setCopiedUrl(true);
    addToast(
      language === 'bn' ? 'উৎস লিংক ক্লিপবোর্ডে কপি করা হয়েছে' : 'Source URL copied to clipboard!',
      'success'
    );
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: article?.title,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast(
        language === 'bn' ? 'সংবাদের লিংক কপি করা হয়েছে' : 'Article link copied to clipboard',
        'success'
      );
    }
  };

  // Text-To-Speech Narration Handler
  const toggleTextToSpeech = () => {
    if (!('speechSynthesis' in window)) {
      addToast(
        language === 'bn'
          ? 'আপনার ব্রাউজারে অডিও স্পিচ সমর্থিত নয়'
          : 'Audio narration is not supported in your browser',
        'error'
      );
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setAudioProgress(0);
      return;
    }

    const titleText = language === 'bn' && article?.titleBn ? article.titleBn : article?.title || '';
    const summaryText = language === 'bn' && article?.summaryBn ? article.summaryBn : article?.summary || '';
    const contentText =
      language === 'bn' && article?.contentBn
        ? article.contentBn
        : article?.content || article?.contentSnippet || '';

    const textToRead = `${titleText}. ${summaryText}. ${contentText.replace(/###/g, '').replace(/\*\*/g, '')}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = audioRate;

    utterance.onboundary = (e) => {
      if (textToRead.length > 0) {
        const percent = Math.min(100, Math.round((e.charIndex / textToRead.length) * 100));
        setAudioProgress(percent);
      }
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setAudioProgress(100);
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    };

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const changeAudioSpeed = (newRate: number) => {
    setAudioRate(newRate);
    if (isPlayingAudio && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      setTimeout(() => {
        toggleTextToSpeech();
      }, 100);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportComment('');
      addToast(
        language === 'bn'
          ? 'আপনার প্রতিবেদন জমা হয়েছে। সম্পাদকীয় দল দ্রুত যাচাই করবে।'
          : 'Thank you. Editorial desk will review this report.',
        'success'
      );
    }, 1200);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-medium text-slate-500">
          {language === 'bn'
            ? 'বিস্তারিত সংবাদ ও যাচাইকৃত তথ্য লোড হচ্ছে...'
            : 'Loading comprehensive intelligence report & multi-source coverage...'}
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
          {language === 'bn'
            ? 'অনুরোধকৃত প্রতিবেদনটি মুছে ফেলা বা আর্কাইভ করা হতে পারে।'
            : 'The requested intelligence dispatch may have been archived.'}
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
  const displayContent =
    language === 'bn' && article.contentBn
      ? article.contentBn
      : article.content || article.contentSnippet || '';
  const displayLocation = article.location || (language === 'bn' ? 'ঢাকা' : 'DHAKA');
  const readTime = article.readTimeMinutes || 4;

  const fontClass =
    fontSizeMultiplier === 'xlarge'
      ? 'text-lg sm:text-xl leading-loose font-serif'
      : fontSizeMultiplier === 'large'
      ? 'text-base sm:text-lg leading-relaxed font-serif'
      : 'text-base sm:text-[17px] leading-[1.8] font-serif';

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-10">
      {/* =========================================================================
          1. HERO HEADER SECTION (Google News & BBC Editorial Standard)
         ========================================================================= */}
      <header className="space-y-6">
        {/* Breadcrumb Navigation Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button
              onClick={() => navigateTo('home')}
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors font-semibold"
            >
              {t.home}
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <button
              onClick={() => navigateTo('category', { category: article.category })}
              className="hover:text-red-600 dark:hover:text-red-400 uppercase tracking-wider text-[11px] font-bold text-red-600 dark:text-red-400"
            >
              {article.category}
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="truncate max-w-[280px] sm:max-w-md text-slate-800 dark:text-slate-200 font-medium">
              {displayTitle}
            </span>
          </nav>

          {/* Quick Reading Sizer & Audio Narration Trigger */}
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
              <span>
                {isPlayingAudio
                  ? language === 'bn'
                    ? 'থামান'
                    : 'Stop Narration'
                  : language === 'bn'
                  ? 'সংবাদ শুনুন'
                  : 'Listen (Audio)'}
              </span>
            </button>

            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setFontSizeMultiplier('normal')}
                className={`px-2 py-1 rounded font-bold transition-colors ${
                  fontSizeMultiplier === 'normal'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 font-black'
                    : 'hover:text-red-600'
                }`}
                title="Standard Text Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSizeMultiplier('large')}
                className={`px-2 py-1 rounded font-bold transition-colors ${
                  fontSizeMultiplier === 'large'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 font-black'
                    : 'hover:text-red-600'
                }`}
                title="Large Text Size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSizeMultiplier('xlarge')}
                className={`px-2 py-1 rounded font-bold transition-colors ${
                  fontSizeMultiplier === 'xlarge'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-red-600 font-black'
                    : 'hover:text-red-600'
                }`}
                title="Extra Large Text Size"
              >
                A++
              </button>
            </div>
          </div>
        </div>

        {/* Category & Status Flags */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="bg-red-600 text-white text-xs font-black px-3 py-1 uppercase tracking-wider rounded">
            {article.category}
          </span>
          {article.isBreaking && (
            <span className="bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 uppercase tracking-wider rounded flex items-center gap-1 animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'ব্রেকিং নিউজ' : 'Breaking News'}</span>
            </span>
          )}
          <StatusBadge status={article.verificationStatus} size="md" />
          <ConfidenceScorePill score={article.confidenceScore} />
        </div>

        {/* Big Editorial Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.18] font-serif">
          {displayTitle}
        </h1>

        {/* Editorial Subtitle / Lead Summary */}
        <div className="border-l-4 border-red-600 pl-4 py-2 bg-slate-50/80 dark:bg-slate-900/50 rounded-r-xl">
          <p className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 leading-relaxed font-serif font-normal">
            {displaySummary}
          </p>
        </div>

        {/* BBC Dateline & Journalist Byline Strip with Direct Primary Source Pill */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDhakaTime(article.publishedAt)} (BST)</span>
            </div>

            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-red-600" />
              <span>
                {readTime} {t.minRead}
              </span>
            </div>

            {/* Direct Primary Source Clickable Pill */}
            {article.primarySource?.name && (
              <button
                onClick={() => handleOpenSourceUrl(article.primarySource.url, article.primarySource.name)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/60 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 transition-colors font-medium text-[11px]"
                title="View primary publisher wire"
              >
                <Globe className="w-3 h-3 text-red-600" />
                <span className="truncate max-w-[160px]">{article.primarySource.name}</span>
                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
              </button>
            )}
          </div>

          {/* Social / Action Toolbar */}
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
              <span>
                {isSaved ? (language === 'bn' ? 'সংরক্ষিত' : 'Saved') : language === 'bn' ? 'সংরক্ষণ' : 'Save'}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{t.shareArticle}</span>
            </button>

            <button
              onClick={() => setShowReportModal(true)}
              className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-red-600 transition-colors"
              title="Report inaccuracy or broken link"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Featured Lead Visual with BBC Style Caption */}
        <div className="space-y-2">
          <div className="h-80 sm:h-[480px] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative group">
            <img
              src={article.imageUrl}
              alt={displayTitle}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
          </div>
          {article.imageCaption && (
            <p className="text-xs text-slate-500 dark:text-slate-400 font-sans italic px-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block shrink-0"></span>
              <span>{article.imageCaption}</span>
            </p>
          )}
        </div>
      </header>

      {/* =========================================================================
          2. CLASSIC EDITORIAL 2-COLUMN GRID (MAIN ARTICLE + SIDEBAR WIDGETS)
         ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* -----------------------------------------------------------------------
            PRIMARY EDITORIAL CONTENT COLUMN (Span 8 cols on desktop)
           ----------------------------------------------------------------------- */}
        <main className="lg:col-span-8 space-y-8">
          {/* Interactive Audio Player Bar (Expanded when active) */}
          {isPlayingAudio && (
            <div className="bg-slate-950 text-white rounded-2xl p-5 border border-red-600/40 shadow-xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                      {language === 'bn' ? 'অডিও সংবাদ পাঠক চালু আছে' : 'Live Audio Narration'}
                    </h4>
                    <p className="text-xs text-slate-300 font-medium truncate max-w-xs sm:max-w-md">
                      {displayTitle}
                    </p>
                  </div>
                </div>

                {/* Speed selector */}
                <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px] font-mono mr-1">Speed:</span>
                  {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => changeAudioSpeed(rate)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        audioRate === rate ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 transition-all duration-300 rounded-full"
                    style={{ width: `${audioProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>{audioProgress}% completed</span>
                  <button onClick={toggleTextToSpeech} className="text-red-400 hover:underline">
                    {language === 'bn' ? 'বন্ধ করুন' : 'Stop Narration'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* BBC News "At A Glance" Key Takeaways Module */}
          {article.keyFacts && article.keyFacts.length > 0 && (
            <section className="bg-slate-50 dark:bg-slate-900/90 rounded-2xl border-l-4 border-l-red-600 border-y border-r border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-serif">
                  <CheckCircle2 className="w-5 h-5 text-red-600" />
                  <span>{t.atAGlance}</span>
                </h3>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  {language === 'bn' ? 'যাচাইকৃত তথ্য' : 'Verified Bulletins'}
                </span>
              </div>

              <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-300">
                {article.keyFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0"></span>
                    <span className="leading-relaxed font-sans">{fact}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Main Long-Form In-Depth Editorial Reporting Body */}
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2 font-serif">
                <FileText className="w-5 h-5 text-red-600" />
                <span>{t.detailedReport}</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {language === 'bn' ? 'সম্পূর্ণ ও বিস্তারিত প্রতিবেদন' : 'Full In-Depth Coverage'}
              </span>
            </div>

            {/* Formatted Article Body with Drop-Cap and Typography Refinement */}
            <div className={`prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 ${fontClass}`}>
              {displayContent.split('\n\n').map((paragraph, pIdx) => {
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3
                      key={pIdx}
                      className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-serif mt-8 mb-3 pt-4 border-t border-slate-200/80 dark:border-slate-800"
                    >
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2
                      key={pIdx}
                      className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white font-serif mt-8 mb-3"
                    >
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
                  const lines = paragraph.split('\n');
                  return (
                    <ul key={pIdx} className="space-y-2.5 my-4 pl-5 list-disc marker:text-red-600">
                      {lines.map((line, lIdx) => (
                        <li key={lIdx} className="leading-relaxed">
                          {line.replace(/^(\d+\.|\-)\s*/, '')}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={pIdx}
                      className="border-l-4 border-red-600 pl-4 py-2 my-4 italic text-slate-700 dark:text-slate-300 bg-red-50/30 dark:bg-slate-900/50 rounded-r-lg font-serif"
                    >
                      {paragraph.replace(/^>\s*/, '')}
                    </blockquote>
                  );
                }
                return (
                  <p
                    key={pIdx}
                    className={
                      pIdx === 0
                        ? 'first-letter:text-5xl first-letter:font-black first-letter:text-red-600 first-letter:mr-2.5 first-letter:float-left font-serif leading-[1.85] text-slate-900 dark:text-slate-100'
                        : 'leading-[1.85] text-slate-800 dark:text-slate-200 my-4'
                    }
                  >
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </section>

          {/* BBC Key Quotes / Statements Carousel/Grid */}
          {article.quotes && article.quotes.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-950 dark:text-white flex items-center gap-2 font-serif">
                <Quote className="w-5 h-5 text-red-600" />
                <span>{t.keyQuotes}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.quotes.map((q, idx) => (
                  <div
                    key={idx}
                    className="bg-red-50/40 dark:bg-slate-900 p-5 rounded-2xl border border-red-100 dark:border-slate-800 relative space-y-3 shadow-sm"
                  >
                    <Quote className="w-8 h-8 text-red-300 dark:text-red-950 absolute top-4 right-4 opacity-40" />
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
            </section>
          )}

          {/* BBC Specialist Analysis Box */}
          {article.analysis && (
            <section className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-md">
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
            </section>
          )}

          {/* Google News Style "Full Coverage" (পূর্ণ কভারেজ / Multi-Source Perspectives) */}
          {article.fullCoverageSources && article.fullCoverageSources.length > 0 && (
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <Newspaper className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{t.fullCoverage}</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({article.fullCoverageSources.length} {language === 'bn' ? 'সংবাদমাধ্যম' : 'Verified Outlets'})
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t.fullCoverageDesc}</p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                  Google News Standard Multi-Source
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.fullCoverageSources.map((source) => (
                  <div
                    key={source.id}
                    onClick={() => handleOpenSourceUrl(source.url, source.name)}
                    className="group block p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-red-400 dark:hover:border-red-500 transition-all space-y-2.5 cursor-pointer shadow-sm"
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
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trust & Transparency Corroboration Engine */}
          <section className="bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                  {t.whyTrustedHeading}
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                {language === 'bn' ? 'যাচাইকৃত সোর্স' : 'Corroborated by'}{' '}
                {article.sourceComparison.supporting} / {article.sourceComparison.totalChecked}{' '}
                {language === 'bn' ? 'মাধ্যম' : 'Outlets'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white/80 dark:bg-slate-900/80 p-3.5 rounded-xl border border-emerald-100 dark:border-slate-800 space-y-1">
                <span className="text-slate-500 dark:text-slate-400 block font-medium">
                  {language === 'bn' ? 'প্রাথমিক সোর্স নিশ্চিতকরণ' : 'Primary Source Availability'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {article.sourceComparison.primarySourceAvailable
                    ? language === 'bn'
                      ? 'অফিসিয়াল ডিসপ্যাচ সংযুক্ত'
                      : 'Official Dispatch Attached'
                    : language === 'bn'
                    ? 'সেকেন্ডারি রিপোর্ট'
                    : 'Secondary Reports'}
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
                  {article.sourceComparison.conflicting === 0
                    ? language === 'bn'
                      ? 'কোনো অসংগতি পাওয়া যায়নি'
                      : 'Zero Contradictions Detected'
                    : `${article.sourceComparison.conflicting} Unresolved Claims`}
                </span>
              </div>
            </div>
          </section>

          {/* Chronological Timeline if present */}
          {article.timeline && article.timeline.length > 0 && (
            <section className="space-y-4 pt-2">
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
            </section>
          )}

          {/* User Feedback & Error Report Callout */}
          <div className="bg-slate-100/70 dark:bg-slate-800/40 rounded-xl p-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-500" />
              <span>
                {language === 'bn'
                  ? 'এই প্রতিবেদনে কোনো তথ্যগত ত্রুটি বা লিংক সমস্যা দেখতে পাচ্ছেন?'
                  : 'Notice any factual discrepancy or broken source link in this report?'}
              </span>
            </span>
            <button
              onClick={() => setShowReportModal(true)}
              className="text-red-600 dark:text-red-400 font-bold hover:underline shrink-0"
            >
              {language === 'bn' ? 'রিপোর্ট করুন' : 'Submit Feedback'}
            </button>
          </div>
        </main>

        {/* -----------------------------------------------------------------------
            SIDEBAR WIDGETS COLUMN (Span 4 cols on desktop)
           ----------------------------------------------------------------------- */}
        <aside className="lg:col-span-4 space-y-6">
          {/* =====================================================================
              SIDEBAR WIDGET 1: PRIMARY SOURCE & PROVENANCE DOSSIER
              (FIXED & FULLY FUNCTIONAL "VIEW ORIGINAL SOURCE" ACTION HUB)
             ===================================================================== */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-600/30 dark:border-red-500/20 p-5 space-y-4 shadow-md sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-600 text-white flex items-center justify-center font-black text-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    {language === 'bn' ? 'মূল উৎস ও সত্যায়ন' : 'Primary Source Dossier'}
                  </h3>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    {article.primarySource?.domain || 'official-wire.org'}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {article.primarySource?.reliabilityScore || 98}% {language === 'bn' ? 'যাচাইকৃত' : 'Verified'}
              </span>
            </div>

            {/* Source Details Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {article.primarySource?.name || 'Authorized Wire Service'}
              </div>
              {article.primarySource?.publisher && (
                <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                  <span className="font-semibold">{language === 'bn' ? 'কর্তৃপক্ষ:' : 'Authority:'}</span>{' '}
                  {article.primarySource.publisher}
                </div>
              )}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                <span>{article.primarySource?.sourceType || 'Government Source'}</span>
                <span className="font-mono">{formatDhakaTime(article.primarySource?.publishedAt || article.publishedAt)}</span>
              </div>
            </div>

            {/* ACTION 1: Primary "View Original Source" Button (Robust Handler) */}
            <button
              onClick={() => handleOpenSourceUrl(article.primarySource?.url, article.primarySource?.name)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/20 hover:shadow-lg hover:shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{t.viewOriginalSource}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* ACTION 2 & 3: Copy Link & Wire Certificate Inspector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCopySourceUrl(article.primarySource?.url)}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 px-2.5 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                title="Copy source URL"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copiedUrl ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied!') : language === 'bn' ? 'লিংক কপি' : 'Copy Link'}</span>
              </button>

              <button
                onClick={() =>
                  setSourceModalData({
                    name: article.primarySource?.name || 'Publisher',
                    url: article.primarySource?.url || '',
                    domain: article.primarySource?.domain || '',
                    publisher: article.primarySource?.publisher || '',
                    reliabilityScore: article.primarySource?.reliabilityScore || 98,
                    sourceType: article.primarySource?.sourceType || 'Official Wire',
                    publishedAt: article.primarySource?.publishedAt || article.publishedAt,
                  })
                }
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-2 px-2.5 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                title="Inspect source credentials"
              >
                <Info className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'bn' ? 'সনদ পরীক্ষা' : 'Inspect Wire'}</span>
              </button>
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-normal">
              {language === 'bn'
                ? 'উন্মুক্ত পাবলিক সোর্স ও সরকারি গ্যাজেট রেফারেন্স অনুযায়ী যাচাইকৃত'
                : 'Corroborated directly with authorized registries & open dispatches'}
            </p>
          </div>

          {/* =====================================================================
              SIDEBAR WIDGET 2: KEY FACTS & DATA POINTS QUICK REFERENCE
             ===================================================================== */}
          {article.keyFacts && article.keyFacts.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-red-600" />
                <span>{language === 'bn' ? 'দ্রুত তথ্য ও উপাত্ত' : 'Key Quick Facts'}</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                {article.keyFacts.slice(0, 4).map((fact, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-white dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1.5 shrink-0"></span>
                    <span className="leading-relaxed font-medium">{fact}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              SIDEBAR WIDGET 3: RELATED SOURCES / CROSS-OUTLET COVERAGE
             ===================================================================== */}
          {article.sourceComparison?.sources && article.sourceComparison.sources.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{language === 'bn' ? 'অন্যান্য সম্পর্কিত সোর্স' : 'Corroborating Sources'}</span>
              </h3>

              <div className="space-y-2">
                {article.sourceComparison.sources.map((src, sIdx) => (
                  <div
                    key={sIdx}
                    onClick={() => handleOpenSourceUrl(src.url, src.name)}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 hover:border-red-400 flex items-center justify-between text-xs cursor-pointer transition-colors group"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition-colors">
                        {src.name}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-mono">{src.domain}</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =====================================================================
              SIDEBAR WIDGET 4: AI DETECTED ENTITIES
             ===================================================================== */}
          {article.entities && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="w-4 h-4 text-red-600" />
                <span>{language === 'bn' ? 'শনাক্তকৃত বিষয় ও সংস্থা' : 'Entities & Key Figures'}</span>
              </h3>

              {article.entities.organizations && article.entities.organizations.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'bn' ? 'প্রতিষ্ঠানসমূহ' : 'Organizations'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {article.entities.organizations.map((org, i) => (
                      <button
                        key={i}
                        onClick={() => navigateTo('search', { query: org })}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-600 transition-colors"
                      >
                        {org}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {article.entities.people && article.entities.people.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'bn' ? 'ব্যক্তিবর্গ' : 'Key People'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {article.entities.people.map((person, i) => (
                      <button
                        key={i}
                        onClick={() => navigateTo('search', { query: person })}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-600 transition-colors"
                      >
                        {person}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {article.entities.numbers && article.entities.numbers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    {language === 'bn' ? 'মূল পরিসংখ্যান' : 'Key Metrics'}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {article.entities.numbers.map((num, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 text-xs font-bold font-mono border border-red-200 dark:border-red-900"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =====================================================================
              SIDEBAR WIDGET 5: TRENDING IN THIS CATEGORY
             ===================================================================== */}
          {relatedArticles.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" />
                <span>{language === 'bn' ? 'আলোচিত অন্যান্য প্রতিবেদন' : 'Trending in Category'}</span>
              </h3>

              <div className="space-y-3">
                {relatedArticles.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => navigateTo('news-detail', { slug: rel.slug })}
                    className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-red-400 transition-all cursor-pointer space-y-1.5 group"
                  >
                    <span className="text-[10px] font-bold uppercase text-red-600 tracking-wider">
                      {rel.category}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                      {language === 'bn' && rel.titleBn ? rel.titleBn : rel.title}
                    </h5>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span>{formatDhakaTime(rel.publishedAt)}</span>
                      <span className="font-semibold text-emerald-600">{rel.confidenceScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* =========================================================================
          3. BOTTOM RELATED TOPICS & KEYWORD INTELLIGENCE DISPATCHES
         ========================================================================= */}
      {article && (
        <RelatedTopicsSection
          currentArticle={article}
          allArticles={allArticles.length > 0 ? allArticles : relatedArticles}
        />
      )}

      {/* =========================================================================
          4. SOURCE PROVENANCE INSPECTOR MODAL
         ========================================================================= */}
      {sourceModalData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'উৎস সনদ ও সরাসরি লিঙ্ক' : 'Source Verification & Direct Link'}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{sourceModalData.domain}</span>
                </div>
              </div>

              <button
                onClick={() => setSourceModalData(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'প্রকাশক নাম' : 'Publisher Name'}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{sourceModalData.name}</span>
                </div>
                {sourceModalData.publisher && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">{language === 'bn' ? 'কর্তৃপক্ষ' : 'Issuing Entity'}:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{sourceModalData.publisher}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'উৎস ধরন' : 'Source Type'}:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{sourceModalData.sourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">{language === 'bn' ? 'নির্ভরযোগ্যতা স্কোর' : 'Reliability Score'}:</span>
                  <span className="font-bold text-emerald-600">{sourceModalData.reliabilityScore}%</span>
                </div>
              </div>

              {/* Direct Canonical URL Display with Copy */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {language === 'bn' ? 'প্রাথমিক সোর্স ইউআরএল' : 'Primary Source URL'}
                </label>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all border border-slate-200 dark:border-slate-700">
                  <span className="truncate flex-1">{sourceModalData.url}</span>
                  <button
                    onClick={() => handleCopySourceUrl(sourceModalData.url)}
                    className="px-2.5 py-1 bg-white dark:bg-slate-700 hover:bg-slate-200 rounded text-slate-800 dark:text-slate-100 font-sans font-bold text-xs shrink-0 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{language === 'bn' ? 'কপি' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={sourceModalData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-red-600/30 transition-all text-center"
              >
                <span>{language === 'bn' ? 'সরাসরি ব্রাউজারে খুলুন' : 'Open in New Tab'}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setSourceModalData(null)}
                className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                {language === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. REPORT INACCURACY / BROKEN LINK MODAL
         ========================================================================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {language === 'bn' ? 'প্রতিবেদন বা লিংক সম্পর্কিত রিপোর্ট' : 'Report Story or Broken Source'}
                </h3>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'সমস্যার ধরন নির্বাচন করুন' : 'Issue Category'}
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="broken_link">
                    {language === 'bn' ? 'মূল উৎস লিংক কাজ করছে না (Broken Source URL)' : 'Broken Source Link'}
                  </option>
                  <option value="factual_error">
                    {language === 'bn' ? 'তথ্যগত অসঙ্গতি বা ত্রুটি (Factual Discrepancy)' : 'Factual Inaccuracy'}
                  </option>
                  <option value="misleading_title">
                    {language === 'bn' ? 'বিভ্রান্তিকর শিরোনাম (Misleading Headline)' : 'Misleading Headline'}
                  </option>
                  <option value="translation_bug">
                    {language === 'bn' ? 'অনুবাদ বা বানান ভুল (Language / Typo)' : 'Translation / Typo Error'}
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  {language === 'bn' ? 'মন্তব্য বা সঠিক তথ্যের রেফারেন্স' : 'Additional Notes (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={reportComment}
                  onChange={(e) => setReportComment(e.target.value)}
                  placeholder={
                    language === 'bn'
                      ? 'বিস্তারিত লিখুন যাতে সম্পাদকীয় দল দ্রুত যাচাই করতে পারে...'
                      : 'Provide details or reference to help editorial review...'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                >
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={reportSubmitted}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition-colors"
                >
                  {reportSubmitted ? (
                    <span>{language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'রিপোর্ট জমা দিন' : 'Submit Report'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};
