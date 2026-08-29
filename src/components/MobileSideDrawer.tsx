import React from 'react';
import { useApp } from '../context/AppContext';
import { NewsCategory } from '../types';
import {
  X,
  Radio,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Bookmark,
  ShieldCheck,
  Info,
  Mail,
  Lock,
  FileText,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  MapPin,
  Cpu,
  Building2,
  DollarSign,
  Trophy,
  Activity,
  Microscope,
  GraduationCap,
  Film,
  Leaf,
  Briefcase,
  User,
} from 'lucide-react';

interface MobileSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSideDrawer: React.FC<MobileSideDrawerProps> = ({ isOpen, onClose }) => {
  const {
    t,
    language,
    setLanguage,
    theme,
    toggleTheme,
    currentView,
    navigateTo,
    savedArticles,
    currentUser,
    formatDhakaTime,
  } = useApp();

  if (!isOpen) return null;

  const categories: { name: NewsCategory; labelEn: string; labelBn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { name: 'Bangladesh', labelEn: 'Bangladesh', labelBn: 'বাংলাদেশ', icon: MapPin },
    { name: 'International', labelEn: 'International', labelBn: 'আন্তর্জাতিক', icon: Globe },
    { name: 'Technology', labelEn: 'Technology', labelBn: 'প্রযুক্তি', icon: Cpu },
    { name: 'Artificial Intelligence', labelEn: 'AI & Machine Learning', labelBn: 'কৃত্রিম বুদ্ধিমত্তা', icon: Sparkles },
    { name: 'Business', labelEn: 'Business & Markets', labelBn: 'ব্যবসা ও বাণিজ্য', icon: Building2 },
    { name: 'Finance & Economy', labelEn: 'Finance & Economy', labelBn: 'অর্থনীতি', icon: DollarSign },
    { name: 'Sports', labelEn: 'Sports', labelBn: 'খেলাধুলা', icon: Trophy },
    { name: 'Health', labelEn: 'Health & Medical', labelBn: 'স্বাস্থ্য', icon: Activity },
    { name: 'Science', labelEn: 'Science & Discovery', labelBn: 'বিজ্ঞান', icon: Microscope },
    { name: 'Education', labelEn: 'Education', labelBn: 'শিক্ষা', icon: GraduationCap },
    { name: 'Entertainment', labelEn: 'Entertainment & Culture', labelBn: 'বিনোদন', icon: Film },
  ];

  const handleNavClick = (view: string, payload?: any) => {
    navigateTo(view, payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Slide-in Drawer Container */}
      <div className="fixed inset-y-0 left-0 max-w-[85vw] w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-250">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-950 to-red-600 flex items-center justify-center text-white shadow-xs">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-slate-950 dark:text-white">
                  TruthPulse<span className="text-red-600">AI</span>
                </span>
                <span className="text-[9px] font-bold uppercase bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 px-1 py-0.2 rounded">
                  v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                {t.sideMenuSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Wire Banner */}
        <div className="px-4 py-2 bg-slate-900 text-white text-[11px] flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-bold text-red-400 uppercase tracking-wider text-[10px]">
              {language === 'bn' ? 'লাইভ ওয়্যার' : 'Live Wire'}
            </span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">BST (UTC+6)</span>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {/* Secondary Intelligence Desks */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 font-mono">
              {t.sideMenuTitle}
            </h4>

            <div className="space-y-1">
              <button
                onClick={() => handleNavClick('today')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentView === 'today'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-red-600 animate-pulse" />
                  <span>{t.navToday}</span>
                </div>
                <span className="text-[10px] uppercase font-bold bg-red-600 text-white px-1.5 py-0.2 rounded-full">
                  LIVE
                </span>
              </button>

              <button
                onClick={() => handleNavClick('fact-check')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentView === 'fact-check'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.navFactCheck}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleNavClick('analyzer')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentView === 'analyzer'
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  <span>{t.navAnalyzer}</span>
                </div>
                <span className="text-[9px] font-bold bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-1.5 py-0.2 rounded">
                  AI DATA
                </span>
              </button>

              <button
                onClick={() => handleNavClick('trending')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentView === 'trending'
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                  <span>{t.trendingTopics}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => handleNavClick('saved')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  currentView === 'saved'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>{t.navSaved || (language === 'bn' ? 'সংরক্ষিত সংবাদ' : 'Saved Reading List')}</span>
                </div>
                {savedArticles.length > 0 ? (
                  <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                    {savedArticles.length}
                  </span>
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {/* News Desks / Categories Grid */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 font-mono flex items-center justify-between">
              <span>{t.allCategoriesTitle}</span>
              <LayoutGrid className="w-3 h-3" />
            </h4>

            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((cat, idx) => {
                const IconComponent = cat.icon;
                const label = language === 'bn' ? cat.labelBn : cat.labelEn;
                return (
                  <button
                    key={idx}
                    onClick={() => handleNavClick('category', { category: cat.name })}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 text-slate-700 dark:text-slate-300 text-xs font-medium text-left transition-colors border border-slate-200/60 dark:border-slate-800"
                  >
                    <IconComponent className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editorial & Organization Links */}
          <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 font-mono">
              {language === 'bn' ? 'সম্পাদকীয় নীতিমালা ও তথ্য' : 'Editorial & Info'}
            </h4>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => handleNavClick('admin')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>{t.navAdmin}</span>
              </button>

              <button
                onClick={() => handleNavClick('about')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                <Info className="w-4 h-4 text-slate-500" />
                <span>{t.navAbout}</span>
              </button>

              <button
                onClick={() => handleNavClick('contact')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{t.navContact}</span>
              </button>

              <button
                onClick={() => handleNavClick('privacy')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                <Lock className="w-4 h-4 text-slate-500" />
                <span>{t.navPrivacy}</span>
              </button>

              <button
                onClick={() => handleNavClick('terms')}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
              >
                <FileText className="w-4 h-4 text-slate-500" />
                <span>{t.navTerms}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Drawer Footer Preferences */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-3">
          <div className="flex items-center justify-between">
            {/* Language Selector */}
            <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'bn' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  language === 'en' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs font-semibold"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* User Role Strip */}
          {currentUser && (
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 truncate">
                <User className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="truncate font-semibold text-slate-700 dark:text-slate-300">
                  {currentUser.name}
                </span>
              </div>
              <span className="text-[10px] font-bold bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 uppercase">
                {currentUser.role}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
