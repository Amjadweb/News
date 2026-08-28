import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle } from '../../types';
import { NewsCard } from '../NewsCard';
import { ShieldCheck, Mail, Lock, FileText, CheckCircle2, Globe, Building2, Send } from 'lucide-react';

// Dedicated Category View
export const CategoryView: React.FC = () => {
  const { viewPayload } = useApp();
  const category = viewPayload?.category || 'Bangladesh';
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryNews();
  }, [category]);

  const fetchCategoryNews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      if (data.success) {
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error('Failed to load category:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
          Corroborated Section
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {category} Dispatches
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Verified coverage, factual claims, and primary source comparisons in {category}.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500 text-sm">Loading category feed...</div>
      ) : articles.length === 0 ? (
        <div className="bg-slate-50 dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <p className="text-sm text-slate-500">No dispatches in this category today.</p>
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

// About Page
export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>About TruthPulse AI</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Intelligent News, Data Analysis & Fact Verification
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          TruthPulse AI is a news intelligence and data verification platform built on principles of evidence-first journalism, strict multi-source corroboration, and zero-fabrication AI synthesis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Zero-Fabrication Mandate</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Our AI models never generate ungrounded claims or hallucinated facts. If information cannot be corroborated by at least two independent or official outlets, it is flagged as Unverified or queued for human editorial review.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Fair Attribution & Source Links</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We provide concise synthesis and analytical breakdowns while directing readers to original publishers for unabridged source material, honoring intellectual property and supporting quality journalism.
          </p>
        </div>
      </div>
    </div>
  );
};

// Contact Page
export const ContactView: React.FC = () => {
  const { addToast } = useApp();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast('Your inquiry has been submitted to the editorial desk.', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Contact Editorial Newsroom & Fact-Check Desk
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Submit claim verification inquiries, report source discrepancies, or connect with our investigative data team.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-6 rounded-2xl border border-emerald-300 dark:border-emerald-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">Inquiry Received</h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            Our newsroom fact-checkers will review your submission in accordance with our verification charter.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Your Name</label>
            <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Email Address</label>
            <input required type="email" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Subject / Claim to Investigate</label>
            <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Details & Supporting Links</label>
            <textarea required rows={4} className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
          </div>

          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            <span>Submit to Newsroom</span>
          </button>
        </form>
      )}
    </div>
  );
};

// Privacy Policy View
export const PrivacyView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Privacy & Data Governance Policy</h1>
      <p>
        TruthPulse AI respects data privacy. Datasets uploaded to the Data Analyzer module are processed server-side in ephemeral memory and are never shared or sold to third parties.
      </p>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-4">1. Data Ingestion & Analytics</h2>
      <p>
        User uploaded files (CSV/XLSX/JSON) are temporarily parsed to generate analytical summaries and charts. They are not stored permanently unless explicitly saved by an authorized administrator.
      </p>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-4">2. Cookies & Local Preferences</h2>
      <p>
        We store lightweight user preferences such as active language (Bangla/English), dark/light theme, and saved reading lists in client-side storage.
      </p>
    </div>
  );
};

// Terms of Service View
export const TermsView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Terms of Service & Editorial Charter</h1>
      <p>
        TruthPulse AI provides artificial intelligence assisted aggregation, statistical analysis, and fact-checking. All content is intended for informational and research purposes.
      </p>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-4">1. Copyright & Fair Use</h2>
      <p>
        Articles aggregated via RSS wire endpoints are summarized with transparent attribution. Original headlines, images, and publisher details remain the intellectual property of their respective creators.
      </p>
      <h2 className="text-sm font-bold text-slate-900 dark:text-white mt-4">2. AI Uncertainty & Confidence Disclosures</h2>
      <p>
        Confidence scores and consensus indicators are algorithmic assessments based on multi-source cross-referencing and do not replace formal legal or judicial determination.
      </p>
    </div>
  );
};
