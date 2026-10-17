import { Router, Request, Response } from 'express';
import {
  initialUnitMetrics,
  initialWasteItems,
  initialGuardrailPolicies,
  initialGuardrailEvaluations,
  initialWorkloadSpend,
  UnitMetric,
  WasteItem,
  GuardrailPolicy,
  GuardrailEvaluation,
  WorkloadCostRow
} from './mockData.js';

export const apiRouter = Router();

// In-memory state initialized from mock data
let unitMetrics: UnitMetric[] = [...initialUnitMetrics];
let wasteItems: WasteItem[] = [...initialWasteItems];
let guardrailPolicies: GuardrailPolicy[] = [...initialGuardrailPolicies];
let guardrailEvaluations: GuardrailEvaluation[] = [...initialGuardrailEvaluations];
let workloadSpend: WorkloadCostRow[] = [...initialWorkloadSpend];

// 1. Overview summary
apiRouter.get('/overview', (req: Request, res: Response) => {
  const totalMonthlySpend = workloadSpend.reduce((acc, row) => acc + row.monthlySpend, 0);
  const activeWaste = wasteItems.filter(item => item.status === 'active');
  const totalRecoverableWaste = activeWaste.reduce((acc, item) => acc + item.monthlyWasteCost, 0);
  const blockedPlans = guardrailEvaluations.filter(e => e.verdict === 'blocked').length;
  const anomaliesCount = workloadSpend.filter(r => r.isAnomaly).length;

  res.json({
    totalMonthlySpend,
    totalRecoverableWaste,
    activeWasteCount: activeWaste.length,
    blockedPlansCount: blockedPlans,
    burnRateAnomaliesCount: anomaliesCount,
    cloudAccount: 'aws-production-root (8192-3341-0021)',
    syncedAt: new Date().toISOString()
  });
});

// 2. Unit Economics
apiRouter.get('/unit-economics', (req: Request, res: Response) => {
  res.json({ metrics: unitMetrics });
});

apiRouter.post('/unit-economics', (req: Request, res: Response) => {
  const { name, unit, currentCost, targetCost, monthlyVolume } = req.body;
  if (!name || !unit || typeof currentCost !== 'number') {
    res.status(400).json({ error: 'Name, unit, and currentCost are required' });
    return;
  }

  const newMetric: UnitMetric = {
    id: `um-${Date.now()}`,
    name,
    unit,
    currentCost,
    previousCost: currentCost,
    targetCost: targetCost ?? currentCost * 0.9,
    monthlyVolume: monthlyVolume ?? 1000,
    trend: 'stable',
    history: [{ date: new Date().toISOString().slice(0, 7), value: currentCost }]
  };

  unitMetrics.push(newMetric);
  res.status(201).json(newMetric);
});

// 3. Waste Radar
apiRouter.get('/waste', (req: Request, res: Response) => {
  const activeItems = wasteItems.filter(w => w.status === 'active');
  const totalWaste = activeItems.reduce((acc, w) => acc + w.monthlyWasteCost, 0);
  res.json({
    totalWaste,
    items: wasteItems
  });
});

apiRouter.post('/waste/:id/triage', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // 'triaged' | 'ignored' | 'active'

  const itemIndex = wasteItems.findIndex(w => w.id === id);
  if (itemIndex === -1) {
    res.status(404).json({ error: 'Waste item not found' });
    return;
  }

  wasteItems[itemIndex].status = action === 'ignored' ? 'ignored' : 'triaged';
  res.json({ message: 'Resource status updated', item: wasteItems[itemIndex] });
});

// 4. Guardrail Policies & Evaluations
apiRouter.get('/guardrails/policies', (req: Request, res: Response) => {
  res.json({ policies: guardrailPolicies });
});

apiRouter.get('/guardrails/evaluations', (req: Request, res: Response) => {
  res.json({ evaluations: guardrailEvaluations });
});

apiRouter.post('/guardrails/evaluate', (req: Request, res: Response) => {
  const { planName, author, targetEnv, estimatedMonthlyDelta, resourcesJson } = req.body;

  const delta = Number(estimatedMonthlyDelta) || 0;
  const violations: GuardrailEvaluation['policyViolations'] = [];

  // Policy 1: Max Delta Alert (> $150)
  if (delta > 150) {
    violations.push({
      policyCode: 'MAX_MONTHLY_DELTA_ALERT',
      severity: 'warning',
      message: `Plan delta of $${delta.toFixed(2)}/mo exceeds warning threshold of $150.00/mo`,
      resource: 'Infrastructure plan total'
    });
  }

  // Policy 2: Tags validation on mock resources input
  const rawInput = String(resourcesJson || '');
  if (rawInput && !rawInput.toLowerCase().includes('costcenter')) {
    violations.push({
      policyCode: 'REQUIRE_TAG_COST_CENTER',
      severity: 'error',
      message: 'Plan contains resources without mandatory CostCenter tag',
      resource: 'Resource definition payload'
    });
  }

  // Policy 3: GPU instance restriction
  if (rawInput.includes('p3.') || rawInput.includes('p4.') || rawInput.includes('g5.')) {
    violations.push({
      policyCode: 'PROHIBIT_UNAPPROVED_GPU_INSTANCES',
      severity: 'error',
      message: 'Accelerated computing instance class requires Architecture Board ticket sign-off',
      resource: 'EC2 instance block'
    });
  }

  const hasBlockingError = violations.some(v => v.severity === 'error');
  const verdict: GuardrailEvaluation['verdict'] = hasBlockingError
    ? 'blocked'
    : violations.length > 0
    ? 'warning'
    : 'passed';

  const evaluation: GuardrailEvaluation = {
    id: `eval-${Date.now()}`,
    planName: planName || 'Terraform Plan Check',
    author: author || 'deployer',
    targetEnv: targetEnv || 'production',
    estimatedMonthlyDelta: delta,
    policyViolations: violations,
    verdict,
    evaluatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
  };

  guardrailEvaluations.unshift(evaluation);
  res.status(201).json(evaluation);
});

// 5. Workload Attribution
apiRouter.get('/workload-attribution', (req: Request, res: Response) => {
  res.json({ rows: workloadSpend });
});
