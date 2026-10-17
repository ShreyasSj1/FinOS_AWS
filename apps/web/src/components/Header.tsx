import React from 'react';
import { OverviewData } from '../api.js';

interface HeaderProps {
  overview: OverviewData | null;
  onRefresh: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ overview, onRefresh, loading }) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 20
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)'
            }}
          >
            aws-finos
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--accent-cypress)',
              backgroundColor: 'var(--accent-cypress-subtle)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}
          >
            Cloud Governance
          </span>
        </div>

        <span style={{ color: 'var(--border-strong)', fontSize: '12px' }}>|</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>Account:</span>
          <code
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              backgroundColor: 'var(--bg-muted)',
              padding: '2px 6px',
              borderRadius: '4px',
              color: 'var(--text-primary)'
            }}
          >
            {overview?.cloudAccount || 'aws-production-root'}
          </code>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-ok)',
              display: 'inline-block'
            }}
          />
          <span>Telemetry Active</span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            transition: 'background-color 150ms ease, border-color 150ms ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
          }}
        >
          {loading ? 'Refreshing...' : 'Sync Telemetry'}
        </button>
      </div>
    </header>
  );
};
