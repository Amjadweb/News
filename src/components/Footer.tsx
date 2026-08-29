import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Globe, Database, Rss, ArrowUpRight, Lock, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, navigateTo } = useApp();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm mt-16">
      {/* Top Banner: Verification Protocol */}
      <div className="border-b border-slate-800/80 bg-slate-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Evidence-First Cross-Referencing</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Every news dispatch preserves origin timestamps, publisher attribution, and primary source comparison metrics.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-teal-950/60 border border-teal-800/50 text-teal-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Data & Source Transparency</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                AI summaries never fabricate facts. We differentiate between internal dataset consistency and external factual verification.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-purple-950/60 border border-purple-800/50 text-purple-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Editorial Newsroom Governance</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Automated models queue high-risk and breaking claims for human editorial review prior to public status certification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <div
              onClick={() => navigateTo('home')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                TruthPulse<span className="text-emerald-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              TruthPulse AI is a real-time intelligence platform providing automated news aggregation, multi-source fact verification, statistical dataset auditing, and editorial governance.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                Asia/Dhaka (BST UTC+6)
              </span>
            </div>
          </div>

          {/* Quick News Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {['Bangladesh', 'International', 'Technology', 'Artificial Intelligence', 'Business', 'Sports', 'Health', 'Environment'].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => navigateTo('category', { category: cat })}
                    className="hover:text-emerald-400 transition-colors text-left"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Intelligence Modules */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Intelligence
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('today')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.todaysNews}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('fact-check')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.factCheckHeading}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('analyzer')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.dataAnalyzerCTA}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trending')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.trendingTopics}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('saved')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.navSaved || 'Saved Reading List'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin')}
                  className="hover:text-emerald-400 text-emerald-400 flex items-center gap-1 transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>{t.navAdmin}</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Transparency
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.navAbout}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.navContact}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('privacy')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.navPrivacy}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {t.navTerms}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TruthPulse AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-[11px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              Responsible AI • Zero Fabrication Mandate
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
