import React, { useState, useEffect } from 'react';
import { getWasteItems, triageWaste, WasteItem } from '../api.js';

export const WasteRadarPanel: React.FC = () => {
  const [items, setItems] = useState<WasteItem[]>([]);
  const [totalWaste, setTotalWaste] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<WasteItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'triaged'>('active');
  const [actionLoading, setActionLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadWaste();
  }, []);

  const loadWaste = async () => {
    setLoading(true);
    try {
      const data = await getWasteItems();
      setItems(data.items);
      setTotalWaste(data.totalWaste);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriage = async (action: 'triaged' | 'ignored') => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const updated = await triageWaste(selectedItem.id, action);
      setItems(prev => prev.map(item => (item.id === updated.id ? updated : item)));
      setSelectedItem(updated);
      await loadWaste();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const filteredItems = items.filter(item => {
    if (filter === 'active') return item.status === 'active';
    if (filter === 'triaged') return item.status === 'triaged' || item.status === 'ignored';
    return true;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '24px' }}>
      <div style={{ flex: selectedItem ? '1 1 60%' : '1 1 100%', transition: 'flex 200ms ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Cloud Waste Radar
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Autonomous detection of abandoned EBS volumes, idle NAT gateways, and unassociated Elastic IPs.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Monthly Recoverable
            </span>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-warn)' }}>
              ${totalWaste.toFixed(2)}/mo
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {(['active', 'triaged', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: filter === tab ? 600 : 400,
                backgroundColor: filter === tab ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: filter === tab ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'active' ? 'Active Waste' : tab === 'triaged' ? 'Resolved / Triaged' : 'All Resources'}
            </button>
          ))}
        </div>

        {/* Waste Table */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>Scanning AWS account footprint...</div>
          ) : filteredItems.length === 0 ? (
            <div style={{ padding: '32px', color: 'var(--text-secondary)' }}>No waste items found in this view.</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Resource</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Service / Region</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Env</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Idle</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'right' }}>Waste Cost</th>
                  <th style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--accent-cypress-subtle)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 150ms ease'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <code style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-primary)' }}>
                          {item.resourceId}
                        </code>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {item.detectionReason}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div>{item.service}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.region}</div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 500,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--bg-muted)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {item.environment}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                        {item.daysIdle} days
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                        ${item.monthlyWasteCost.toFixed(2)}/mo
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              item.status === 'active'
                                ? 'var(--status-warn-bg)'
                                : 'var(--status-ok-bg)',
                            color:
                              item.status === 'active'
                                ? 'var(--status-warn)'
                                : 'var(--status-ok)'
                          }}
                        >
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out Triage Inspector Drawer */}
      {selectedItem && (
        <aside
          style={{
            flex: '1 1 40%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '20px',
            alignSelf: 'flex-start',
            position: 'sticky',
            top: '80px',
            maxHeight: 'calc(100vh - 100px)',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Remediation Action Inspector
            </h2>
            <button
              onClick={() => setSelectedItem(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-secondary)' }}
            >
              &times;
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Resource ID</div>
            <code style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
              {selectedItem.resourceId}
            </code>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Detection Cause</div>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '4px' }}>
              {selectedItem.detectionReason}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>AWS CLI Fix</span>
              <button
                onClick={() => copyToClipboard(selectedItem.remediationCli, 'cli')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cypress)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                {copyFeedback === 'cli' ? 'Copied' : 'Copy Command'}
              </button>
            </div>
            <pre
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}
            >
              {selectedItem.remediationCli}
            </pre>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Terraform Note</span>
              <button
                onClick={() => copyToClipboard(selectedItem.remediationTerraform, 'tf')}
                style={{ background: 'none', border: 'none', color: 'var(--accent-cypress)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                {copyFeedback === 'tf' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '10px',
                fontSize: '11px',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap'
              }}
            >
              {selectedItem.remediationTerraform}
            </pre>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleTriage('triaged')}
              disabled={actionLoading || selectedItem.status === 'triaged'}
              style={{
                flex: 1,
                padding: '8px 12px',
                backgroundColor: 'var(--accent-cypress)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '12px',
                cursor: selectedItem.status === 'triaged' ? 'default' : 'pointer',
                opacity: selectedItem.status === 'triaged' ? 0.6 : 1
              }}
            >
              {selectedItem.status === 'triaged' ? 'Resolved' : 'Mark Remediated'}
            </button>
            <button
              onClick={() => handleTriage('ignored')}
              disabled={actionLoading}
              style={{
                padding: '8px 12px',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Ignore
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};
