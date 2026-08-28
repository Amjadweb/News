export type UserRole = 'OWNER' | 'EDITOR' | 'ANALYST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: string;
  permissions: string[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  expiresAt?: string;
  permissions?: string[];
  error?: string;
  code?: string;
}

export type VerificationStatus = 
  | 'Verified' 
  | 'Mostly Verified' 
  | 'Mixed Evidence' 
  | 'Unverified' 
  | 'Disputed' 
  | 'False' 
  | 'Needs Editorial Review';

export type ArticleStatus = 
  | 'AI Collected' 
  | 'AI Analyzed' 
  | 'Pending Review' 
  | 'Approved' 
  | 'Scheduled' 
  | 'Published' 
  | 'Rejected' 
  | 'Archived';

export type NewsCategory = 
  | 'Bangladesh'
  | 'International'
  | 'Technology'
  | 'Artificial Intelligence'
  | 'Business'
  | 'Finance & Economy'
  | 'Sports'
  | 'Health'
  | 'Science'
  | 'Education'
  | 'Entertainment'
  | 'Environment'
  | 'Jobs & Career';

export interface ExtractedClaim {
  id: string;
  claim: string;
  confidence: number;
  evidenceStatus: 'supported' | 'contradicted' | 'unverified';
  evidenceSnippet?: string;
}

export interface NewsSourceItem {
  id: string;
  name: string;
  url: string;
  originalUrl?: string;
  publisher: string;
  domain: string;
  author?: string;
  publishedAt: string;
  retrievedAt: string;
  sourceType: 'Official API' | 'RSS Feed' | 'Public Dataset' | 'Government Source' | 'Verified Outlet';
  reliabilityScore: number; // 0-100
  isPrimary?: boolean;
  biasRating?: 'Center' | 'Balanced' | 'Official Agency' | 'Tech Wire';
}

export interface SourceComparison {
  totalChecked: number;
  supporting: number;
  conflicting: number;
  sources: NewsSourceItem[];
  primarySourceAvailable: boolean;
}

export interface TimelineEvent {
  date: string;
  time?: string;
  timestamp?: string;
  title: string;
  description: string;
  sourceName?: string;
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  titleBn?: string;
  summary: string;
  summaryBn?: string;
  content?: string;
  contentBn?: string;
  contentSnippet?: string;
  category: NewsCategory;
  tags: string[];
  imageUrl: string;
  imageCaption?: string;
  publishedAt: string; // ISO UTC
  updatedAt: string; // ISO UTC
  retrievedAt: string;
  scheduledFor?: string;
  status: ArticleStatus;
  verificationStatus: VerificationStatus;
  confidenceScore: number; // 0 - 100
  importanceScore: number; // 0 - 100
  viewsCount: number;
  isBreaking?: boolean;
  isTrending?: boolean;
  isEditorPick?: boolean;
  isDemoData?: boolean;
  
  // BBC & Google News Style Rich Metadata
  byline?: string;
  bylineRole?: string;
  location?: string;
  readTimeMinutes?: number;
  analysis?: {
    author: string;
    role: string;
    text: string;
    textBn?: string;
    avatar?: string;
  };
  quotes?: {
    speaker: string;
    title: string;
    quote: string;
    quoteBn?: string;
  }[];
  fullCoverageSources?: {
    id: string;
    name: string;
    domain: string;
    url: string;
    headline: string;
    headlineBn?: string;
    snippet: string;
    snippetBn?: string;
    publishedAt: string;
    stance?: 'supporting' | 'neutral' | 'questioning';
    reliabilityScore?: number;
  }[];

  // Attribution & Source Details
  primarySource: NewsSourceItem;
  sourceComparison: SourceComparison;
  keyFacts: string[];
  extractedClaims: ExtractedClaim[];
  timeline?: TimelineEvent[];
  eventGroupId?: string;
  
  // Entities detected by AI
  entities?: {
    people?: string[];
    organizations?: string[];
    locations?: string[];
    numbers?: string[];
    dates?: string[];
  };
  contradictionsFound?: string[];
  misinformationFlags?: string[];

  // Editorial tracking
  editorNotes?: string;
  assignedEditor?: string;
  revisionsCount?: number;
}

