import React, { useState, useEffect } from 'react';
import { getWorkloadAttribution, WorkloadCostRow } from '../api.js';

export const AttributionPanel: React.FC = () => {
  const [rows, setRows] = useState<WorkloadCostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getWorkloadAttribution();
      setRows(data.rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = rows.filter(r => {
    if (selectedEnv !== 'all' && r.environment !== selectedEnv) return false;
    if (showAnomaliesOnly && !r.isAnomaly) return false;
    return true;
  });

  const totalFilteredSpend = filteredRows.reduce((acc, r) => acc + r.monthlySpend, 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Workload Cost Attribution & Drift
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Multi-dimensional spend attribution mapped to infrastructure owners with real-time burn-rate drift detection.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Filtered Monthly Total
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            ${totalFilteredSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['all', 'production', 'staging', 'development'] as const).map(env => (
            <button
              key={env}
              onClick={() => setSelectedEnv(env)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: selectedEnv === env ? 600 : 400,
                backgroundColor: selectedEnv === env ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: selectedEnv === env ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {env}
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showAnomaliesOnly}
            onChange={e => setShowAnomaliesOnly(e.target.checked)}
          />
          <span style={{ color: 'var(--status-warn)', fontWeight: 600 }}>Show Drift Anomalies Only</span>
        </label>
      </div>

      {/* Attribution Table */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          overflow: 'hidden'
        }}
      >
        {loading ? (
          <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Loading workload attribution...</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Service / Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Env</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Owner Team</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'right' }}>Daily Burn</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'right' }}>Monthly Spend</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Drift Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background-color 150ms ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.service}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{row.category}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--bg-muted)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {row.environment}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {row.ownerTeam}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                    ${row.dailyBurnRate.toFixed(2)}/day
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    ${row.monthlySpend.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {row.isAnomaly ? (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--status-warn-bg)',
                          color: 'var(--status-warn)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        ANOMALY (+{row.anomalyPercent?.toFixed(1)}%)
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: 'var(--status-ok)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Nominal (Baseline: ${row.burnRateBaseline.toFixed(2)})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
