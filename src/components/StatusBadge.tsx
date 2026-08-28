import React from 'react';
import { VerificationStatus } from '../types';
import { ShieldCheck, ShieldAlert, AlertCircle, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const { t } = useApp();

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  let Icon = HelpCircle;
  let label: string = status;

  switch (status) {
    case 'Verified':
      colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      Icon = CheckCircle2;
      label = t.statusVerified;
      break;
    case 'Mostly Verified':
      colorClasses = 'bg-teal-50 text-teal-700 border-teal-300 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800';
      Icon = ShieldCheck;
      label = t.statusMostlyVerified;
      break;
    case 'Mixed Evidence':
      colorClasses = 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      Icon = ShieldAlert;
      label = t.statusMixedEvidence;
      break;
    case 'Unverified':
      colorClasses = 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      Icon = HelpCircle;
      label = t.statusUnverified;
      break;
    case 'Disputed':
      colorClasses = 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
      Icon = AlertCircle;
      label = t.statusDisputed;
      break;
    case 'False':
      colorClasses = 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      Icon = XCircle;
      label = t.statusFalse;
      break;
    case 'Needs Editorial Review':
      colorClasses = 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      Icon = AlertCircle;
      label = t.statusNeedsReview;
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2 py-0.5 gap-1'
      : size === 'lg'
      ? 'text-sm px-3 py-1.5 gap-1.5 font-medium'
      : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-xs whitespace-nowrap ${sizeClasses} ${colorClasses}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{label}</span>
    </span>
  );
};

export const ConfidenceScorePill: React.FC<{ score: number; showLabel?: boolean }> = ({
  score,
  showLabel = true,
}) => {
  let badgeColor = 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
  if (score < 50) {
    badgeColor = 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  } else if (score < 80) {
    badgeColor = 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {showLabel && <span className="text-[11px] font-normal opacity-80">AI Confidence:</span>}
      <span>{score}%</span>
    </div>
  );
};
