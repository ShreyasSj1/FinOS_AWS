import React, { useState, useEffect } from 'react';
import { getUnitMetrics, createUnitMetric, UnitMetric } from '../api.js';

export const UnitEconomicsPanel: React.FC = () => {
  const [metrics, setMetrics] = useState<UnitMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form inputs
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [currentCost, setCurrentCost] = useState('');
  const [targetCost, setTargetCost] = useState('');
  const [monthlyVolume, setMonthlyVolume] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const data = await getUnitMetrics();
      setMetrics(data.metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit || !currentCost) return;
    setSubmitting(true);
    try {
      await createUnitMetric({
        name,
        unit,
        currentCost: parseFloat(currentCost),
        targetCost: targetCost ? parseFloat(targetCost) : undefined,
        monthlyVolume: monthlyVolume ? parseInt(monthlyVolume, 10) : undefined
      });
      setName('');
      setUnit('');
      setCurrentCost('');
      setTargetCost('');
      setMonthlyVolume('');
      setShowAddForm(false);
      await loadMetrics();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Cloud Unit Economics
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Tie AWS infrastructure burn to actual business output: requests, active tenants, and data volume.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: 'var(--accent-cypress)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showAddForm ? 'Cancel' : '+ Add Unit Metric'}
        </button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAdd}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '20px',
            marginBottom: '24px'
          }}
        >
          <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
            Define New Unit Economic Metric
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Metric Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Cost per Active Session"
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Unit Dimension
              </label>
              <input
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. USD / session"
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Current Cost ($)
              </label>
              <input
                type="number"
                step="0.001"
                value={currentCost}
                onChange={e => setCurrentCost(e.target.value)}
                placeholder="0.045"
                required
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Target Cost ($)
              </label>
              <input
                type="number"
                step="0.001"
                value={targetCost}
                onChange={e => setTargetCost(e.target.value)}
                placeholder="0.035"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Monthly Volume
              </label>
              <input
                type="number"
                value={monthlyVolume}
                onChange={e => setMonthlyVolume(e.target.value)}
                placeholder="50000"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-cypress)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '12px'
            }}
          >
            {submitting ? 'Registering...' : 'Register Metric'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>Loading unit economics data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {metrics.map(m => {
            const isImproving = m.trend === 'improving';
            const isDegrading = m.trend === 'degrading';
            const statusColor = isImproving ? 'var(--status-ok)' : isDegrading ? 'var(--status-warn)' : 'var(--text-secondary)';
            const statusBg = isImproving ? 'var(--status-ok-bg)' : isDegrading ? 'var(--status-warn-bg)' : 'var(--bg-muted)';

            return (
              <div
                key={m.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {m.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Measured in: <span style={{ fontFamily: 'var(--font-mono)' }}>{m.unit}</span> &middot; Monthly volume: {m.monthlyVolume.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      ${m.currentCost < 1 ? m.currentCost.toFixed(3) : m.currentCost.toFixed(2)}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: statusBg,
                        color: statusColor,
                        marginTop: '4px'
                      }}
                    >
                      {m.trend.toUpperCase()} (Target: ${m.targetCost})
                    </span>
                  </div>
                </div>

                {/* 5-Month Trend Mini Sparkline */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Rolling 5-Month Unit Cost Trajectory:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '40px' }}>
                    {m.history.map((h, idx) => {
                      // Normalize bar height
                      const maxVal = Math.max(...m.history.map(x => x.value)) * 1.1;
                      const heightPercent = Math.max(15, (h.value / maxVal) * 100);
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div
                            style={{
                              width: '100%',
                              height: `${heightPercent}%`,
                              backgroundColor: idx === m.history.length - 1 ? 'var(--accent-cypress)' : 'var(--border-strong)',
                              borderRadius: '2px',
                              transition: 'height 150ms ease'
                            }}
                            title={`${h.date}: $${h.value}`}
                          />
                          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                            {h.date.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
