import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NewsCategory, UserRole } from '../types';
import {
  Home,
  Search,
  LayoutGrid,
  User,
  X,
  MapPin,
  Globe,
  Cpu,
  Sparkles,
  Building2,
  DollarSign,
  Trophy,
  Activity,
  Microscope,
  GraduationCap,
  Film,
  Bookmark,
  ShieldCheck,
  Sun,
  Moon,
  ChevronRight,
  LogOut,
  Sliders,
  Check,
  Radio,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
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
    quickLogin,
    logout,
    addToast,
  } = useApp();

  const [activeSheet, setActiveSheet] = useState<'none' | 'categories' | 'profile'>('none');

  const categories: { name: NewsCategory; labelEn: string; labelBn: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { name: 'Bangladesh', labelEn: 'Bangladesh', labelBn: 'বাংলাদেশ', icon: MapPin },
    { name: 'International', labelEn: 'International', labelBn: 'আন্তর্জাতিক', icon: Globe },
    { name: 'Technology', labelEn: 'Technology', labelBn: 'প্রযুক্তি', icon: Cpu },
    { name: 'Artificial Intelligence', labelEn: 'AI & Deep Tech', labelBn: 'কৃত্রিম বুদ্ধিমত্তা', icon: Sparkles },
    { name: 'Business', labelEn: 'Business', labelBn: 'ব্যবসা ও বাণিজ্য', icon: Building2 },
    { name: 'Finance & Economy', labelEn: 'Finance & Economy', labelBn: 'অর্থনীতি', icon: DollarSign },
    { name: 'Sports', labelEn: 'Sports', labelBn: 'খেলাধুলা', icon: Trophy },
    { name: 'Health', labelEn: 'Health & Medical', labelBn: 'স্বাস্থ্য', icon: Activity },
    { name: 'Science', labelEn: 'Science & Discovery', labelBn: 'বিজ্ঞান', icon: Microscope },
    { name: 'Education', labelEn: 'Education', labelBn: 'শিক্ষা', icon: GraduationCap },
    { name: 'Entertainment', labelEn: 'Entertainment', labelBn: 'বিনোদন', icon: Film },
  ];

  const handleHomeClick = () => {
    setActiveSheet('none');
    if (currentView === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigateTo('home');
    }
  };

  const handleSearchClick = () => {
    setActiveSheet('none');
    navigateTo('search');
  };

  const handleSavedClick = () => {
    setActiveSheet('none');
    navigateTo('saved');
  };

  const handleCategorySelect = (category: NewsCategory) => {
    setActiveSheet('none');
    navigateTo('category', { category });
  };

  const handleRoleChange = async (role: UserRole) => {
    const res = await quickLogin(role);
    if (res.success) {
      addToast(
        language === 'bn'
          ? `ভূমিকা পরিবর্তন হয়েছে: ${role}`
          : `Switched active persona to ${role}`,
        'success'
      );
    }
  };

  const isHomeActive = currentView === 'home' && activeSheet === 'none';
  const isSearchActive = currentView === 'search' && activeSheet === 'none';
  const isSavedActive = currentView === 'saved' && activeSheet === 'none';
  const isCategoriesActive = activeSheet === 'categories' || currentView === 'category';
  const isProfileActive = activeSheet === 'profile' || currentView === 'admin';

  return (
    <>
      {/* Persistent Bottom Bar (Mobile/Tablet Only) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-lg px-1 sm:px-2 py-1.5 transition-colors"
      >
        <div className="max-w-md mx-auto grid grid-cols-5 items-center">
          {/* 1. HOME TAB */}
          <button
            onClick={handleHomeClick}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isHomeActive
                ? 'text-red-600 dark:text-red-400 font-bold scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {isHomeActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {t.bottomNavHome}
            </span>
          </button>

          {/* 2. SEARCH TAB */}
          <button
            onClick={handleSearchClick}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isSearchActive
                ? 'text-red-600 dark:text-red-400 font-bold scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Search className={`w-5 h-5 ${isSearchActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {isSearchActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {t.bottomNavSearch}
            </span>
          </button>

          {/* 3. SAVED TAB */}
          <button
            onClick={handleSavedClick}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isSavedActive
                ? 'text-red-600 dark:text-red-400 font-bold scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Bookmark className={`w-5 h-5 ${isSavedActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {savedArticles.length > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-3.5 h-3.5 px-0.5 rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center">
                  {savedArticles.length}
                </span>
              )}
              {isSavedActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {t.bottomNavSaved || 'Saved'}
            </span>
          </button>

          {/* 4. CATEGORIES TAB */}
          <button
            onClick={() => setActiveSheet(activeSheet === 'categories' ? 'none' : 'categories')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isCategoriesActive
                ? 'text-red-600 dark:text-red-400 font-bold scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <LayoutGrid className={`w-5 h-5 ${isCategoriesActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {isCategoriesActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {t.bottomNavCategories}
            </span>
          </button>

          {/* 5. PROFILE TAB */}
          <button
            onClick={() => setActiveSheet(activeSheet === 'profile' ? 'none' : 'profile')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              isProfileActive
                ? 'text-red-600 dark:text-red-400 font-bold scale-105'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className={`w-5 h-5 rounded-full object-cover border ${
                    isProfileActive ? 'border-red-600 ring-2 ring-red-600/30' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
              ) : (
                <User className={`w-5 h-5 ${isProfileActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              )}
              {isProfileActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-600"></span>
              )}
            </div>
            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {t.bottomNavProfile}
            </span>
          </button>
        </div>
      </nav>

      {/* CATEGORIES BOTTOM SHEET MODAL */}
      {activeSheet === 'categories' && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setActiveSheet('none')}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-250 pb-20">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 shrink-0" />

            {/* Sheet Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-red-600" />
                  <span>{t.allCategoriesTitle}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'যাচাইকৃত বিষয়ভিত্তিক সংবাদ বেছে নিন' : 'Select a topic to explore verified reports'}
                </p>
              </div>
              <button
                onClick={() => setActiveSheet('none')}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories Grid */}
            <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5">
              {categories.map((cat, idx) => {
                const IconComp = cat.icon;
                const label = language === 'bn' ? cat.labelBn : cat.labelEn;
                const isSelected = currentView === 'category';

                return (
                  <button
                    key={idx}
                    onClick={() => handleCategorySelect(cat.name)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 text-left transition-all group flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center text-red-600 shrink-0 group-hover:scale-105 transition-transform">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors truncate">
                        {label}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">
                        {language === 'bn' ? 'সংবাদ দেখুন' : 'Explore'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PROFILE & SETTINGS BOTTOM SHEET MODAL */}
      {activeSheet === 'profile' && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            onClick={() => setActiveSheet('none')}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
          />
          <div className="fixed inset-x-0 bottom-0 max-h-[85vh] bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-250 pb-20">
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-3 shrink-0" />

            {/* Sheet Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-red-600" />
                  <span>{t.profileTitle}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'bn' ? 'আপনার প্রোফাইল ও নিউজ রুম অ্যাক্সেস' : 'User account, personas and reading settings'}
                </p>
              </div>
              <button
                onClick={() => setActiveSheet('none')}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Content */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* User Persona Card */}
              {currentUser ? (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-3 shadow-md">
                  <div className="flex items-center gap-3">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-white">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-sm text-white truncate">{currentUser.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-full tracking-wider">
                        {currentUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Persona Switcher Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {t.roleSwitcher}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['OWNER', 'EDITOR', 'ANALYST'] as UserRole[]).map((r) => {
                    const isActive = currentUser?.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleRoleChange(r)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1 ${
                          isActive
                            ? 'bg-red-600 text-white border-red-600 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isActive && <Check className="w-3 h-3 shrink-0" />}
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions List */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Newsroom Admin Link */}
                <button
                  onClick={() => {
                    setActiveSheet('none');
                    navigateTo('admin');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-red-600" />
                    <span>{t.navAdmin}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Saved Bookmarks */}
                <button
                  onClick={() => {
                    setActiveSheet('none');
                    navigateTo('saved');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                    <span>{language === 'bn' ? 'সংরক্ষিত সংবাদ তালিকা' : 'Saved Bookmarks'}</span>
                  </div>
                  <span className="text-[11px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
                    {savedArticles.length}
                  </span>
                </button>
              </div>

              {/* Preferences: Theme & Language */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    {t.languageSetting}
                  </span>
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      onClick={() => setLanguage('bn')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                        language === 'bn' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      বাংলা
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold ${
                        language === 'en' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      EN
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                    {t.themeMode}
                  </span>
                  <button
                    onClick={toggleTheme}
                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    {theme === 'dark' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-slate-700" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
