import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { Navigation, TabKey } from './components/Navigation.js';
import { OverviewSummary } from './components/OverviewSummary.js';
import { UnitEconomicsPanel } from './components/UnitEconomicsPanel.js';
import { WasteRadarPanel } from './components/WasteRadarPanel.js';
import { GuardrailCheckPanel } from './components/GuardrailCheckPanel.js';
import { AttributionPanel } from './components/AttributionPanel.js';
import { getOverview, OverviewData } from './api.js';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabKey>('overview');
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const data = await getOverview();
      setOverview(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header overview={overview} onRefresh={loadOverview} loading={loading} />
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        wasteBadgeCount={overview?.activeWasteCount}
        blockedBadgeCount={overview?.blockedPlansCount}
      />

      <main style={{ flex: 1, paddingBottom: '48px' }}>
        {currentTab === 'overview' && (
          <OverviewSummary overview={overview} onNavigate={setCurrentTab} />
        )}
        {currentTab === 'unit-economics' && <UnitEconomicsPanel />}
        {currentTab === 'waste-radar' && <WasteRadarPanel />}
        {currentTab === 'guardrails' && <GuardrailCheckPanel />}
        {currentTab === 'attribution' && <AttributionPanel />}
      </main>

      <footer
        style={{
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        aws-finos &middot; Cloud Financial Governance & Unit Economics Platform &middot; Clean Minimal Light Architecture
      </footer>
    </div>
  );
};
