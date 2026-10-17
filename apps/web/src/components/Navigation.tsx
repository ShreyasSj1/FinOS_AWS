import React from 'react';

export type TabKey = 'overview' | 'unit-economics' | 'waste-radar' | 'guardrails' | 'attribution';

interface NavigationProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  wasteBadgeCount?: number;
  blockedBadgeCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  wasteBadgeCount = 0,
  blockedBadgeCount = 0
}) => {
  const tabs: { key: TabKey; label: string; badge?: number; badgeType?: 'warn' | 'error' }[] = [
    { key: 'overview', label: 'Cloud Overview' },
    { key: 'unit-economics', label: 'Unit Economics' },
    { key: 'waste-radar', label: 'Waste Radar', badge: wasteBadgeCount, badgeType: 'warn' },
    { key: 'guardrails', label: 'IaC Guardrails', badge: blockedBadgeCount, badgeType: 'error' },
    { key: 'attribution', label: 'Workload Attribution' }
  ];

  return (
    <nav
      style={{
        display: 'flex',
        gap: '4px',
        padding: '0 24px',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        overflowX: 'auto'
      }}
      aria-label="FinOps Workbench Navigation"
    >
      {tabs.map(tab => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            style={{
              padding: '12px 14px',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--accent-cypress)' : 'var(--text-secondary)',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--accent-cypress)' : '2px solid transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap',
              transition: 'color 150ms ease, border-color 150ms ease'
            }}
          >
            <span>{tab.label}</span>
            {Boolean(tab.badge && tab.badge > 0) && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor:
                    tab.badgeType === 'error' ? 'var(--status-error-bg)' : 'var(--status-warn-bg)',
                  color: tab.badgeType === 'error' ? 'var(--status-error)' : 'var(--status-warn)'
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
