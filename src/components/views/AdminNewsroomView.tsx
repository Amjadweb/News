import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsArticle, NewsCategory, NewsSourceRegistry, AuditLog, UserRole, BackgroundJob, NewsSyncStatus } from '../../types';
import { StatusBadge, ConfidenceScorePill } from '../StatusBadge';
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Edit3,
  Calendar,
  Layers,
  Database,
  Radio,
  Sliders,
  FileText,
  Trash2,
  Plus,
  Play,
  Activity,
  UserCheck,
  Lock,
  Search,
  KeyRound,
  LogIn,
  LogOut,
  ShieldAlert,
  Check,
  Flame,
  Send,
  Zap,
  RotateCcw,
  Eye,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  fetchSyncStatusSafe,
  triggerPipelineSyncSafe,
  triggerTestScenarioSafe,
  createManualArticleSafe,
  deleteArticleSafe,
  saveSourceSafe,
  deleteSourceSafe,
} from '../../services/api';

export const AdminNewsroomView: React.FC = () => {
  const {
    currentUser,
    authToken,
    permissions,
    quickLogin,
    login,
    logout,
    authFetch,
    hasRolePermission,
    addToast,
    formatDhakaTime,
    navigateTo,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'inbox' | 'publish' | 'rotation' | 'sources' | 'editor' | 'audit' | 'security' | 'jobs'
  >('dashboard');
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [sources, setSources] = useState<NewsSourceRegistry[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [syncStatus, setSyncStatus] = useState<NewsSyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [isRunningTestScenario, setIsRunningTestScenario] = useState(false);
  const [testScenarioResult, setTestScenarioResult] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Selected Article for Editor Workbench
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [aiAssistantLoading, setAiAssistantLoading] = useState(false);
  const [aiAssistantOutput, setAiAssistantOutput] = useState<any>(null);

  // Manual News Publisher State
  const [manualForm, setManualForm] = useState({
    title: '',
    titleBn: '',
    summary: '',
    summaryBn: '',
    content: '',
    category: 'Bangladesh',
    author: 'Chief Newsroom Editor',
    imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
    imageCaption: 'Special dispatch by TruthPulse Editorial Desk',
    verificationStatus: 'VERIFIED' as const,
    confidenceScore: 98,
    importanceScore: 92,
    isBreaking: true,
    isTrending: true,
    isEditorPick: true,
    autoExpire: false, // Manual news stays permanent unless specified
    keyFacts: ['Verified through direct primary documentation.', 'Corroborated by independent newsroom desk.'],
    tags: ['Breaking', 'Special Report', 'Verified'],
  });
  const [isPublishingManual, setIsPublishingManual] = useState(false);
  const [newKeyFactInput, setNewKeyFactInput] = useState('');

  // Source Add Modal
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);
  const [newSourceData, setNewSourceData] = useState<{
    name: string;
    feedUrl: string;
    category: NewsCategory;
    country: string;
    language: string;
    fetchFrequencyMinutes: number;
    priority: number;
    isActive: boolean;
  }>({
    name: '',
    feedUrl: '',
    category: 'Technology',
    country: 'Bangladesh',
    language: 'English',
    fetchFrequencyMinutes: 15,
    priority: 85,
    isActive: true,
  });

  // Auth Login Modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('owner@truthpulse.ai');
  const [loginPassword, setLoginPassword] = useState('TruthPulse@2026!');
  const [loginLoading, setLoginLoading] = useState(false);

  // Filter for inbox
  const [inboxStatusFilter, setInboxStatusFilter] = useState('Pending Review');
  const [inboxSearch, setInboxSearch] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, [currentUser?.role]);

  const fetchAdminData = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const [dashRes, newsRes, srcRes, logsRes, jobsRes, statusRes] = await Promise.all([
        authFetch('/api/admin/dashboard'),
        authFetch('/api/admin/news'),
        authFetch('/api/admin/sources'),
        authFetch('/api/admin/audit-logs'),
        authFetch('/api/admin/jobs'),
        fetch('/api/news/sync-status'),
      ]);

      if (dashRes.status === 403 || newsRes.status === 403) {
        setAuthError('Access restricted by Role-Based Access Control (RBAC). Current role has limited permissions.');
      }

      const dashData = await dashRes.json();
      const newsData = await newsRes.json();
      const srcData = await srcRes.json();
      const logsData = await logsRes.json();
      const jobsData = await jobsRes.json();
      const statusData = await statusRes.json();

      if (dashData.success) setDashboardMetrics(dashData);
      if (newsData.success) {
        setArticles(newsData.articles || []);
        if (!editingArticle && newsData.articles?.length > 0) {
          setEditingArticle(newsData.articles[0]);
        }
      }
      if (srcData.success) setSources(srcData.sources || []);
      if (logsData.success) setAuditLogs(logsData.auditLogs || []);
      if (jobsData.success) setJobs(jobsData.jobs || []);
      if (statusData.success) setSyncStatus(statusData.status);

      // Fetch users if OWNER
      try {
        const usersRes = await authFetch('/api/auth/users');
        const usersData = await usersRes.json();
        if (usersData.success) {
          setRegisteredUsers(usersData.users || []);
        }
      } catch {
        // Non-owner might not be able to list users
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Full Dynamic Ingestion & Expiry Pipeline
  const handleTriggerFullPipeline = async () => {
    setIsIngesting(true);
    try {
      const data = await triggerPipelineSyncSafe(authToken || '');
      if (data.success) {
        addToast(
          `Pipeline Cycle Executed! Ingested: ${data.result?.ingestion?.fetchedCount || 0} stories, Expired: ${data.result?.expiry?.expiredCount || 0} stories, Active Top 20 Ranked.`,
          'success'
        );
        fetchAdminData();
      } else {
        addToast(data.error || 'Pipeline execution failed', 'error');
      }
    } catch (err) {
      addToast('Pipeline execution failed', 'error');
    } finally {
      setIsIngesting(false);
    }
  };

  // Run Test Rotation Scenario (Step 22 Verification)
  const handleRunTestRotationScenario = async () => {
    setIsRunningTestScenario(true);
    try {
      const data = await triggerTestScenarioSafe(authToken || '');
      if (data.success) {
        setTestScenarioResult(data);
        addToast('Step 22 Rotation Scenario Executed! 20 stories rotated with 12h expiry simulation.', 'success');
        fetchAdminData();
      } else {
        addToast(data.error || 'Failed to run test rotation', 'error');
      }
    } catch (err) {
      addToast('Failed to run test rotation scenario', 'error');
    } finally {
      setIsRunningTestScenario(false);
    }
  };

  // Toggle Source Active / Inactive
  const handleToggleSourceActive = async (src: NewsSourceRegistry) => {
    try {
      const updated = { ...src, isActive: !src.isActive };
      const res = await saveSourceSafe(updated, authToken || '');
      if (res.success) {
        addToast(`Source "${src.name}" set to ${updated.isActive ? 'ACTIVE' : 'INACTIVE'}`, 'success');
        setSources((prev) => prev.map((s) => (s.id === src.id ? { ...s, isActive: updated.isActive } : s)));
      } else {
        addToast(res.error || 'Failed to update source status (Requires OWNER role)', 'error');
      }
    } catch (err) {
      addToast('Failed to toggle source', 'error');
    }
  };

  // Delete Source
  const handleDeleteSource = async (sourceId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete wire source "${name}"?`)) return;
    try {
      const res = await deleteSourceSafe(sourceId, authToken || '');
      if (res.success) {
        addToast(`Source "${name}" removed from registry`, 'success');
        setSources((prev) => prev.filter((s) => s.id !== sourceId));
      } else {
        addToast(res.error || 'Failed to delete source', 'error');
      }
    } catch (err) {
      addToast('Failed to delete source', 'error');
    }
  };

  // Change Article Status (Approve, Reject, Schedule)
  const handleUpdateStatus = async (articleId: string, status: string, scheduledFor?: string) => {
    try {
      const res = await authFetch(`/api/admin/news/${articleId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          scheduledFor,
          userName: currentUser?.name,
          userRole: currentUser?.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`Article status updated to: ${status}`, 'success');
        setArticles((prev) => prev.map((a) => (a.id === articleId ? data.article : a)));
        if (editingArticle?.id === articleId) {
          setEditingArticle(data.article);
        }
      } else {
        addToast(data.error || 'Failed to update article status', 'error');
      }
    } catch (err) {
      addToast('Failed to update article status', 'error');
    }
  };

  // Delete Article
  const handleDeleteArticle = async (articleId: string, title: string) => {
    if (!window.confirm(`Delete article "${title.slice(0, 40)}..."?`)) return;
    try {
      const res = await deleteArticleSafe(articleId, authToken || '');
      if (res.success) {
        addToast('Article removed from database', 'success');
        setArticles((prev) => prev.filter((a) => a.id !== articleId));
        if (editingArticle?.id === articleId) setEditingArticle(null);
      } else {
        addToast(res.error || 'Failed to delete article', 'error');
      }
    } catch (err) {
      addToast('Failed to delete article', 'error');
    }
  };

  // Save Article Edits in Workbench
  const handleSaveArticleEdits = async () => {
    if (!editingArticle) return;
    try {
      const res = await authFetch(`/api/admin/news/${editingArticle.id}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: editingArticle,
          userName: currentUser?.name,
          userRole: currentUser?.role,
        }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('Article revisions saved and logged to audit trail', 'success');
        setArticles((prev) => prev.map((a) => (a.id === editingArticle.id ? data.article : a)));
      } else {
        addToast(data.error || 'Failed to save article edits', 'error');
      }
    } catch (err) {
      addToast('Failed to save article edits', 'error');
    }
  };

  // Submit Manual Article Creation
  const handleCreateManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title || !manualForm.summary || !manualForm.content) {
      addToast('Please provide Title, Summary, and Content body', 'error');
      return;
    }

    setIsPublishingManual(true);
    try {
      const data = await createManualArticleSafe(manualForm, authToken || '');
      if (data.success) {
        addToast(`Article "${manualForm.title.slice(0, 30)}..." published to live feed!`, 'success');
        setArticles((prev) => [data.article, ...prev]);
        setActiveTab('inbox');
        // Reset form
        setManualForm({
          title: '',
          titleBn: '',
          summary: '',
          summaryBn: '',
          content: '',
          category: 'Bangladesh',
          author: 'Chief Newsroom Editor',
          imageUrl: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop&q=80',
          imageCaption: 'Special dispatch by TruthPulse Editorial Desk',
          verificationStatus: 'VERIFIED',
          confidenceScore: 98,
          importanceScore: 92,
          isBreaking: true,
          isTrending: true,
          isEditorPick: true,
          autoExpire: false,
          keyFacts: ['Verified through direct primary documentation.'],
          tags: ['Breaking', 'Special Report', 'Verified'],
        });
      } else {
        addToast(data.error || 'Failed to publish manual article (Requires PUBLISH_NEWS permission)', 'error');
      }
    } catch (err) {
      addToast('Failed to publish manual article', 'error');
    } finally {
      setIsPublishingManual(false);
    }
  };

  // Editorial AI Assistant Action
  const handleRunAiAssistant = async (action: string) => {
    if (!editingArticle) return;
    setAiAssistantLoading(true);
    try {
      const res = await authFetch('/api/admin/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          article: editingArticle,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiAssistantOutput(data);
        addToast(`AI assistant completed: ${action}`, 'success');
      } else {
        addToast(data.error || 'AI assistant request failed', 'error');
      }
    } catch (err) {
      addToast('AI assistant request failed', 'error');
    } finally {
      setAiAssistantLoading(false);
    }
  };

  // Add Source
  const handleAddSourceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceData.name || !newSourceData.feedUrl) return;

    try {
      const res = await saveSourceSafe(newSourceData, authToken || '');
      if (res.success) {
        setSources(res.sources || []);
        setShowAddSourceModal(false);
        setNewSourceData({
          name: '',
          feedUrl: '',
          category: 'Technology',
          country: 'Bangladesh',
          language: 'English',
          fetchFrequencyMinutes: 15,
          priority: 85,
          isActive: true,
        });
        addToast('New news source registered and active', 'success');
        fetchAdminData();
      } else {
        addToast(res.error || 'Failed to add source (requires OWNER role)', 'error');
      }
    } catch (err) {
      addToast('Failed to add source', 'error');
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    const res = await login(loginEmail, loginPassword);
    setLoginLoading(false);
    if (res.success) {
      setShowLoginModal(false);
      fetchAdminData();
    } else {
      addToast(res.error || 'Invalid credentials', 'error');
    }
  };

  const handleQuickRoleSwitch = async (role: UserRole) => {
    const res = await quickLogin(role);
    if (res.success) {
      fetchAdminData();
    }
  };

  const filteredInbox = articles.filter((a) => {
    const matchStatus =
      inboxStatusFilter === 'All' ? true : a.status.toLowerCase() === inboxStatusFilter.toLowerCase();
    const matchSearch =
      inboxSearch === ''
        ? true
        : a.title.toLowerCase().includes(inboxSearch.toLowerCase()) ||
          a.summary.toLowerCase().includes(inboxSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. TOP NEWSROOM ACCESS & RBAC STATUS BAR */}
      <div className="bg-slate-950 text-white rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight">Editorial & Newsroom Command</h1>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                JWT Role: {currentUser?.role || 'GUEST'}
              </span>
              {authToken && (
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono hidden sm:inline-block">
                  HMAC-SHA256 Signed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Authenticated as <strong className="text-white">{currentUser?.name || 'Unauthenticated'}</strong> ({currentUser?.email})
            </p>
          </div>
        </div>

        {/* Real JWT Role Switcher & Ingestion Trigger */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Fast Role Switch:</span>
          {(['OWNER', 'EDITOR', 'ANALYST'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => handleQuickRoleSwitch(r)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                currentUser?.role === r
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {r}
            </button>
          ))}

          <button
            onClick={() => setShowLoginModal(true)}
            className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1 border border-slate-700"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>Login Dialog</span>
          </button>

          <button
            onClick={handleTriggerFullPipeline}
            disabled={isIngesting || !hasRolePermission('TRIGGER_INGESTION')}
            className="ml-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            title={!hasRolePermission('TRIGGER_INGESTION') ? 'Requires TRIGGER_INGESTION permission' : ''}
          >
            <Play className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
            <span>{isIngesting ? 'Running Pipeline...' : 'Run Sync Cycle'}</span>
          </button>
        </div>
      </div>

      {/* RBAC Notice if restricted */}
      {authError && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 p-4 rounded-xl text-xs flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <div>
            <span className="font-bold">Role-Based Access Control Notice:</span> {authError}
          </div>
        </div>
      )}

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { key: 'dashboard', label: 'Newsroom Overview', icon: Activity },
          { key: 'rotation', label: 'Live Rotation & 12h Expiry', icon: RotateCcw },
          { key: 'publish', label: 'Publish News (Manual)', icon: Send },
          { key: 'inbox', label: `AI News Inbox (${articles.filter((a) => a.status === 'Pending Review').length})`, icon: Radio },
          { key: 'editor', label: 'Article Workbench', icon: Edit3 },
          { key: 'sources', label: `Sources Registry (${sources.length})`, icon: Building2 },
          { key: 'audit', label: 'Audit Trail', icon: FileText },
          { key: 'security', label: 'Security & RBAC Matrix', icon: ShieldCheck },
          { key: 'jobs', label: 'Background Jobs', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === tab.key
                  ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB CONTENT */}

      {/* A: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && dashboardMetrics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Active In Feed</span>
              <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {syncStatus?.activeCount ?? syncStatus?.activeArticlesCount ?? dashboardMetrics.metrics.publishedToday}
              </div>
              <span className="text-[11px] text-slate-400">Under 12h expiration window</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Pending Review</span>
              <div className="text-2xl font-extrabold text-amber-500">
                {dashboardMetrics.metrics.pendingReview}
              </div>
              <span className="text-[11px] text-slate-400">Awaiting editor decision</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Active Wire Sources</span>
              <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400">
                {syncStatus?.activeSources ?? syncStatus?.activeSourcesCount ?? sources.filter((s) => s.isActive).length}
              </div>
              <span className="text-[11px] text-slate-400">
                {sources.length} Total Registered
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-xs text-slate-500 font-medium">Expired Stories</span>
              <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">
                {syncStatus?.expiredCount ?? syncStatus?.expiredArticlesCount ?? 0}
              </div>
              <span className="text-[11px] text-slate-400">Archived from homepage</span>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-2xl border border-slate-800 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                <span>Automated News Ingestion & Expiry Engine</span>
              </div>
              <h3 className="text-base font-bold">100% Dynamic News Engine Active</h3>
              <p className="text-xs text-slate-400">
                Background cron scheduler runs every 15 minutes. Decays stories using time-weighted scoring and retires stories older than 12 hours.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('rotation')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700"
              >
                Inspect Rotation Radar
              </button>
              <button
                onClick={() => setActiveTab('publish')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Publish Manual Story</span>
              </button>
            </div>
          </div>

          {/* Urgent Review Queue & Wire Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                  <span>Incoming Wire Dispatches Awaiting Review</span>
                </h3>
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="text-xs font-semibold text-emerald-600 hover:underline"
                >
                  View Full Inbox →
                </button>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {articles.slice(0, 5).map((art) => (
                  <div key={art.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-sm">
                          {art.title}
                        </span>
                        <StatusBadge status={art.verificationStatus} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Source: {art.primarySource?.name}</span>
                        <span>•</span>
                        <span>Confidence: {art.confidenceScore}%</span>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            art.status === 'Published'
                              ? 'text-emerald-500'
                              : art.status === 'Pending Review'
                              ? 'text-amber-500'
                              : 'text-slate-400'
                          }`}
                        >
                          Status: {art.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setEditingArticle(art);
                          setActiveTab('editor');
                        }}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-xs"
                      >
                        Workbench
                      </button>
                      {art.status !== 'Published' && hasRolePermission('PUBLISH_NEWS') && (
                        <button
                          onClick={() => handleUpdateStatus(art.id, 'Published')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                        >
                          Approve
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wire Health Radar */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Wire Health Status</span>
                </h3>
              </div>

              <div className="space-y-3">
                {sources.slice(0, 5).map((src) => (
                  <div
                    key={src.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{src.name}</span>
                        {!src.isActive && (
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded">
                            PAUSED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {src.category} • Priority {src.priority || 50}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        src.healthStatus === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {src.healthStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B: LIVE ROTATION & 12-HOUR EXPIRATION PIPELINE CONTROL */}
      {activeTab === 'rotation' && (
        <div className="space-y-6">
          {/* Pipeline Status Banner */}
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold uppercase tracking-wider">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Step 2 & Step 22 Verification Console</span>
                </div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  Dynamic News Rotation & Decay Engine
                </h2>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Automated background cron runs every 15 minutes. Items over 12 hours old expire automatically, decaying out of the Top 20 feed to ensure fresh real-time news continuously.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTriggerFullPipeline}
                  disabled={isIngesting || !hasRolePermission('TRIGGER_INGESTION')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-40"
                >
                  <Play className={`w-3.5 h-3.5 ${isIngesting ? 'animate-spin' : ''}`} />
                  <span>{isIngesting ? 'Executing Pipeline...' : 'Trigger Immediate Sync Cycle'}</span>
                </button>

                <button
                  onClick={handleRunTestRotationScenario}
                  disabled={isRunningTestScenario || !hasRolePermission('TRIGGER_INGESTION')}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-40"
                >
                  <Zap className={`w-3.5 h-3.5 ${isRunningTestScenario ? 'animate-spin' : ''}`} />
                  <span>{isRunningTestScenario ? 'Simulating...' : 'Test 20-Story Rotation (Step 22)'}</span>
                </button>
              </div>
            </div>

            {/* Sync Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Active Stories in Feed</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {syncStatus?.activeCount ?? syncStatus?.activeArticlesCount ?? articles.filter((a) => a.status === 'Published').length}
                </div>
                <div className="text-[11px] text-slate-500">Visible on Homepage</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">12-Hour Expired Stories</div>
                <div className="text-2xl font-bold text-purple-400">
                  {syncStatus?.expiredCount ?? syncStatus?.expiredArticlesCount ?? articles.filter((a) => a.status === 'Expired').length}
                </div>
                <div className="text-[11px] text-slate-500">Retired by Decay Filter</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Total Wire Sources</div>
                <div className="text-2xl font-bold text-teal-400">
                  {syncStatus?.activeSources ?? syncStatus?.activeSourcesCount ?? sources.filter((s) => s.isActive).length} Active / {sources.length} Total
                </div>
                <div className="text-[11px] text-slate-500">Ingested every 15m</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-medium">Sync Execution Cycles</div>
                <div className="text-2xl font-bold text-amber-400">
                  {syncStatus?.syncCycleCount ?? syncStatus?.syncCyclesRun ?? 1}
                </div>
                <div className="text-[11px] text-slate-500">
                  Next: {syncStatus?.nextSyncTime || syncStatus?.nextScheduledSync ? new Date(syncStatus.nextSyncTime || syncStatus.nextScheduledSync!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In ~15 min'}
                </div>
              </div>
            </div>

            {/* Test Scenario Feedback Banner */}
            {testScenarioResult && (
              <div className="bg-emerald-950/60 border border-emerald-800 rounded-xl p-4 space-y-2 text-xs text-emerald-200">
                <div className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step 22 Rotation Simulation Result:</span>
                </div>
                <p>
                  Successfully seeded 20 test stories with staggered timestamps. {testScenarioResult.result?.expiredCount || 0} stories over 12 hours old were immediately expired and replaced in the Top 20 feed by fresh breaking articles.
                </p>
              </div>
            )}
          </div>

          {/* Real-time Top 20 News Decay Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Live Dynamically Ranked Top 20 Stories
                </h3>
                <p className="text-xs text-slate-500">
                  Calculated via: (Base Importance + Verification + Breaking) × Time Decay Formula
                </p>
              </div>
              <button
                onClick={fetchAdminData}
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Matrix</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    <th className="p-3">Rank</th>
                    <th className="p-3">Headline</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Age / Published</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Importance Score</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {articles.slice(0, 20).map((art, index) => {
                    const hoursOld = (Date.now() - new Date(art.publishedAt).getTime()) / (1000 * 60 * 60);
                    return (
                      <tr key={art.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold font-mono text-slate-400">
                          #{index + 1}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                          {art.title}
                        </td>
                        <td className="p-3">
                          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono">
                          {hoursOld.toFixed(1)}h ago
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              art.status === 'Published'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : art.status === 'Expired'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {art.status}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-700 dark:text-slate-300">
                          {art.importanceScore || 80}/100
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setEditingArticle(art);
                              setActiveTab('editor');
                            }}
                            className="text-xs text-emerald-600 hover:underline font-semibold"
                          >
                            Edit in Workbench
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* C: PUBLISH MANUAL NEWS TAB */}
      {activeTab === 'publish' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Direct Manual News Publisher
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish verified original dispatches directly to the live feed with custom bylines, tags, and persistence settings.
              </p>
            </div>

            <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              Role: {currentUser?.role}
            </span>
          </div>

          <form onSubmit={handleCreateManualSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Headline (English) *
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  placeholder="e.g. Bangladesh Central Bank Announces AI Security Directive..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Headline (Bangla)
                </label>
                <input
                  type="text"
                  value={manualForm.titleBn}
                  onChange={(e) => setManualForm({ ...manualForm, titleBn: e.target.value })}
                  placeholder="e.g. বাংলাদেশ ব্যাংক এআই নিরাপত্তা নির্দেশনা জারি করেছে..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Executive Summary (English) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={manualForm.summary}
                  onChange={(e) => setManualForm({ ...manualForm, summary: e.target.value })}
                  placeholder="Concise, verified 2-sentence summary of the story..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Executive Summary (Bangla)
                </label>
                <textarea
                  rows={3}
                  value={manualForm.summaryBn}
                  onChange={(e) => setManualForm({ ...manualForm, summaryBn: e.target.value })}
                  placeholder="বাংলা সংক্ষেপ..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Full Article Content (Markdown / Text) *
              </label>
              <textarea
                rows={6}
                required
                value={manualForm.content}
                onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
                placeholder="Full article content body..."
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-serif leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category Desk
                </label>
                <select
                  value={manualForm.category}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="International">International</option>
                  <option value="Technology">Technology</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Business">Business</option>
                  <option value="Finance & Economy">Finance & Economy</option>
                  <option value="Sports">Sports</option>
                  <option value="Science">Science</option>
                  <option value="Health">Health</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Author / Byline
                </label>
                <input
                  type="text"
                  value={manualForm.author}
                  onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Hero Image URL
                </label>
                <input
                  type="url"
                  value={manualForm.imageUrl}
                  onChange={(e) => setManualForm({ ...manualForm, imageUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Checkboxes for Editorial Flags */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={manualForm.isBreaking}
                  onChange={(e) => setManualForm({ ...manualForm, isBreaking: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Breaking News Banner</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={manualForm.isTrending}
                  onChange={(e) => setManualForm({ ...manualForm, isTrending: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Trending Topic</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={manualForm.isEditorPick}
                  onChange={(e) => setManualForm({ ...manualForm, isEditorPick: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Editor's Spotlight Pick</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-indigo-600 dark:text-indigo-400">
                <input
                  type="checkbox"
                  checked={manualForm.autoExpire}
                  onChange={(e) => setManualForm({ ...manualForm, autoExpire: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Auto-Expire After 12h (Uncheck for permanent)</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isPublishingManual || !hasRolePermission('PUBLISH_NEWS')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                {isPublishingManual ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Publish to Live Feed</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* D: INBOX MANAGEMENT */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
              {['Pending Review', 'Published', 'Draft', 'Expired', 'Rejected', 'All'].map((st) => (
                <button
                  key={st}
                  onClick={() => setInboxStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    inboxStatusFilter === st
                      ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inboxSearch}
                onChange={(e) => setInboxSearch(e.target.value)}
                placeholder="Search inbox..."
                className="pl-8 pr-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredInbox.map((art) => (
              <div
                key={art.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                      {art.category}
                    </span>
                    <StatusBadge status={art.verificationStatus} size="sm" />
                    <ConfidenceScorePill score={art.confidenceScore} />
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      art.status === 'Published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : art.status === 'Pending Review'
                        ? 'bg-amber-100 text-amber-800'
                        : art.status === 'Expired'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    Status: {art.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {art.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {art.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="text-slate-500 flex items-center gap-3">
                    <span>Source: {art.primarySource?.name}</span>
                    <span>•</span>
                    <span>Corroboration: {art.sourceComparison?.totalChecked || 1} outlets</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingArticle(art);
                        setActiveTab('editor');
                      }}
                      className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-semibold"
                    >
                      Open Workbench
                    </button>

                    {hasRolePermission('PUBLISH_NEWS') && art.status !== 'Published' && (
                      <button
                        onClick={() => handleUpdateStatus(art.id, 'Published')}
                        className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        Approve & Publish
                      </button>
                    )}

                    {hasRolePermission('EDIT_NEWS') && (
                      <button
                        onClick={() => handleUpdateStatus(art.id, 'Rejected')}
                        className="px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100"
                      >
                        Reject
                      </button>
                    )}

                    {hasRolePermission('DELETE_NEWS') && (
                      <button
                        onClick={() => handleDeleteArticle(art.id, art.title)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Delete Article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* E: ARTICLE WORKBENCH & EDITORIAL AI ASSISTANT */}
      {activeTab === 'editor' && editingArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Editor (7 cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" />
                <span>Editorial Workbench: {editingArticle.id}</span>
              </h3>
              <button
                onClick={handleSaveArticleEdits}
                disabled={!hasRolePermission('EDIT_NEWS')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-40"
              >
                Save Revisions
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Headline (English)
                </label>
                <input
                  type="text"
                  value={editingArticle.title}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Executive Summary
                </label>
                <textarea
                  rows={3}
                  value={editingArticle.summary}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, summary: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Full Article Body
                </label>
                <textarea
                  rows={8}
                  value={editingArticle.content}
                  onChange={(e) =>
                    setEditingArticle({ ...editingArticle, content: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-serif text-sm leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Verification Status
                  </label>
                  <select
                    value={editingArticle.verificationStatus}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        verificationStatus: e.target.value as any,
                      })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  >
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="DEVELOPING">DEVELOPING</option>
                    <option value="UNVERIFIED">UNVERIFIED</option>
                    <option value="DISPUTED">DISPUTED</option>
                    <option value="MISLEADING">MISLEADING</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Publication State
                  </label>
                  <select
                    value={editingArticle.status}
                    onChange={(e) =>
                      setEditingArticle({
                        ...editingArticle,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-bold"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Published">Published</option>
                    <option value="Expired">Expired</option>
                    <option value="Draft">Draft</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI Editorial Assistant Panel (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 text-white p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Editorial AI Co-Pilot</h3>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-400 font-medium">One-Click AI Transformations:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRunAiAssistant('suggest_headlines')}
                  disabled={aiAssistantLoading}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left font-medium disabled:opacity-40"
                >
                  ⚡ Suggest 5 Headlines
                </button>
                <button
                  onClick={() => handleRunAiAssistant('extract_claims')}
                  disabled={aiAssistantLoading}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left font-medium disabled:opacity-40"
                >
                  🔍 Extract Assertions
                </button>
                <button
                  onClick={() => handleRunAiAssistant('build_timeline')}
                  disabled={aiAssistantLoading}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left font-medium disabled:opacity-40"
                >
                  📅 Build Timeline
                </button>
                <button
                  onClick={() => handleRunAiAssistant('check_contradictions')}
                  disabled={aiAssistantLoading}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left font-medium disabled:opacity-40"
                >
                  ⚖ Find Contradictions
                </button>
              </div>
            </div>

            {/* Assistant Output Area */}
            {aiAssistantLoading ? (
              <div className="py-10 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-400">AI generating editorial intelligence...</p>
              </div>
            ) : aiAssistantOutput ? (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2 max-h-72 overflow-y-auto">
                <div className="font-bold text-emerald-400">AI Response:</div>
                <pre className="text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(aiAssistantOutput, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80 text-center text-xs text-slate-500">
                Click any AI transformation button above to generate enhancements.
              </div>
            )}
          </div>
        </div>
      )}

      {/* F: SOURCES MANAGEMENT REGISTRY */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Connected Wire Sources Registry ({sources.length})
              </h3>
              <p className="text-xs text-slate-500">
                Authorized RSS feeds and licensed news wire ingest endpoints.
              </p>
            </div>

            {hasRolePermission('MANAGE_SOURCES') ? (
              <button
                onClick={() => setShowAddSourceModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Wire Source</span>
              </button>
            ) : (
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                Requires OWNER role to add/modify sources
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {src.name}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      src.healthStatus === 'Healthy'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {src.healthStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-mono truncate" title={src.feedUrl}>
                  {src.feedUrl}
                </p>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>
                    Category: <strong>{src.category}</strong> ({src.country})
                  </div>
                  <div>Frequency: Every {src.fetchFrequencyMinutes} minutes • Priority {src.priority || 50}</div>
                  <div>Collected: {src.totalArticlesCollected} articles</div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {hasRolePermission('MANAGE_SOURCES') ? (
                    <button
                      onClick={() => handleToggleSourceActive(src)}
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        src.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      {src.isActive ? 'Active (Ingesting)' : 'Paused (Disabled)'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {src.isActive ? 'Active' : 'Paused'}
                    </span>
                  )}

                  {hasRolePermission('MANAGE_SOURCES') && (
                    <button
                      onClick={() => handleDeleteSource(src.id, src.name)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Remove Source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* G: AUDIT TRAIL LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Immutable Governance Audit Trail
            </h3>
            <span className="text-xs text-slate-400 font-mono">{auditLogs.length} Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-3">Timestamp (BST)</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Entity</th>
                  <th className="p-3">Details / Diff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-mono text-slate-500">
                      {formatDhakaTime(log.timestamp)}
                    </td>
                    <td className="p-3 font-medium">
                      {log.actorName}{' '}
                      <span className="text-[10px] text-emerald-600">({log.actorRole})</span>
                    </td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{log.action}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {log.entityType} #{log.entityId}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">
                      {log.newValue || log.previousValue || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* H: SECURITY & RBAC MATRIX TAB */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* JWT Session Details Card */}
          <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider">Active JWT Token & Cryptography</h3>
              </div>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-2.5 py-1 rounded font-mono font-bold">
                HMAC-SHA256 (HS256)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-semibold">Decoded Token Claims:</div>
                <div className="space-y-1 font-mono text-[11px]">
                  <div><span className="text-slate-500">sub (User ID):</span> <span className="text-emerald-400">{currentUser?.id}</span></div>
                  <div><span className="text-slate-500">email:</span> <span className="text-slate-200">{currentUser?.email}</span></div>
                  <div><span className="text-slate-500">role:</span> <span className="text-amber-400 font-bold">{currentUser?.role}</span></div>
                  <div><span className="text-slate-500">iss (Issuer):</span> <span className="text-slate-300">truthpulse-ai-auth</span></div>
                  <div><span className="text-slate-500">aud (Audience):</span> <span className="text-slate-300">truthpulse-platform</span></div>
                </div>
              </div>

              <div className="space-y-2 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-semibold">Bearer Authorization Header:</div>
                <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-300 break-all select-all">
                  {authToken ? `Bearer ${authToken}` : 'No active session token'}
                </div>
                <div className="text-[11px] text-slate-400">
                  Protected backend routes automatically verify token signatures and enforce RBAC policies.
                </div>
              </div>
            </div>
          </div>

          {/* Role Permissions Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Role-Based Access Control (RBAC) Permission Matrix</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                    <th className="p-3">Permission Key</th>
                    <th className="p-3 text-center">OWNER (Chief Editor)</th>
                    <th className="p-3 text-center">EDITOR (Senior Editor)</th>
                    <th className="p-3 text-center">ANALYST (Fact Checker)</th>
                    <th className="p-3 text-center">Current User Has</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {[
                    { key: 'ADMIN_ACCESS', label: 'Access Admin Newsroom Panel', owner: true, editor: true, analyst: true },
                    { key: 'VIEW_METRICS', label: 'View Dashboard KPIs & Analytics', owner: true, editor: true, analyst: true },
                    { key: 'EDIT_NEWS', label: 'Draft & Edit Articles in Workbench', owner: true, editor: true, analyst: true },
                    { key: 'USE_AI_ASSISTANT', label: 'Run AI Co-Pilot Transformations', owner: true, editor: true, analyst: true },
                    { key: 'FACT_CHECK_MANAGE', label: 'Update Verification Claims', owner: true, editor: true, analyst: true },
                    { key: 'PUBLISH_NEWS', label: 'Approve & Publish to Live Feed', owner: true, editor: true, analyst: false },
                    { key: 'DELETE_NEWS', label: 'Delete or Archive Articles', owner: true, editor: true, analyst: false },
                    { key: 'TRIGGER_INGESTION', label: 'Trigger Real-Time Wire Fetch', owner: true, editor: true, analyst: false },
                    { key: 'VIEW_AUDIT_LOGS', label: 'Inspect Governance Audit Trail', owner: true, editor: true, analyst: false },
                    { key: 'MANAGE_SOURCES', label: 'Register & Modify RSS/API Sources', owner: true, editor: false, analyst: false },
                    { key: 'MANAGE_SETTINGS', label: 'Modify Platform & Ingestion Config', owner: true, editor: false, analyst: false },
                    { key: 'MANAGE_USERS', label: 'Create & Manage Admin Accounts', owner: true, editor: false, analyst: false },
                  ].map((perm) => (
                    <tr key={perm.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{perm.label}</div>
                        <div className="font-mono text-[10px] text-slate-400">{perm.key}</div>
                      </td>
                      <td className="p-3 text-center">
                        {perm.owner ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="p-3 text-center">
                        {perm.editor ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="p-3 text-center">
                        {perm.analyst ? <Check className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-300 mx-auto" />}
                      </td>
                      <td className="p-3 text-center">
                        {hasRolePermission(perm.key) ? (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            GRANTED
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2 py-0.5 rounded text-[10px]">
                            DENIED
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* I: BACKGROUND JOBS MONITOR */}
      {activeTab === 'jobs' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              System Ingestion & Verification Jobs
            </h3>
            {hasRolePermission('TRIGGER_INGESTION') && (
              <button
                onClick={handleTriggerFullPipeline}
                className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold"
              >
                Trigger Ingestion
              </button>
            )}
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{job.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      job.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {job.status} ({job.progress}%)
                  </span>
                </div>
                {job.details && <p className="text-slate-500">{job.details}</p>}
                <div className="text-[11px] text-slate-400">
                  Started: {formatDhakaTime(job.startedAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Staff Newsroom Login
                </h3>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualLogin} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Staff Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@truthpulse.ai"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loginLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                  <span>Sign In</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD SOURCE MODAL */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Register New Wire Source
              </h3>
              <button
                onClick={() => setShowAddSourceModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSourceSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Source / Publisher Name
                </label>
                <input
                  type="text"
                  required
                  value={newSourceData.name}
                  onChange={(e) => setNewSourceData({ ...newSourceData, name: e.target.value })}
                  placeholder="e.g. Bangladesh Sangbad Sangstha (BSS)"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  RSS Feed or API URL
                </label>
                <input
                  type="url"
                  required
                  value={newSourceData.feedUrl}
                  onChange={(e) => setNewSourceData({ ...newSourceData, feedUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newSourceData.category}
                    onChange={(e) =>
                      setNewSourceData({ ...newSourceData, category: e.target.value as NewsCategory })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="International">International</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Frequency (Min)
                  </label>
                  <input
                    type="number"
                    value={newSourceData.fetchFrequencyMinutes}
                    onChange={(e) =>
                      setNewSourceData({
                        ...newSourceData,
                        fetchFrequencyMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSourceModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Register Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