export interface EventGroup {
  id: string;
  mainHeadline: string;
  category: NewsCategory;
  createdAt: string;
  articlesCount: number;
  primarySourceId: string;
  sourcesCount: number;
  supportingCount: number;
  conflictingCount: number;
  articles: NewsArticle[];
}

export interface NewsSourceRegistry {
  id: string;
  name: string;
  feedUrl: string;
  category: NewsCategory;
  country: string;
  language: string;
  isActive: boolean;
  fetchFrequencyMinutes: number;
  lastSuccessfulFetch?: string;
  lastFetchAttempt?: string;
  errorCount: number;
  healthStatus: 'Healthy' | 'Degraded' | 'Failing' | 'Inactive';
  totalArticlesCollected: number;
}

export type FactCheckVerdict = 'TRUE' | 'MOSTLY TRUE' | 'MIXED' | 'MOSTLY FALSE' | 'FALSE' | 'UNVERIFIED' | 'DISPUTED';

export interface FactCheckItem {
  id: string;
  claim: string;
  claimant?: string;
  claimDate?: string;
  verdict: FactCheckVerdict;
  confidenceScore: number;
  summary: string;
  assertions: string[];
  evidences: {
    sourceName: string;
    sourceUrl: string;
    publishedDate: string;
    evidenceType: 'Primary' | 'Secondary' | 'Official' | 'Independent' | 'User-provided';
    quoteSnippet: string;
    supportsClaim: boolean;
  }[];
  contradictoryEvidence?: string[];
  primarySourceAvailable: boolean;
  conclusion: string;
  whyTrustedExplanation: string;
  createdAt: string;
  category: string;
}

export interface DatasetColumnProfile {
  name: string;
  type: 'number' | 'category' | 'string';
  missingCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
}

export interface DataColumnStats {
  name: string;
  type: 'numeric' | 'categorical' | 'date' | 'boolean' | 'text';
  missingCount: number;
  missingPercentage: number;
  uniqueCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  outlierCount?: number;
  topCategories?: { value: string; count: number }[];
}

export interface DataAnalysisResult {
  id?: string;
  fileName?: string;
  fileSize?: number;
  rowCount?: number;
  columnCount?: number;
  columns?: DataColumnStats[];
  previewRows?: Record<string, any>[];
  qualityScore?: number; // 0 - 100
  dataQualityScore?: number;
  summary?: string;
  datasetSummary?: string;
  keyFindings: string[];
  trends: string[];
  anomalies: string[];
  correlations?: string[];
  possibleErrors?: string[];
  recommendations?: string[];
  suggestedQuestions?: string[];
  suggestedCharts?: {
    type: 'bar' | 'line' | 'pie' | 'area' | 'scatter' | 'kpi';
    title: string;
    xAxisKey?: string;
    yAxisKey?: string;
    dataKey?: string;
    description: string;
  }[];
  extractedSourceMetadata?: {
    source?: string;
    url?: string;
    author?: string;
    organization?: string;
    date?: string;
    datasetName?: string;
    citation?: string;
    hasSourceInfo: boolean;
  };
  truthVerification?: {
    internalConsistency: 'PASS' | 'WARNING' | 'FAIL';
    internalConsistencyNotes: string;
    externalVerificationStatus: 'Verified' | 'Needs Evidence' | 'Disputed' | 'Inconclusive';
    externalSourcesFound: { source: string; claim: string; url?: string }[];
    conclusion: string;
  };
  createdAt?: string;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  topicBn?: string;
  category?: string;
  mentionCount: number;
  growthPercentage: number; // e.g. +184%
  sourcesCount: number;
  categories: string[];
  keyArticles: { id: string; title: string; slug: string }[];
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'Article' | 'Source' | 'User' | 'Setting' | 'FactCheck' | 'IngestionPipeline';
  entityId: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: 'AI' | 'Newsroom' | 'General' | 'Security';
  description: string;
  updatedAt: string;
  updatedBy: string;
}

export interface BackgroundJob {
  id: string;
  name: string;
  type: 'NEWS_COLLECTION' | 'SOURCE_HEALTH_CHECK' | 'DUPLICATE_DETECTION' | 'AI_CLASSIFICATION' | 'AI_SUMMARIZATION' | 'FACT_VERIFICATION' | 'TREND_CALCULATION';
  status: 'Queued' | 'Processing' | 'Completed' | 'Failed';
  progress: number;
  details?: string;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
}
