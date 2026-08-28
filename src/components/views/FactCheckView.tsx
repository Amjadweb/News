import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FactCheckItem, FactCheckVerdict } from '../../types';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Send,
  Building2,
  Scale,
} from 'lucide-react';
import { fetchFactChecksSafe } from '../../services/api';

export const FactCheckView: React.FC = () => {
  const { t, formatDhakaTime, viewPayload, addToast } = useApp();
  const [claimInput, setClaimInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentResult, setCurrentResult] = useState<FactCheckItem | null>(null);
  const [archive, setArchive] = useState<FactCheckItem[]>([]);
  const [selectedVerdict, setSelectedVerdict] = useState('All');
  const [loadingArchive, setLoadingArchive] = useState(true);

  useEffect(() => {
    fetchArchive();
    if (viewPayload?.claim) {
      setClaimInput(viewPayload.claim);
      handleVerifyClaim(viewPayload.claim);
    }
  }, [viewPayload]);

  const fetchArchive = async () => {
    setLoadingArchive(true);
    try {
      const data = await fetchFactChecksSafe();
      setArchive(data);
      if (!currentResult && data.length > 0) {
        setCurrentResult(data[0]);
      }
    } catch (err) {
      console.warn('Using local verified fact check cache');
    } finally {
      setLoadingArchive(false);
    }
  };

  const handleVerifyClaim = async (claimToVerify?: string) => {
    const text = claimToVerify || claimInput;
    if (!text.trim()) {
      addToast('Please enter a claim to verify', 'error');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/fact-check/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claim: text }),
      });

      const data = await res.json();
      if (data.success && data.factCheck) {
        setCurrentResult(data.factCheck);
        setArchive((prev) => [data.factCheck, ...prev]);
        addToast('Claim analysis complete', 'success');
      } else {
        addToast(data.error || 'Failed to verify claim', 'error');
      }
    } catch (err: any) {
      console.error('Claim verification error:', err);
      addToast('Verification service error. Please try again.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const sampleClaims = [
    'Bangladesh foreign exchange reserves crossed $24.8 billion in 2026',
    'NASA confirms James Webb discovered definitive techno-signature',
    'Chittagong Port automated container terminal reduced turnaround by 40%',
  ];

  const filteredArchive =
    selectedVerdict === 'All'
      ? archive
      : archive.filter((item) => item.verdict.toLowerCase() === selectedVerdict.toLowerCase());

  const getVerdictBadge = (verdict: FactCheckVerdict) => {
    switch (verdict) {
      case 'TRUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-4 h-4" /> VERDICT: TRUE
          </span>
        );
      case 'MOSTLY TRUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            <ShieldCheck className="w-4 h-4" /> VERDICT: MOSTLY TRUE
          </span>
        );
      case 'FALSE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-4 h-4" /> VERDICT: FALSE
          </span>
        );
      case 'MOSTLY FALSE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200">
            <XCircle className="w-4 h-4" /> VERDICT: MOSTLY FALSE
          </span>
        );
      case 'MIXED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            <AlertTriangle className="w-4 h-4" /> VERDICT: MIXED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-300">
            <HelpCircle className="w-4 h-4" /> VERDICT: UNVERIFIED
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header Engine Banner */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 text-white p-6 sm:p-8 shadow-xl space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            <Scale className="w-3.5 h-3.5" />
            <span>Autonomous Multi-Source Fact Checking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
            {t.factCheckHeading}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {t.factCheckSubtitle}
          </p>
        </div>

        {/* Claim Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerifyClaim();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              value={claimInput}
              onChange={(e) => setClaimInput(e.target.value)}
              placeholder={t.claimInputPlaceholder}
              disabled={isVerifying}
              className="w-full pl-4 pr-32 py-3.5 bg-slate-900/90 text-white rounded-xl border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-sm placeholder:text-slate-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isVerifying || !claimInput.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.verifyClaimBtn}</span>
                </>
              )}
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Try checking:</span>
            {sampleClaims.map((claim, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setClaimInput(claim);
                  handleVerifyClaim(claim);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md text-[11px] border border-slate-700 transition-colors truncate max-w-xs"
              >
                "{claim}"
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Main Inspection Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Inspection Report (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {currentResult ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
              {/* Verdict Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div className="space-y-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    Verified at {formatDhakaTime(currentResult.createdAt)}
                  </span>
                  {getVerdictBadge(currentResult.verdict)}
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">
                    Consensus Confidence
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {currentResult.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Claim Statement */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Analyzed Claim
                </span>
                <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  "{currentResult.claim}"
                </p>
              </div>

              {/* AI Verification Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Verification Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {currentResult.summary}
                </p>
              </div>

              {/* Deconstructed Assertions */}
              {currentResult.assertions && currentResult.assertions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Deconstructed Assertions
                  </h3>
                  <div className="space-y-2">
                    {currentResult.assertions.map((ast, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs"
                      >
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {ast}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Source Evidence Table */}
              {currentResult.evidences && currentResult.evidences.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Cross-Referenced Evidence Logs
                  </h3>
                  <div className="space-y-3">
                    {currentResult.evidences.map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                              {ev.sourceName}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                              {ev.evidenceType || 'Independent Source'}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                              ev.supportsClaim
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {ev.supportsClaim ? 'Supports Claim' : 'Contradicts / Nuanced'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                          "{ev.quoteSnippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contradictory Evidence Note */}
              {currentResult.contradictoryEvidence && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl space-y-1">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Contradictory / Nuanced Evidence Detected</span>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    {currentResult.contradictoryEvidence}
                  </p>
                </div>
              )}

              {/* Conclusion & Trust Explanation */}
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Definitive Conclusion
                </h4>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {currentResult.conclusion}
                </p>
                {currentResult.whyTrustedExplanation && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-emerald-200/60 dark:border-emerald-800/40">
                    <strong>Audit Transparency:</strong> {currentResult.whyTrustedExplanation}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <Scale className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm text-slate-500">Select a claim or enter a new statement to inspect.</p>
            </div>
          )}
        </div>

        {/* Right Column: Fact Check Archive (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Verified Archive
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold text-slate-400">
                {filteredArchive.length} Records
              </span>
            </div>

            {/* Verdict Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['All', 'TRUE', 'MOSTLY TRUE', 'FALSE', 'MIXED'].map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVerdict(v)}
                  className={`px-2 py-1 rounded-md whitespace-nowrap text-[11px] font-semibold transition-colors ${
                    selectedVerdict === v
                      ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Archive List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredArchive.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setCurrentResult(item)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all space-y-2 ${
                    currentResult?.id === item.id
                      ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                      : 'bg-white/80 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.verdict === 'TRUE'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.verdict === 'FALSE'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.verdict}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.confidenceScore}%
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2">
                    "{item.claim}"
                  </h4>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.summary}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
