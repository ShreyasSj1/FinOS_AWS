import React from 'react';
import { OverviewData } from '../api.js';
import { TabKey } from './Navigation.js';

interface OverviewSummaryProps {
  overview: OverviewData | null;
  onNavigate: (tab: TabKey) => void;
}

export const OverviewSummary: React.FC<OverviewSummaryProps> = ({ overview, onNavigate }) => {
  if (!overview) {
    return <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading telemetry overview...</div>;
  }

  const cards = [
    {
      title: 'Forecasted Monthly AWS Spend',
      value: `$${overview.totalMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: 'Across 3 linked accounts',
      actionLabel: 'View Attribution',
      actionTab: 'attribution' as TabKey
    },
    {
      title: 'Recoverable Waste Pipeline',
      value: `$${overview.totalRecoverableWaste.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo`,
      subtitle: `${overview.activeWasteCount} unattached/idle resources detected`,
      highlight: overview.activeWasteCount > 0,
      actionLabel: 'Triage Waste',
      actionTab: 'waste-radar' as TabKey
    },
    {
      title: 'Pre-Deploy Guardrail Violations',
      value: `${overview.blockedPlansCount} Blocked PR`,
      subtitle: 'Enforced via automated Terraform checks',
      highlight: overview.blockedPlansCount > 0,
      actionLabel: 'Inspect Plans',
      actionTab: 'guardrails' as TabKey
    },
    {
      title: 'Burn-Rate Drift Anomalies',
      value: `${overview.burnRateAnomaliesCount} Active Alerts`,
      subtitle: '> 20% deviation from 7-day baseline',
      highlight: overview.burnRateAnomaliesCount > 0,
      actionLabel: 'Check Anomalies',
      actionTab: 'attribution' as TabKey
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Cloud Financial Posture
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Real-time unit cost tracking, continuous waste detection, and pre-deployment infrastructure guardrails.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        {cards.map((c, i) => (
          <div
            key={i}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                {c.title}
              </span>
              <div
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  margin: '8px 0 4px 0'
                }}
              >
                {c.value}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.subtitle}</p>
            </div>

            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => onNavigate(c.actionTab)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-cypress)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{c.actionLabel}</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cloud Architecture Telemetry Note */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            FinOps Operational Guardrail Standards
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
            Last sync: {new Date(overview.syncedAt).toLocaleTimeString()}
          </span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          aws-finos operates as an active cloud governance gatekeeper. Rather than simply reviewing retrospective monthly
          invoices, it ties directly into infrastructure provisioning workflows: tracking cost per unit metric,
          flagging idle zombie resources before billing cycles roll over, and stopping unbudgeted infrastructure in pull requests.
        </p>
      </div>
    </div>
  );
};
