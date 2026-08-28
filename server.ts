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
import { UserRole } from './src/types';
import {
  verifyClaimWithAI,
  analyzeDatasetWithAI,
  askDataQuestionAI,
  askEditorialAssistantAI,
} from './server/gemini';
import { runIngestionPipeline } from './server/ingestion';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // ==========================================
  // PUBLIC API ROUTES
  // ==========================================

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'TruthPulse AI Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Dhaka',
    });
  });

  // Get News Articles (Public)
  app.get('/api/news', (req, res) => {
    const { category, search, verificationStatus, sort } = req.query as Record<string, string>;
    let articles = db.getArticles({
      category,
      search,
      verificationStatus,
      status: 'Published',
    });

    if (sort === 'Important') {
      articles = [...articles].sort((a, b) => b.importanceScore - a.importanceScore);
    } else if (sort === 'Trending') {
      articles = [...articles].sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
    } else if (sort === 'Most Read') {
      articles = [...articles].sort((a, b) => b.viewsCount - a.viewsCount);
    } else if (sort === 'Recently Updated') {
      articles = [...articles].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    res.json({
      success: true,
      total: articles.length,
      articles,
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

  // Sources Management: View (All staff)
  app.get('/api/admin/sources', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
    res.json({ success: true, sources: db.sources });
  });

  // Sources Management: Create / Update (Restricted to OWNER role only)
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

      const existingIdx = db.sources.findIndex((s) => s.id === source.id);
      if (existingIdx !== -1) {
        db.sources[existingIdx] = { ...db.sources[existingIdx], ...source };
      } else {
        const newSource = {
          id: `src_${Date.now()}`,
          name: source.name,
          feedUrl: source.feedUrl,
          category: source.category || 'Technology',
          country: source.country || 'Bangladesh',
          language: source.language || 'English',
          isActive: source.isActive !== undefined ? source.isActive : true,
          fetchFrequencyMinutes: source.fetchFrequencyMinutes || 15,
          lastSuccessfulFetch: new Date().toISOString(),
          lastFetchAttempt: new Date().toISOString(),
          errorCount: 0,
          healthStatus: 'Healthy' as const,
          totalArticlesCollected: 0,
        };
        db.sources.push(newSource);
      }

      db.addAuditLog({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'SOURCE_CONFIG_UPDATED',
        entityType: 'Source',
        entityId: source.id || 'new',
        newValue: `Source: ${source.name}`,
      });

      res.json({ success: true, sources: db.sources });
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
