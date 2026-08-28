import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MobileSideDrawer } from './MobileSideDrawer';
import {
  Search,
  Globe,
  Sun,
  Moon,
  ShieldCheck,
  Radio,
  Bookmark,
  Menu,
  X,
  Database,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    currentView,
    navigateTo,
    savedArticles,
  } = useApp();

  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('search', { query: searchQuery.trim() });
    }
  };

  const navItems = [
    { key: 'home', label: t.navHome },
    { key: 'today', label: t.navToday },
    { key: 'category', payload: { category: 'Bangladesh' }, label: t.navBangladesh },
    { key: 'category', payload: { category: 'International' }, label: t.navWorld },
    { key: 'category', payload: { category: 'Technology' }, label: t.navTechnology },
    { key: 'category', payload: { category: 'Artificial Intelligence' }, label: t.navAI },
    { key: 'category', payload: { category: 'Business' }, label: t.navBusiness },
    { key: 'fact-check', label: t.navFactCheck },
    { key: 'analyzer', label: t.navAnalyzer },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        {/* Top Banner: Real-time Live Wire Ticker & Timezone */}
        <div className="bg-slate-900 dark:bg-black text-slate-200 text-xs px-4 py-1.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-1.5 bg-red-600 text-white px-2 py-0.5 rounded-full font-bold tracking-wider uppercase text-[10px]">
              <Radio className="w-3 h-3 animate-pulse" />
              <span>LIVE WIRE</span>
            </div>
            <p className="truncate text-slate-300 hidden sm:block">
              <span className="font-medium text-white">{t.trustNotice}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono shrink-0">
            <span className="hidden md:inline-flex items-center gap-1">
              <Globe className="w-3 h-3 text-red-500" />
              {t.timezoneLabel}
            </span>
            <button
              onClick={() => navigateTo('admin')}
              className="hover:text-red-400 text-slate-300 font-sans text-xs underline underline-offset-2 flex items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              <span>{t.navAdmin}</span>
            </button>
          </div>
        </div>

        {/* Main Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Hamburger (Mobile Side Drawer Trigger) & Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSideDrawerOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-800 dark:text-slate-200" />
              </button>

              <div
                onClick={() => navigateTo('home')}
                className="flex items-center gap-2.5 cursor-pointer group select-none"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-red-700 flex items-center justify-center text-white shadow-sm shadow-red-950/20 group-hover:scale-105 transition-transform border border-red-500/30">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-950 dark:text-white font-serif">
                      TruthPulse<span className="text-red-600">AI</span>
                    </span>
                    <span className="text-[10px] uppercase font-bold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 px-1.5 py-0.2 rounded border border-red-200 dark:border-red-900">
                      v1.0
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium tracking-tight -mt-0.5 truncate max-w-[150px] sm:max-w-[280px]">
                    {t.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden lg:flex items-center flex-1 max-w-md mx-8"
            >
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.claimInputPlaceholder}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-hidden focus:ring-2 focus:ring-red-500/50 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>
            </form>

            {/* Right Action Tools */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Language Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                <button
                  onClick={() => setLanguage('bn')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    language === 'bn'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  বাংলা
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-md transition-all ${
                    language === 'en'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Dark / Light Toggle */}
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              </button>

              {/* Saved Articles Shortcut (Desktop) */}
              <button
                onClick={() => navigateTo('search', { savedOnly: true })}
                title="Saved reading list"
                className="hidden sm:flex relative p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                {savedArticles.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {savedArticles.length}
                  </span>
                )}
              </button>

              {/* Data Analyzer CTA Shortcut (Desktop) */}
              <button
                onClick={() => navigateTo('analyzer')}
                className="hidden sm:inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{t.navAnalyzer}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Secondary Category Navigation */}
        <div className="hidden lg:block border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto py-2 text-xs font-medium scrollbar-none">
              {navItems.map((item, idx) => {
                const isActive =
                  item.key === currentView &&
                  (!item.payload || JSON.stringify(item.payload) === JSON.stringify(window.history.state?.usr));
                return (
                  <button
                    key={idx}
                    onClick={() => navigateTo(item.key, item.payload)}
                    className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors flex items-center gap-1 ${
                      isActive
                        ? 'bg-slate-950 text-white dark:bg-red-600 dark:text-white font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {item.key === 'today' && <Radio className="w-3 h-3 text-red-500 animate-pulse" />}
                    {item.key === 'fact-check' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                    {item.key === 'analyzer' && <BarChart3 className="w-3 h-3 text-teal-500" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Side-Drawer for Secondary Navigation Links */}
      <MobileSideDrawer
        isOpen={sideDrawerOpen}
        onClose={() => setSideDrawerOpen(false)}
      />
    </>
  );
};

