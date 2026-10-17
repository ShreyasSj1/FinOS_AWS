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

export const initialUnitMetrics: UnitMetric[] = [
  {
    id: 'um-1',
    name: 'Cost per 10k Ingested API Requests',
    unit: 'USD / 10k reqs',
    currentCost: 0.42,
    previousCost: 0.58,
    targetCost: 0.40,
    monthlyVolume: 18450000,
    trend: 'improving',
    history: [
      { date: '2026-06', value: 0.65 },
      { date: '2026-07', value: 0.61 },
      { date: '2026-08', value: 0.58 },
      { date: '2026-09', value: 0.51 },
      { date: '2026-10', value: 0.42 }
    ]
  },
  {
    id: 'um-2',
    name: 'Cost per Active Provisioned Tenant',
    unit: 'USD / tenant / month',
    currentCost: 14.80,
    previousCost: 15.20,
    targetCost: 12.00,
    monthlyVolume: 420,
    trend: 'improving',
    history: [
      { date: '2026-06', value: 17.50 },
      { date: '2026-07', value: 16.90 },
      { date: '2026-08', value: 15.20 },
      { date: '2026-09', value: 15.00 },
      { date: '2026-10', value: 14.80 }
    ]
  },
  {
    id: 'um-3',
    name: 'Cost per GB Processed (ETL & Pipelines)',
    unit: 'USD / GB',
    currentCost: 0.038,
    previousCost: 0.032,
    targetCost: 0.030,
    monthlyVolume: 125000,
    trend: 'degrading',
    history: [
      { date: '2026-06', value: 0.031 },
      { date: '2026-07', value: 0.031 },
      { date: '2026-08', value: 0.032 },
      { date: '2026-09', value: 0.034 },
      { date: '2026-10', value: 0.038 }
    ]
  }
];

export const initialWasteItems: WasteItem[] = [
  {
    id: 'w-1',
    resourceId: 'vol-0a12e8b99c43d7fa1',
    resourceType: 'ebs_volume',
    service: 'Amazon EC2 EBS',
    region: 'us-east-1',
    environment: 'staging',
    monthlyWasteCost: 48.00,
    detectionReason: 'Volume state is available (unattached to any EC2 instance) for 28 days',
    daysIdle: 28,
    remediationCli: 'aws ec2 delete-volume --volume-id vol-0a12e8b99c43d7fa1 --region us-east-1',
    remediationTerraform: '# Remove resource "aws_ebs_volume" "staging_temp_disk" from main.tf',
    status: 'active'
  },
  {
    id: 'w-2',
    resourceId: 'nat-08f33129ba048cd3b',
    resourceType: 'nat_gateway',
    service: 'Amazon VPC',
    region: 'us-west-2',
    environment: 'development',
    monthlyWasteCost: 72.00,
    detectionReason: 'NAT Gateway processed < 45 MB total egress bandwidth across the last 14 days',
    daysIdle: 14,
    remediationCli: 'aws ec2 delete-nat-gateway --nat-gateway-id nat-08f33129ba048cd3b --region us-west-2',
    remediationTerraform: '# Remove "aws_nat_gateway" "dev_isolated_nat" or route via VPC endpoint',
    status: 'active'
  },
  {
    id: 'w-3',
    resourceId: 'eipalloc-017e29cf4710',
    resourceType: 'elastic_ip',
    service: 'Amazon VPC',
    region: 'us-east-1',
    environment: 'development',
    monthlyWasteCost: 10.80,
    detectionReason: 'Allocated public IPv4 address with no associated network interface or instance',
    daysIdle: 35,
    remediationCli: 'aws ec2 release-address --allocation-id eipalloc-017e29cf4710 --region us-east-1',
    remediationTerraform: '# Remove "aws_eip" "dev_bastion_ip" from network.tf',
    status: 'active'
  },
  {
    id: 'w-4',
    resourceId: 'db-staging-analytics-backup-test',
    resourceType: 'idle_rds',
    service: 'Amazon RDS (PostgreSQL)',
    region: 'us-east-1',
    environment: 'staging',
    monthlyWasteCost: 81.00,
    detectionReason: 'Zero database client connections recorded in CloudWatch metrics for 21 days',
    daysIdle: 21,
    remediationCli: 'aws rds stop-db-instance --db-instance-identifier db-staging-analytics-backup-test --region us-east-1',
    remediationTerraform: '# Set auto-stop policy or delete test replica instance',
    status: 'active'
  }
];

