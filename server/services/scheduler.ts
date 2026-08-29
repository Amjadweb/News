import { db } from '../db';
import { executeNewsIngestion, IngestionReport } from './newsFetcher';
import { runNewsExpiryCheck, ExpiryResult } from './newsExpiryService';
import { rankNewsArticles } from './newsRanker';
import { NewsSyncStatus, BackgroundJob } from '../../src/types';

let timerHandle: NodeJS.Timeout | null = null;
let isSyncing = false;
let lastSyncTime = new Date().toISOString();
let nextSyncTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
let syncCycleCount = 0;
let lastSyncNewArticlesCount = 0;
let lastSyncMessage = 'System initialized';

export function getSyncStatus(): NewsSyncStatus {
  const activeCount = db.articles.filter(
    (a) => a.status === 'Published' || a.status === 'Approved'
  ).length;
  const expiredCount = db.articles.filter((a) => a.status === 'Expired').length;
  const manualCount = db.articles.filter((a) => a.isManual).length;
  const activeSources = db.sources.filter((s) => s.isActive).length;

  return {
    lastSyncTime,
    nextSyncTime,
    activeCount,
    expiredCount,
    manualCount,
    totalSources: db.sources.length,
    activeSources,
    isSyncing,
    syncCycleCount,
    lastSyncNewArticlesCount,
    message: lastSyncMessage,
  };
}

/**
 * Runs a single full background cycle:
 * 1. 12-Hour Expiration Check & State Transition
 * 2. Multi-Source News Ingestion & AI Deduplication / Synthesis
 * 3. Dynamic Re-ranking & Top News Rotation
 * 4. Audit & Background Job Logging
 */
export async function runFullSyncCycle(reason = 'SCHEDULED_POLL'): Promise<{
  expiryResult: ExpiryResult;
  ingestionReport: IngestionReport;
}> {
  if (isSyncing) {
    console.log('[Scheduler] Sync already in progress, skipping overlapping run');
    return {
      expiryResult: { expiredCount: 0, expiredArticleIds: [], totalActiveCount: 0, totalExpiredCount: 0, processedAt: new Date().toISOString() },
      ingestionReport: { timestamp: new Date().toISOString(), sourcesAttempted: 0, sourcesSuccessful: 0, sourcesFailed: 0, itemsFoundTotal: 0, itemsNewAdded: 0, itemsDuplicateSkipped: 0, errors: [], newArticles: [] },
    };
  }

  isSyncing = true;
  const cycleStart = new Date().toISOString();
  console.log(`[Scheduler] >>> Starting Background News Sync Cycle (${reason}) at ${cycleStart}`);

  const jobId = `job_${Date.now()}`;
  const job: BackgroundJob = {
    id: jobId,
    name: `Dynamic News Ingestion & 12-Hour Expiration Pipeline (${reason})`,
    type: 'NEWS_COLLECTION',
    status: 'Processing',
    progress: 10,
    startedAt: cycleStart,
  };
  db.backgroundJobs.unshift(job);

  try {
    // 1. Run 12-hour expiration check
    const { updatedArticles, result: expiryResult } = runNewsExpiryCheck(db.articles);
    db.articles = updatedArticles;

    if (expiryResult.expiredCount > 0) {
      console.log(`[Scheduler] 12-Hour Expiry: ${expiryResult.expiredCount} articles expired and rotated out of Top News`);
      db.addAuditLog({
        actorId: 'usr_sys_cron',
        actorName: 'TruthPulse News Rotation Engine',
        actorRole: 'OWNER',
        action: 'NEWS_EXPIRY_ROTATION',
        entityType: 'Article',
        entityId: 'BATCH_EXPIRY',
        newValue: `Expired ${expiryResult.expiredCount} articles older than 12 hours`,
      });
    }

    job.progress = 40;

    // 2. Fetch fresh news from active sources
    const { report: ingestionReport, updatedSources, newArticles } = await executeNewsIngestion(
      db.sources,
      db.articles,
      { maxItemsPerSource: 5 }
    );

    // Update sources in database
    db.sources = updatedSources;

    // Add new unique articles to database
    for (const newArt of newArticles) {
      db.articles.unshift(newArt);
    }

    job.progress = 85;

    // 3. Save database changes to disk
    db.saveToDisk();

    // 4. Update sync state
    syncCycleCount++;
    lastSyncTime = new Date().toISOString();
    lastSyncNewArticlesCount = newArticles.length;
    lastSyncMessage = `Cycle completed. ${newArticles.length} new stories added, ${expiryResult.expiredCount} expired.`;

    const intervalMinutes = Number(
      db.systemSettings.find((s) => s.key === 'AUTO_FETCH_INTERVAL_MINUTES')?.value || '15'
    );
    nextSyncTime = new Date(Date.now() + intervalMinutes * 60 * 1000).toISOString();

    job.status = 'Completed';
    job.progress = 100;
    job.completedAt = lastSyncTime;
    job.details = `Fetched from ${ingestionReport.sourcesAttempted} sources. Ingested ${newArticles.length} new items, expired ${expiryResult.expiredCount} old stories.`;

    console.log(`[Scheduler] <<< Finished Background Sync: +${newArticles.length} fresh articles, ${expiryResult.expiredCount} expired. Next sync at ${nextSyncTime}`);

    return {
      expiryResult,
      ingestionReport,
    };
  } catch (err: any) {
    console.error('[Scheduler] Error during news sync cycle:', err);
    job.status = 'Failed';
    job.errorMessage = err?.message || 'Unknown ingestion pipeline error';
    job.completedAt = new Date().toISOString();
    throw err;
  } finally {
    isSyncing = false;
  }
}

/**
 * Initializes and starts the automated server background scheduler
 */
export function initializeScheduler(): void {
  if (timerHandle) {
    clearInterval(timerHandle);
  }

  const intervalMinutes = Number(
    db.systemSettings.find((s) => s.key === 'AUTO_FETCH_INTERVAL_MINUTES')?.value || '15'
  );
  const intervalMs = Math.max(5, intervalMinutes) * 60 * 1000;

  console.log(`[Scheduler] Initializing server background scheduler (every ${intervalMinutes} minutes)`);

  // Run initial sync shortly after startup (after 5 seconds)
  setTimeout(() => {
    runFullSyncCycle('SERVER_STARTUP_BOOT').catch((err) => {
      console.warn('[Scheduler] Initial startup sync notice:', err?.message);
    });
  }, 5000);

  // Set recurring interval
  timerHandle = setInterval(() => {
    runFullSyncCycle('SCHEDULED_INTERVAL').catch((err) => {
      console.warn('[Scheduler] Interval sync error:', err?.message);
    });
  }, intervalMs);
}
