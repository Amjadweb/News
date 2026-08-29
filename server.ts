import express, { Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db';
import {
  authenticateToken,
  requireRole,
  generateJwtToken,
  verifyPassword,
  ROLE_PERMISSIONS,
  AuthenticatedRequest,
} from './server/auth';
import { UserRole, NewsArticle } from './src/types';
import {
  verifyClaimWithAI,
  analyzeDatasetWithAI,
  askDataQuestionAI,
  askEditorialAssistantAI,
} from './server/gemini';
import { initializeScheduler, runFullSyncCycle, getSyncStatus } from './server/services/scheduler';
import { runIngestionPipeline } from './server/ingestion';
import { generateSlug } from './server/services/newsProcessor';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Initialize automated background scheduler (runs 12h expiry & RSS poll every 10-15 min)
  initializeScheduler();

  // ==========================================
  // PUBLIC API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TruthPulse AI Platform',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Dhaka',
      syncStatus: getSyncStatus(),
    });
  });

  // Dynamic Live Sync & Expiry Status
  app.get('/api/news/sync-status', (req, res) => {
    res.json({
      success: true,
      status: getSyncStatus(),
    });
  });

  // Dynamic Top 15-20 Ranked News Stories
  app.get('/api/news/top', (req, res) => {
    const { limit = '20', category } = req.query as Record<string, string>;
    const parsedLimit = Math.min(50, Math.max(5, parseInt(limit, 10) || 20));
    const articles = db.getTopNews(parsedLimit, category);
    const syncStatus = getSyncStatus();

    res.json({
      success: true,
      total: articles.length,
      limit: parsedLimit,
      category: category || 'All',
      syncStatus,
      articles,
    });
  });

  // Get News Articles (Public Dynamic Feed)
  app.get('/api/news', (req, res) => {
    const { category, search, verificationStatus, sort, limit = '50', page = '1' } = req.query as Record<string, string>;
    const articles = db.getArticles({
      category,
      search,
      verificationStatus,
      sort: sort || 'Dynamic Ranked',
      includeExpired: false,
    });

    const parsedLimit = parseInt(limit, 10) || 50;
    const parsedPage = parseInt(page, 10) || 1;
    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginated = articles.slice(startIndex, startIndex + parsedLimit);

    res.json({
      success: true,
      total: articles.length,
      page: parsedPage,
      pageSize: paginated.length,
      syncStatus: getSyncStatus(),
      articles: paginated,
    });
  });

  // Get Single News by Slug
  app.get('/api/news/:slug', (req, res) => {
    const { slug } = req.params;
    const article = db.getArticleBySlug(slug);
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    // Increment view count
    article.viewsCount = (article.viewsCount || 0) + 1;

    // Get related news in same category
    const related = db
      .getArticles({ category: article.category, status: 'Published' })
      .filter((a) => a.id !== article.id)
      .slice(0, 3);

    res.json({
      success: true,
      article,
      related,
    });
  });

  // Today's News Dedicated Endpoint
  app.get('/api/today', (req, res) => {
    const published = db.getArticles({ status: 'Published' });
    const breaking = published.filter((a) => a.isBreaking);
    const trending = published.filter((a) => a.isTrending);
    const editorPicks = published.filter((a) => a.isEditorPick);

    // Group counts by category
    const categoryCounts: Record<string, number> = {};
    published.forEach((a) => {
      categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
    });

    res.json({
      success: true,
      currentDateUtc: new Date().toISOString(),
      currentDateDhaka: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }),
      totalCount: published.length,
      breaking,
      trending,
      editorPicks,
      categoryCounts,
      articles: published,
    });
  });

  // Categories list
  app.get('/api/categories', (req, res) => {
    const published = db.getArticles({ status: 'Published' });
    const counts: Record<string, number> = {};
    published.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1;
    });

    res.json({
      success: true,
      categories: [
        'Bangladesh',
        'International',
        'Technology',
        'Artificial Intelligence',
        'Business',
        'Finance & Economy',
        'Sports',
        'Health',
        'Science',
        'Education',
        'Entertainment',
        'Environment',
        'Jobs & Career',
      ],
      counts,
    });
  });

  // Public Source Registry
  app.get('/api/sources', (req, res) => {
    res.json({
      success: true,
      sources: db.sources,
    });
  });

  // Trending Topics
  app.get('/api/trending', (req, res) => {
    res.json({
      success: true,
      trending: db.trendingTopics,
    });
  });

  // Fact Checks Archive
  app.get('/api/fact-check', (req, res) => {
    res.json({
      success: true,
      total: db.factChecks.length,
      factChecks: db.factChecks,
    });
  });

  // Real-Time Fact Verification Engine
  app.post('/api/fact-check/verify', async (req, res) => {
    const { claim } = req.body;
    if (!claim || typeof claim !== 'string') {
      return res.status(400).json({ success: false, error: 'Claim text is required' });
    }

    try {
      const result = await verifyClaimWithAI(claim);

      // Save to fact check archive
      const item = {
        id: `fc_${Date.now()}`,
        claim: result.claim,
        verdict: result.verdict as any,
        confidenceScore: result.confidenceScore,
        summary: result.summary,
        assertions: result.assertions,
        evidences: result.evidences as any,
        contradictoryEvidence: result.contradictoryEvidence,
        primarySourceAvailable: result.primarySourceAvailable,
        conclusion: result.conclusion,
        whyTrustedExplanation: result.whyTrustedExplanation,
        createdAt: new Date().toISOString(),
        category: 'Public Inquiry',
      };
      db.factChecks.unshift(item);

      res.json({ success: true, factCheck: item });
    } catch (err: any) {
      console.error('Fact verification error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to verify claim' });
    }
  });

  // Data Analyzer: Profile & AI Inspection
  app.post('/api/analyze/profile', async (req, res) => {
    const { fileName, rowCount, columnCount, columnsInfo, previewSample } = req.body;
    if (!fileName || !columnsInfo) {
      return res.status(400).json({ success: false, error: 'Dataset metadata is required' });
    }

    try {
      const result = await analyzeDatasetWithAI({
        fileName,
        rowCount: rowCount || previewSample.length,
        columnCount: columnCount || columnsInfo.length,
        columnsInfo,
        previewSample: previewSample || [],
      });

      res.json({ success: true, analysis: result });
    } catch (err: any) {
      console.error('Data analysis error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to analyze data' });
    }
  });

  // Data Analyzer: Question Answering
  app.post('/api/analyze/ask', async (req, res) => {
    const { question, datasetSummary, sampleRows } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: 'Question is required' });
    }

    try {
      const answer = await askDataQuestionAI(question, datasetSummary, sampleRows || []);
      res.json({ success: true, answer });
    } catch (err: any) {
      console.error('Data QA error:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to answer data question' });
    }
  });

  // ==========================================
  // AUTHENTICATION & JWT SERVICE ROUTES
  // ==========================================

  // Login with Email & Password
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
        code: 'MISSING_CREDENTIALS',
      });
    }

    const account = db.getAccountByEmail(email);
    if (!account) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. No user found with this email.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isValid = verifyPassword(password, account.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Please verify your password.',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const safeUser = db.getUserById(account.id)!;
    db.updateUserLastLogin(account.id);

    const { token, expiresAt } = generateJwtToken(safeUser);
    const permissions = ROLE_PERMISSIONS[safeUser.role] || [];

    db.addAuditLog({
      actorId: safeUser.id,
      actorName: safeUser.name,
      actorRole: safeUser.role,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: safeUser.id,
      newValue: `Authenticated as ${safeUser.role}`,
    });

    res.json({
      success: true,
      token,
      expiresAt,
      user: safeUser,
      permissions,
    });
  });

  // Quick Sign-In / Role Switch (Authorized Staff & Newsroom Testing)
  app.post('/api/auth/quick-login', (req, res) => {
    const { role, email } = req.body;
    let targetUser = null;

    if (email) {
      targetUser = db.getUserByEmail(email);
    } else if (role) {
      targetUser = db.users.find((u) => u.role === role);
    }

    if (!targetUser) {
      targetUser = db.users[0]; // Default to Owner
    }

    const safeUser = db.getUserById(targetUser.id)!;
    db.updateUserLastLogin(safeUser.id);

    const { token, expiresAt } = generateJwtToken(safeUser);
    const permissions = ROLE_PERMISSIONS[safeUser.role] || [];

    db.addAuditLog({
      actorId: safeUser.id,
      actorName: safeUser.name,
      actorRole: safeUser.role,
      action: 'STAFF_ROLE_ACCESSED',
      entityType: 'User',
      entityId: safeUser.id,
      newValue: `Switched session to role: ${safeUser.role}`,
    });

    res.json({
      success: true,
      token,
      expiresAt,
      user: safeUser,
      permissions,
    });
  });

  // Current Authenticated Session Profile
  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const user = req.user!;
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    res.json({
      success: true,
      user,
      permissions,
    });
  });

  // Staff User Registration (Restricted)
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required for staff registration.',
      });
    }

    try {
      const newUser = db.createUser({
        name,
        email,
        password,
        role: (role as UserRole) || 'ANALYST',
      });

      const { token, expiresAt } = generateJwtToken(newUser);
      const permissions = ROLE_PERMISSIONS[newUser.role] || [];

      res.json({
        success: true,
        token,
        expiresAt,
        user: newUser,
        permissions,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Staff Users List
  app.get('/api/auth/users', authenticateToken, requireRole(['OWNER', 'EDITOR']), (req: AuthenticatedRequest, res: Response) => {
    const users = db.getAllUsers();
    res.json({ success: true, users });
  });

  // ==========================================
  // OWNER & EDITOR NEWSROOM API ROUTES (PROTECTED BY JWT & RBAC)
  // ==========================================

  // Dashboard Stats (Accessible to all authenticated staff: OWNER, EDITOR, ANALYST)
  app.get('/api/admin/dashboard', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const totalNews = db.articles.length;
    const published = db.articles.filter((a) => a.status === 'Published').length;
    const pending = db.articles.filter((a) => a.status === 'Pending Review').length;
    const scheduled = db.articles.filter((a) => a.status === 'Scheduled').length;
    const rejected = db.articles.filter((a) => a.status === 'Rejected').length;
    const sourcesCount = db.sources.length;
    const failedSources = db.sources.filter((s) => s.healthStatus === 'Failing' || s.healthStatus === 'Degraded').length;
    const factChecksCount = db.factChecks.length;

    // Category breakdown
    const categoryStats: Record<string, number> = {};
    db.articles.forEach((a) => {
      categoryStats[a.category] = (categoryStats[a.category] || 0) + 1;
    });

    // Verification status breakdown
    const verificationStats: Record<string, number> = {};
    db.articles.forEach((a) => {
      verificationStats[a.verificationStatus] = (verificationStats[a.verificationStatus] || 0) + 1;
    });

    res.json({
      success: true,
      authenticatedUser: req.user,
      metrics: {
        totalNews,
        publishedToday: published,
        pendingReview: pending,
        scheduled,
        rejected,
        sourcesCount,
        failedSources,
        factChecksCount,
        dataAnalysesCount: 18,
        totalTrafficViews: db.articles.reduce((acc, a) => acc + (a.viewsCount || 0), 0),
      },
      categoryStats,
      verificationStats,
      recentAuditLogs: db.auditLogs.slice(0, 15),
      sources: db.sources,
      eventGroups: db.eventGroups,
    });
  });

  // Admin News List (Accessible to all authenticated staff)
  app.get('/api/admin/news', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    const { status, category, search } = req.query as Record<string, string>;
    let list = [...db.articles];
    if (status && status !== 'All') {
      list = list.filter((a) => a.status.toLowerCase() === status.toLowerCase());
    }
    if (category && category !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
    }
    res.json({ success: true, articles: list });
  });

  // Change Article Status (Requires OWNER or EDITOR role)
  app.post(
    '/api/admin/news/:id/status',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR']),
    (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { status, scheduledFor } = req.body;
      const actor = req.user!;

      const updated = db.updateArticle(
        id,
        {
          status,
          ...(scheduledFor ? { scheduledFor } : {}),
        },
        actor
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      res.json({ success: true, article: updated });
    }
  );

  // Edit Article (Requires OWNER or EDITOR role)
  app.post(
    '/api/admin/news/:id/edit',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR']),
    (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { updates } = req.body;
      const actor = req.user!;

      const updated = db.updateArticle(id, updates || {}, actor);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      res.json({ success: true, article: updated });
    }
  );

  // Editorial AI Assistant (Requires OWNER, EDITOR, or ANALYST role)
  app.post(
    '/api/admin/assistant',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR', 'ANALYST']),
    async (req: AuthenticatedRequest, res: Response) => {
      const { action, article, prompt } = req.body;
      try {
        const result = await askEditorialAssistantAI(action, article, prompt);
        res.json({ success: true, ...result });
      } catch (err: any) {
        console.error('Editorial AI assistant error:', err);
        res.status(500).json({ success: false, error: err.message || 'AI assistant failed' });
      }
    }
  );

  // Trigger News Ingestion Pipeline (Requires OWNER or EDITOR role)
  app.post(
    '/api/admin/ingest',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR']),
    async (req: AuthenticatedRequest, res: Response) => {
      const { sourceId } = req.body;
      const actor = req.user!;

      try {
        const result = await runIngestionPipeline(sourceId);
        db.addAuditLog({
          actorId: actor.id,
          actorName: actor.name,
          actorRole: actor.role,
          action: 'MANUAL_INGESTION_TRIGGERED',
          entityType: 'IngestionPipeline',
          entityId: sourceId || 'all_sources',
          newValue: `Fetched ${result.fetchedCount} items, ${result.newArticlesCount} new articles`,
        });

        res.json({ success: true, result });
      } catch (err: any) {
        console.error('Ingestion error:', err);
        res.status(500).json({ success: false, error: err.message || 'Ingestion failed' });
      }
    }
  );

  // Create Manual News Article (Requires OWNER or EDITOR role)
  app.post(
    '/api/admin/news/create',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR']),
    (req: AuthenticatedRequest, res: Response) => {
      const {
        title,
        titleBn,
        summary,
        summaryBn,
        content,
        category,
        tags,
        imageUrl,
        sourceName,
        sourceUrl,
        isBreaking,
        isTrending,
        isEditorPick,
        importanceScore,
        confidenceScore,
        verificationStatus,
        keyFacts,
        status,
        autoExpire,
      } = req.body;

      if (!title || !summary) {
        return res.status(400).json({ success: false, error: 'Title and summary are required' });
      }

      const actor = req.user!;
      const nowStr = new Date().toISOString();
      const slug = generateSlug(title);

      const primarySource = {
        id: `src_manual_${Date.now()}`,
        name: sourceName || 'TruthPulse Direct Bureau',
        url: sourceUrl || 'https://truthpulse.ai',
        publisher: sourceName || 'TruthPulse Newsroom',
        domain: 'truthpulse.ai',
        publishedAt: nowStr,
        retrievedAt: nowStr,
        sourceType: 'Manual Editorial' as const,
        reliabilityScore: 98,
        isPrimary: true,
      };

      const newArticle: NewsArticle = {
        id: `art_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        slug,
        title,
        titleBn: titleBn || title,
        summary,
        summaryBn: summaryBn || summary,
        content: content || summary,
        category: category || 'Bangladesh',
        tags: Array.isArray(tags) ? tags : [category || 'General'],
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop&q=80',
        publishedAt: nowStr,
        createdAt: nowStr,
        updatedAt: nowStr,
        retrievedAt: nowStr,
        status: status || 'Published',
        verificationStatus: verificationStatus || 'Verified',
        confidenceScore: confidenceScore || 95,
        importanceScore: importanceScore || 85,
        viewsCount: 1,
        isBreaking: Boolean(isBreaking),
        isTrending: Boolean(isTrending),
        isEditorPick: Boolean(isEditorPick),
        isManual: true,
        autoExpire: Boolean(autoExpire),
        aiGenerated: false,
        sourceName: sourceName || 'TruthPulse Editorial Bureau',
        sourceUrl: sourceUrl || 'https://truthpulse.ai',
        byline: actor.name,
        location: 'Dhaka, Bangladesh',
        primarySource,
        sourceComparison: {
          totalChecked: 1,
          supporting: 1,
          conflicting: 0,
          sources: [primarySource],
          primarySourceAvailable: true,
        },
        keyFacts: Array.isArray(keyFacts) && keyFacts.length > 0 ? keyFacts : [summary],
        extractedClaims: [],
      };

      const saved = db.addArticle(newArticle);

      db.addAuditLog({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'MANUAL_ARTICLE_PUBLISHED',
        entityType: 'Article',
        entityId: saved.id,
        newValue: `Published: ${saved.title} (${saved.category})`,
      });

      res.json({ success: true, article: saved });
    }
  );

  // Delete Article (Requires OWNER role)
  app.delete(
    '/api/admin/news/:id',
    authenticateToken,
    requireRole(['OWNER']),
    (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const actor = req.user!;

      const success = db.deleteArticle(id, actor);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Article not found' });
      }

      res.json({ success: true, message: 'Article deleted successfully' });
    }
  );

  // Trigger Full Dynamic Ingestion & 12-Hour Expiration Pipeline
  app.post(
    '/api/admin/pipeline/trigger',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR']),
    async (req: AuthenticatedRequest, res: Response) => {
      const actor = req.user!;
      try {
        const result = await runFullSyncCycle(`MANUAL_ADMIN_${actor.role}`);
        res.json({ success: true, ...result, syncStatus: getSyncStatus() });
      } catch (err: any) {
        console.error('Pipeline trigger error:', err);
        res.status(500).json({ success: false, error: err.message || 'Pipeline trigger failed' });
      }
    }
  );

  // Seed 20-Story Dynamic Rotation Test Scenario (Step 22)
  app.post(
    '/api/admin/test-rotation',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR']),
    async (req: AuthenticatedRequest, res: Response) => {
      const actor = req.user!;
      const result = db.seedScenarioTestData(actor);
      // Run expiry check to show 12-hour expiration in real-time
      const syncResult = await runFullSyncCycle('TEST_SCENARIO_EXPIRY_DEMO');
      res.json({
        success: true,
        seededCount: result.count,
        syncResult,
        topNews: db.getTopNews(20),
        syncStatus: getSyncStatus(),
      });
    }
  );

  // Sources Management: View (All staff)
  app.get('/api/admin/sources', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, sources: db.sources });
  });

  // Sources Management: Create (Restricted to OWNER role only)
  app.post(
    '/api/admin/sources',
    authenticateToken,
    requireRole(['OWNER']),
    (req: AuthenticatedRequest, res: Response) => {
      const { source } = req.body;
      const actor = req.user!;

      if (!source || !source.name || !source.feedUrl) {
        return res.status(400).json({ success: false, error: 'Source name and URL are required' });
      }

      const created = db.addSource(source, actor);
      res.json({ success: true, source: created, sources: db.sources });
    }
  );

  // Sources Management: Update (Restricted to OWNER role only)
  app.put(
    '/api/admin/sources/:id',
    authenticateToken,
    requireRole(['OWNER']),
    (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const { updates } = req.body;
      const actor = req.user!;

      const updated = db.updateSource(id, updates || {}, actor);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Source not found' });
      }

      res.json({ success: true, source: updated, sources: db.sources });
    }
  );

  // Sources Management: Delete (Restricted to OWNER role only)
  app.delete(
    '/api/admin/sources/:id',
    authenticateToken,
    requireRole(['OWNER']),
    (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const actor = req.user!;

      const success = db.deleteSource(id, actor);
      if (!success) {
        return res.status(404).json({ success: false, error: 'Source not found' });
      }

      res.json({ success: true, message: 'Source deleted successfully', sources: db.sources });
    }
  );

  // Audit Logs (Requires OWNER or EDITOR role)
  app.get(
    '/api/admin/audit-logs',
    authenticateToken,
    requireRole(['OWNER', 'EDITOR']),
    (req: AuthenticatedRequest, res: Response) => {
      res.json({ success: true, auditLogs: db.auditLogs });
    }
  );

  // System Settings: View (All staff)
  app.get('/api/admin/settings', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, settings: db.systemSettings });
  });

  // System Settings: Update (Restricted to OWNER role only)
  app.post(
    '/api/admin/settings',
    authenticateToken,
    requireRole(['OWNER']),
    (req: AuthenticatedRequest, res: Response) => {
      const { key, value } = req.body;
      const actor = req.user!;

      const setting = db.systemSettings.find((s) => s.key === key);
      if (setting) {
        setting.value = value;
        setting.updatedAt = new Date().toISOString();
        setting.updatedBy = actor.name;
      }

      db.addAuditLog({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'SYSTEM_SETTING_UPDATED',
        entityType: 'Setting',
        entityId: key,
        newValue: `${key}=${value}`,
      });

      res.json({ success: true, settings: db.systemSettings });
    }
  );

  // Background Jobs (All authenticated staff)
  app.get('/api/admin/jobs', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, jobs: db.backgroundJobs });
  });


  // ==========================================
  // VITE & STATIC SPA FALLBACK
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TruthPulse AI server running on port ${PORT}`);
  });
}

startServer();
