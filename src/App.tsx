import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomeView } from './components/views/HomeView';
import { TodayView } from './components/views/TodayView';
import { NewsDetailView } from './components/views/NewsDetailView';
import { FactCheckView } from './components/views/FactCheckView';
import { DataAnalyzerView } from './components/views/DataAnalyzerView';
import { SearchView } from './components/views/SearchView';
import { TrendingView } from './components/views/TrendingView';
import { SavedView } from './components/views/SavedView';
import { AdminNewsroomView } from './components/views/AdminNewsroomView';
import { CategoryView, AboutView, ContactView, PrivacyView, TermsView } from './components/views/StaticPages';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentView, toasts, removeToast } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'today':
        return <TodayView />;
      case 'news-detail':
        return <NewsDetailView />;
      case 'fact-check':
        return <FactCheckView />;
      case 'analyzer':
        return <DataAnalyzerView />;
      case 'search':
        return <SearchView />;
      case 'trending':
        return <TrendingView />;
      case 'saved':
        return <SavedView />;
      case 'admin':
        return <AdminNewsroomView />;
      case 'category':
        return <CategoryView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'privacy':
        return <PrivacyView />;
      case 'terms':
        return <TermsView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-red-600 selection:text-white transition-colors pb-14 lg:pb-0">
      <Header />

      <main className="flex-1">
        {renderCurrentView()}
      </main>

      <Footer />

      {/* Persistent Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Toast Notification System */}
      <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl shadow-lg border text-xs flex items-center justify-between gap-3 transition-all ${
              toast.type === 'success'
                ? 'bg-slate-900 text-white border-red-500'
                : toast.type === 'error'
                ? 'bg-rose-950 text-rose-100 border-rose-800'
                : 'bg-slate-900 text-slate-100 border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-teal-400 shrink-0" />}
              <span className="font-medium">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