export const initialGuardrailPolicies: GuardrailPolicy[] = [
  {
    id: 'pol-1',
    code: 'MAX_MONTHLY_DELTA_ALERT',
    name: 'Maximum PR Monthly Delta Alert',
    severity: 'warning',
    description: 'Warns when an individual Terraform change increases forecasted monthly cloud spend by more than $150.00',
    enforced: true
  },
  {
    id: 'pol-2',
    code: 'REQUIRE_TAG_COST_CENTER',
    name: 'Mandatory Allocation Tags',
    severity: 'error',
    description: 'Requires CostCenter, Environment, and Owner tags on all newly declared billable AWS resources',
    enforced: true
  },
  {
    id: 'pol-3',
    code: 'PROHIBIT_UNAPPROVED_GPU_INSTANCES',
    name: 'Restricted Accelerated Compute',
    severity: 'error',
    description: 'Prohibits p3, p4, and g5 instance classes unless tagged with ApprovedArchitectureTicket',
    enforced: true
  },
  {
    id: 'pol-4',
    code: 'SINGLE_NAT_IN_NON_PROD',
    name: 'Single NAT Gateway in Non-Production',
    severity: 'warning',
    description: 'Restricts staging and dev VPCs to at most 1 NAT Gateway to prevent redundant idle gateway charges',
    enforced: true
  }
];

export const initialGuardrailEvaluations: GuardrailEvaluation[] = [
  {
    id: 'eval-101',
    planName: 'PR #418: Add read replica for reporting workloads',
    author: 'sarah.engineer',
    targetEnv: 'staging',
    estimatedMonthlyDelta: 85.50,
    policyViolations: [
      {
        policyCode: 'REQUIRE_TAG_COST_CENTER',
        severity: 'error',
        message: 'Resource aws_db_instance.reporting_replica is missing tag: CostCenter',
        resource: 'aws_db_instance.reporting_replica'
      }
    ],
    verdict: 'blocked',
    evaluatedAt: '2026-10-16 17:30 UTC'
  },
  {
    id: 'eval-102',
    planName: 'PR #422: Migrate Redis cluster to Graviton 3',
    author: 'alex.devops',
    targetEnv: 'production',
    estimatedMonthlyDelta: -42.00,
    policyViolations: [],
    verdict: 'passed',
    evaluatedAt: '2026-10-17 07:15 UTC'
  }
];

export const initialWorkloadSpend: WorkloadCostRow[] = [
  {
    service: 'Amazon EC2',
    category: 'Compute',
    environment: 'production',
    ownerTeam: 'platform-core',
    monthlySpend: 2450.00,
    dailyBurnRate: 81.60,
    burnRateBaseline: 80.00,
    isAnomaly: false
  },
  {
    service: 'Amazon RDS',
    category: 'Database',
    environment: 'production',
    ownerTeam: 'core-api',
    monthlySpend: 1820.00,
    dailyBurnRate: 60.66,
    burnRateBaseline: 59.50,
    isAnomaly: false
  },
  {
    service: 'Amazon VPC (NAT Gateway)',
    category: 'Networking',
    environment: 'development',
    ownerTeam: 'platform-core',
    monthlySpend: 216.00,
    dailyBurnRate: 7.20,
    burnRateBaseline: 3.50,
    isAnomaly: true,
    anomalyPercent: 105.7
  },
  {
    service: 'Amazon S3',
    category: 'Storage',
    environment: 'production',
    ownerTeam: 'data-analytics',
    monthlySpend: 640.00,
    dailyBurnRate: 21.33,
    burnRateBaseline: 20.80,
    isAnomaly: false
  },
  {
    service: 'AWS Lambda',
    category: 'Serverless',
    environment: 'production',
    ownerTeam: 'core-api',
    monthlySpend: 310.00,
    dailyBurnRate: 10.33,
    burnRateBaseline: 9.80,
    isAnomaly: false
  },
  {
    service: 'Amazon CloudWatch',
    category: 'Observability',
    environment: 'staging',
    ownerTeam: 'platform-core',
    monthlySpend: 480.00,
    dailyBurnRate: 16.00,
    burnRateBaseline: 8.50,
    isAnomaly: true,
    anomalyPercent: 88.2
  }
];
