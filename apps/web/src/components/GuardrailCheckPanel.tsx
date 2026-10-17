import React, { useState, useEffect } from 'react';
import { getGuardrailData, evaluatePlan, GuardrailPolicy, GuardrailEvaluation } from '../api.js';

export const GuardrailCheckPanel: React.FC = () => {
  const [policies, setPolicies] = useState<GuardrailPolicy[]>([]);
  const [evaluations, setEvaluations] = useState<GuardrailEvaluation[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [planName, setPlanName] = useState('PR #430: Add ElastiCache Redis Cluster');
  const [author, setAuthor] = useState('devops.lead');
  const [targetEnv, setTargetEnv] = useState('production');
  const [estimatedMonthlyDelta, setEstimatedMonthlyDelta] = useState('110.00');
  const [resourcesJson, setResourcesJson] = useState(
    'resource "aws_elasticache_cluster" "session_cache" {\n  cluster_id = "session-cache"\n  engine = "redis"\n  node_type = "cache.r6g.large"\n  tags = {\n    CostCenter = "Platform"\n    Environment = "production"\n  }\n}'
  );
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getGuardrailData();
      setPolicies(data.policies);
      setEvaluations(data.evaluations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    try {
      const result = await evaluatePlan({
        planName,
        author,
        targetEnv,
        estimatedMonthlyDelta: parseFloat(estimatedMonthlyDelta) || 0,
        resourcesJson
      });
      setEvaluations(prev => [result, ...prev]);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  const loadSample = (type: 'compliant' | 'missing-tags' | 'gpu-unapproved') => {
    if (type === 'compliant') {
      setPlanName('PR #431: Downsize idle test workers');
      setEstimatedMonthlyDelta('-35.00');
      setResourcesJson(
        'resource "aws_instance" "worker" {\n  instance_type = "t4g.small"\n  tags = {\n    CostCenter = "Engineering"\n    Environment = "staging"\n  }\n}'
      );
    } else if (type === 'missing-tags') {
      setPlanName('PR #432: Add S3 data archive bucket');
      setEstimatedMonthlyDelta('45.00');
      setResourcesJson(
        'resource "aws_s3_bucket" "archive" {\n  bucket = "prod-data-archive-2026"\n  # Missing required CostCenter tag\n}'
      );
    } else if (type === 'gpu-unapproved') {
      setPlanName('PR #433: Experimental ML training instance');
      setEstimatedMonthlyDelta('280.00');
      setResourcesJson(
        'resource "aws_instance" "gpu_runner" {\n  instance_type = "g5.2xlarge"\n  tags = {\n    CostCenter = "AI-Research"\n  }\n}'
      );
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          Pre-Deployment IaC Guardrails
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Enforce financial boundaries in CI/CD before Terraform or CloudFormation code merges into production.
        </p>
      </div>

      {/* Active Organization Policies */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Enforced Cost Policies
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
          {policies.map(p => (
            <div
              key={p.id}
              style={{
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '4px',
                padding: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <code style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  {p.code}
                </code>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor:
                      p.severity === 'error' ? 'var(--status-error-bg)' : 'var(--status-warn-bg)',
                    color: p.severity === 'error' ? 'var(--status-error)' : 'var(--status-warn)'
                  }}
                >
                  {p.severity}
                </span>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                {p.name}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{p.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Simulator / Evaluator Form */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Evaluate Infrastructure Plan
          </h2>
          <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-secondary)', alignSelf: 'center' }}>Test Scenarios:</span>
            <button
              type="button"
              onClick={() => loadSample('compliant')}
              style={{ padding: '4px 8px', background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer' }}
            >
              Compliant
            </button>
            <button
              type="button"
              onClick={() => loadSample('missing-tags')}
              style={{ padding: '4px 8px', background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer' }}
            >
              Missing Tags
            </button>
            <button
              type="button"
              onClick={() => loadSample('gpu-unapproved')}
              style={{ padding: '4px 8px', background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer' }}
            >
              GPU Spike
            </button>
          </div>
        </div>

        <form onSubmit={handleEvaluate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Plan / Pull Request Title
              </label>
              <input
                type="text"
                value={planName}
                onChange={e => setPlanName(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={e => setAuthor(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Target Environment
              </label>
              <select
                value={targetEnv}
                onChange={e => setTargetEnv(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}
              >
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Est. Monthly Delta ($/mo)
              </label>
              <input
                type="number"
                step="0.01"
                value={estimatedMonthlyDelta}
                onChange={e => setEstimatedMonthlyDelta(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-canvas)' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Terraform / CloudFormation Resource Definition
            </label>
            <textarea
              rows={4}
              value={resourcesJson}
              onChange={e => setResourcesJson(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={evaluating}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--accent-cypress)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              fontSize: '12px',
              cursor: evaluating ? 'not-allowed' : 'pointer'
            }}
          >
            {evaluating ? 'Evaluating Guardrails...' : 'Evaluate Plan'}
          </button>
        </form>
      </div>

      {/* Evaluation Results History */}
      <div>
        <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
          Recent Plan Evaluation History
        </h2>

        {loading ? (
          <div style={{ color: 'var(--text-secondary)' }}>Loading evaluation history...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {evaluations.map(ev => {
              const isBlocked = ev.verdict === 'blocked';
              const isWarning = ev.verdict === 'warning';
              const verdictBg = isBlocked
                ? 'var(--status-error-bg)'
                : isWarning
                ? 'var(--status-warn-bg)'
                : 'var(--status-ok-bg)';
              const verdictColor = isBlocked
                ? 'var(--status-error)'
                : isWarning
                ? 'var(--status-warn)'
                : 'var(--status-ok)';

              return (
                <div
                  key={ev.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {ev.planName}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor: verdictBg,
                            color: verdictColor
                          }}
                        >
                          {ev.verdict}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        By: <span style={{ fontFamily: 'var(--font-mono)' }}>{ev.author}</span> &middot; Env: {ev.targetEnv} &middot; Evaluated: {ev.evaluatedAt}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600 }}>
                      <span style={{ color: ev.estimatedMonthlyDelta > 0 ? 'var(--text-primary)' : 'var(--status-ok)' }}>
                        {ev.estimatedMonthlyDelta > 0 ? `+$${ev.estimatedMonthlyDelta.toFixed(2)}` : `-$${Math.abs(ev.estimatedMonthlyDelta).toFixed(2)}`} / mo
                      </span>
                    </div>
                  </div>

                  {ev.policyViolations.length > 0 ? (
                    <div style={{ marginTop: '12px', backgroundColor: 'var(--bg-canvas)', padding: '10px', borderRadius: '4px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase' }}>
                        Policy Violations ({ev.policyViolations.length}):
                      </div>
                      {ev.policyViolations.map((v, idx) => (
                        <div key={idx} style={{ fontSize: '12px', color: 'var(--status-error)', marginBottom: '4px' }}>
                          &bull; <strong>{v.policyCode}:</strong> {v.message}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--status-ok)', marginTop: '8px' }}>
                      &check; All cost governance policies satisfied. Ready for deployment.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
