export interface OverviewData {
  totalMonthlySpend: number;
  totalRecoverableWaste: number;
  activeWasteCount: number;
  blockedPlansCount: number;
  burnRateAnomaliesCount: number;
  cloudAccount: string;
  syncedAt: string;
}

export interface UnitMetric {
  id: string;
  name: string;
  unit: string;
  currentCost: number;
  previousCost: number;
  targetCost: number;
  monthlyVolume: number;
  trend: 'improving' | 'degrading' | 'stable';
  history: { date: string; value: number }[];
}

export interface WasteItem {
  id: string;
  resourceId: string;
  resourceType: 'ebs_volume' | 'nat_gateway' | 'elastic_ip' | 'idle_rds';
  service: string;
  region: string;
  environment: string;
  monthlyWasteCost: number;
  detectionReason: string;
  daysIdle: number;
  remediationCli: string;
  remediationTerraform: string;
  status: 'active' | 'triaged' | 'ignored';
}

export interface GuardrailPolicy {
  id: string;
  code: string;
  name: string;
  severity: 'error' | 'warning' | 'info';
  description: string;
  enforced: boolean;
}

export interface GuardrailEvaluation {
  id: string;
  planName: string;
  author: string;
  targetEnv: string;
  estimatedMonthlyDelta: number;
  policyViolations: {
    policyCode: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    resource: string;
  }[];
  verdict: 'passed' | 'warning' | 'blocked';
  evaluatedAt: string;
}

export interface WorkloadCostRow {
  service: string;
  category: string;
  environment: 'production' | 'staging' | 'development';
  ownerTeam: string;
  monthlySpend: number;
  dailyBurnRate: number;
  burnRateBaseline: number;
  isAnomaly: boolean;
  anomalyPercent?: number;
}

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export async function getOverview(): Promise<OverviewData> {
  const res = await fetch(`${API_BASE}/overview`);
  if (!res.ok) throw new Error('Failed to fetch overview');
  return res.json();
}

export async function getUnitMetrics(): Promise<{ metrics: UnitMetric[] }> {
  const res = await fetch(`${API_BASE}/unit-economics`);
  if (!res.ok) throw new Error('Failed to fetch unit metrics');
  return res.json();
}

export async function createUnitMetric(payload: {
  name: string;
  unit: string;
  currentCost: number;
  targetCost?: number;
  monthlyVolume?: number;
}): Promise<UnitMetric> {
  const res = await fetch(`${API_BASE}/unit-economics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create metric');
  return res.json();
}

export async function getWasteItems(): Promise<{ totalWaste: number; items: WasteItem[] }> {
  const res = await fetch(`${API_BASE}/waste`);
  if (!res.ok) throw new Error('Failed to fetch waste items');
  return res.json();
}

export async function triageWaste(id: string, action: 'triaged' | 'ignored'): Promise<WasteItem> {
  const res = await fetch(`${API_BASE}/waste/${id}/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  if (!res.ok) throw new Error('Failed to triage waste item');
  const data = await res.json();
  return data.item;
}

export async function getGuardrailData(): Promise<{
  policies: GuardrailPolicy[];
  evaluations: GuardrailEvaluation[];
}> {
  const [pRes, eRes] = await Promise.all([
    fetch(`${API_BASE}/guardrails/policies`),
    fetch(`${API_BASE}/guardrails/evaluations`)
  ]);
  if (!pRes.ok || !eRes.ok) throw new Error('Failed to fetch guardrail data');
  const policies = (await pRes.json()).policies;
  const evaluations = (await eRes.json()).evaluations;
  return { policies, evaluations };
}

export async function evaluatePlan(payload: {
  planName: string;
  author: string;
  targetEnv: string;
  estimatedMonthlyDelta: number;
  resourcesJson: string;
}): Promise<GuardrailEvaluation> {
  const res = await fetch(`${API_BASE}/guardrails/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to evaluate plan');
  return res.json();
}

export async function getWorkloadAttribution(): Promise<{ rows: WorkloadCostRow[] }> {
  const res = await fetch(`${API_BASE}/workload-attribution`);
  if (!res.ok) throw new Error('Failed to fetch workload attribution');
  return res.json();
}
