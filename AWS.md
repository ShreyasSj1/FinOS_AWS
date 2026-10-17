# AWS Architecture, Services, and Viva/Interview Guide

This document explains the entire **aws-finos** project, every AWS service used, how it works in plain language, and all possible questions an evaluator, interviewer, or professor could ask.

---

## Part 1: Project Explanation and AWS Architecture

### 1. What is aws-finos in simple words?
Most companies receive an AWS bill at the end of the month and get shocked by how high it is. By then, it is too late because the money is already spent.

**aws-finos** is an automated Cloud Financial Operations (FinOps) and Governance platform. Instead of looking at past bills passively, it does three active things:
1. **Tracks Unit Economics:** It calculates how much each business action costs (for example: cost per 10,000 API requests, cost per active customer workspace, or cost per GB processed), rather than just looking at a raw total bill.
2. **Finds and Triages Cloud Waste:** It continuously looks for forgotten AWS resources that are costing money while doing nothing (such as detached hard drives, idle network gateways, and unused IP addresses).
3. **Acts as a Pre-Deployment Guardrail:** Before an engineer merges infrastructure code (like Terraform) into production, aws-finos checks the proposed cost increase and flags any rule violations (such as missing cost tags or expensive unapproved machines).

---

### 2. How the system works end to end

```text
User / Engineer in Browser
       |
       v
[Amazon CloudFront CDN]  --->  [Amazon S3 Bucket]
(Fast global delivery)         (Houses the React frontend files)
       |
       v (API Calls)
[Amazon API Gateway HTTP v2]
(Directs HTTP requests with low cost and latency)
       |
       v
[Backend API: AWS Lambda or Amazon EC2]
(Node.js + Express backend running FinOps business logic)
       |
  +----+----------------------------------+
  |                                       |
  v                                       v
[Amazon DynamoDB]                 [AWS Telemetry & Inspection]
(Stores policies and triage data) - Cost Explorer (Billing history)
                                  - CloudWatch (Resource utilization)
                                  - EC2 / EBS (Idle volume checks)
                                  - VPC (Idle NAT Gateway checks)
```

1. **Frontend Experience:** Built as a single-page application using React 19 and Vite. It has a warm, minimal light interface with zero clutter.
2. **Backend Engine:** Built using Node.js and Express in TypeScript. It processes unit economics calculations, inspects waste telemetry, and evaluates infrastructure plan diffs.
3. **Local and Live Modes:** For local development and demonstrations, it includes a realistic built-in mock telemetry dataset. In production on AWS, it connects to AWS APIs to inspect real resources.

---

### 3. Every AWS Service Used and Why

#### A. Services Used to Host and Run the App

| AWS Service | What it is | How aws-finos uses it | Why this was chosen |
|---|---|---|---|
| **Amazon S3** | Simple Storage Service (Object storage) | Hosts the compiled static frontend files (`index.html`, JavaScript, CSS). | Highly durable, zero server maintenance, and free under AWS Free Tier (5 GB storage). |
| **Amazon CloudFront** | Content Delivery Network (CDN) | Delivers the frontend globally from edge locations with HTTPS encryption. | Fast load times, protects S3, and provides 1 TB of free data transfer every month. |
| **Amazon EC2** | Elastic Compute Cloud (Virtual server in cloud) | Alternative hosting for running the Node.js backend API (or both frontend and backend together). | Included in the AWS Free Tier (750 hours/month of `t2.micro`), giving you a full 24/7 server for $0. |
| **AWS Lambda** | Serverless function execution | Serverless hosting option for the backend API. | Pay only when a request arrives, scales to zero when idle, no operating system patching needed. |
| **Amazon API Gateway** | Managed HTTP API gateway | Acts as the public front door for the Lambda backend. | Fast, natively handles CORS, and costs only $1.00 per million requests. |
| **Amazon DynamoDB** | Managed NoSQL database | Stores guardrail policies, triage statuses, and custom metric definitions. | Blazing fast single-digit millisecond latency, pay-per-request mode with zero idle charge. |
| **AWS IAM** | Identity and Access Management | Manages security roles and permissions for Lambda and administrators. | Enforces least-privilege security so services can only access what they strictly need. |

#### B. AWS Cloud Resources Monitored and Governed by aws-finos

| AWS Resource | Why it costs money | What aws-finos detects and does |
|---|---|---|
| **Amazon EBS Volumes** | AWS charges storage fees (e.g. $0.08 to $0.10 per GB/month) even when detached from an EC2 instance. | Detects unattached EBS volumes idle for more than 14 days and provides ready-to-run AWS CLI commands to delete them. |
| **Amazon VPC NAT Gateways** | Each NAT Gateway charges ~$0.045/hour (~$32.40/month) just for existing, plus per-GB data fees. | Flags NAT Gateways that process less than 100 MB of traffic in non-production environments. |
| **Elastic IP Addresses (EIP)** | AWS charges ~$0.005/hour for public IPv4 addresses that are allocated but not attached to a running instance. | Detects unassociated Elastic IPs and gives a single-click release command to avoid idle charges. |
| **Amazon RDS Instances** | Database instances charge by the hour whether queries are running or not. | Flags test/staging databases with zero active client connections across 14+ days. |
| **AWS Cost Allocation Tags** | AWS uses metadata tags like `CostCenter` and `Environment` to assign costs to teams. | The pre-deployment guardrail blocks any infrastructure code that lacks required allocation tags. |

---

## Part 2: Comprehensive Viva and Interview Questions with Answers

---

### Category A: General Project & Concept Questions

#### Q1: What is the main objective of your project?
**Answer:** The objective of aws-finos is to provide proactive cloud cost governance. Instead of passively analyzing AWS bills after the billing cycle ends, it calculates unit economics (cost per business event), detects abandoned and idle cloud resources in real time, and prevents expensive or untagged infrastructure from being deployed via CI/CD guardrails.

#### Q2: What is the difference between Cloud Cost Monitoring and Cloud Unit Economics?
**Answer:** 
* **Cost Monitoring:** Tells you: "You spent $5,000 on AWS this month." This does not tell you if that spend is good or bad.
* **Unit Economics:** Normalizes spend against business throughput. For example: "It cost $0.42 per 10,000 API requests." If your total bill doubled from $5,000 to $10,000 but your traffic grew five times, your unit cost actually improved from $0.42 to $0.17. Unit economics tells you your real infrastructure efficiency.

#### Q3: Why did you build this project as a complete reinvention of the old project?
**Answer:** The old project was a personal banking and consumer expense tracker (managing grocery/rent budgets, personal bank statement CSV uploads, and Swiggy/Zomato merchant parsing). The new aws-finos focuses entirely on cloud infrastructure financial engineering (FinOps) for DevOps and platform teams managing multi-account AWS workloads.

#### Q4: What are the three core functional pillars of aws-finos?
**Answer:**
1. **Unit Economics Engine:** Maps infrastructure burn to measurable business outputs (API calls, tenant count, data volume).
2. **Waste Radar:** Uncovers idle, orphaned, and oversized cloud assets with copyable CLI remediation commands.
3. **Pre-Deployment Guardrails:** Inspects proposed Terraform plans before deployment and blocks changes that violate cost policies.

---

### Category B: AWS Hosting and Free Tier Questions

#### Q5: Can this project be hosted completely free on AWS?
**Answer:** Yes. Under the 12-month AWS Free Tier:
* S3 offers 5 GB of standard storage and 20,000 GET requests/month free (the frontend build is only ~300 KB).
* CloudFront offers 1 TB of outbound data transfer per month free.
* EC2 offers 750 hours/month of a `t2.micro` instance free, which is enough to run the backend 24 hours a day, 7 days a week for the entire month for $0.
* Even if serverless is chosen, AWS Lambda provides 1 million free requests per month, and DynamoDB provides 25 GB of free storage.

#### Q6: What are the two ways to host this application on AWS?
**Answer:**
1. **Option 1 (S3 + EC2):** Host the static frontend on S3 (fronted by CloudFront for HTTPS) and run the Node.js API on an EC2 `t2.micro` instance.
2. **Option 2 (Single EC2 with Nginx):** Launch one `t2.micro` Ubuntu instance, run the backend on port 4000, and use Nginx to serve the static frontend on port 80 while reverse-proxying `/api` requests to the backend. This is the simplest single-server setup.

#### Q7: Why host the frontend on Amazon S3 instead of keeping it on an EC2 instance?
**Answer:** Storing frontend static files (HTML, JS, CSS) on S3 offloads traffic from the compute server. S3 has 99.999999999% (11 9s) durability, requires zero operating system maintenance or security patching, scales automatically to millions of visitors, and is significantly cheaper than running an active compute instance.

#### Q8: What role does Amazon CloudFront play?
**Answer:** CloudFront is a Content Delivery Network (CDN). It caches the frontend files in edge locations close to users worldwide. This reduces latency, provides free SSL/TLS certificates for HTTPS, and protects the S3 bucket from direct internet exposure.

#### Q9: What is the difference between AWS Lambda and Amazon EC2 in this project?
**Answer:**
* **EC2:** A persistent virtual server. It runs continuously, giving you full control over the operating system, but you must manage patches and keep it running.
* **Lambda:** Event-driven serverless compute. Code only runs when an HTTP request arrives and terminates immediately afterwards. If nobody visits the website at night, Lambda consumes zero compute and costs $0.

#### Q10: What is Amazon API Gateway HTTP API v2?
**Answer:** HTTP API v2 is a modern, lightweight version of AWS API Gateway. It is designed specifically to proxy HTTP requests directly to Lambda functions or HTTP backends. It is up to 70% cheaper and has lower latency than traditional REST APIs in AWS.

---

### Category C: AWS Resource Cost Mechanics (Deep-Dive)

#### Q11: Why does an unattached EBS volume continue to cost money?
**Answer:** Amazon EBS volumes are provisioned block storage devices allocated on physical SAN drives in AWS data centers. AWS reserves that disk capacity exclusively for you whether an EC2 instance is currently reading from it or not. If an engineer terminates an EC2 instance but forgets to select "Delete on Termination" for secondary volumes, the detached EBS volume sits idle while AWS bills for the provisioned gigabytes every month.

#### Q12: Why does AWS charge money for an unused Elastic IP address?
**Answer:** IPv4 addresses are a globally exhausted, scarce resource. AWS wants to discourage companies from hoarding public IP addresses without using them. If an Elastic IP is associated with a running instance, it is free. But if it is unassociated or attached to a stopped instance, AWS charges ~$0.005 per hour to encourage users to release it back to the pool.

#### Q13: Why are NAT Gateways often a major source of cloud waste?
**Answer:** A VPC NAT Gateway charges an hourly flat rate (~$0.045/hour, or ~$32.40/month) just for running, in addition to data processing fees. In non-production or staging environments, developers often deploy a NAT Gateway in every Availability Zone but generate negligible outbound traffic. Replacing redundant staging NAT Gateways with a single gateway or using VPC Endpoints for S3/DynamoDB can save hundreds of dollars a month.

#### Q14: What is a Burn Rate Anomaly and how does aws-finos detect it?
**Answer:** Burn rate is the amount of cloud money being spent per day or per hour. A burn rate anomaly occurs when an AWS service suddenly spikes significantly above its rolling historical average (for example, more than 2 standard deviations or > 20% above its 7-day baseline). aws-finos flags these anomalies so engineers can investigate misconfigured loops or traffic spikes before the monthly bill arrives.

#### Q15: What are AWS Cost Allocation Tags and why are they critical?
**Answer:** Tags are key-value pairs assigned to AWS resources (for example: `CostCenter = Platform` or `Environment = Production`). When activated in AWS Billing, they allow AWS to split costs by team, service, or business unit. Without mandatory tags, a company has no reliable way to know which team or microservice caused a sudden jump in the monthly bill.

---

### Category D: Security, IAM, and Governance Questions

#### Q16: What is the Principle of Least Privilege in AWS IAM?
**Answer:** The principle of least privilege means granting an identity (user or Lambda execution role) only the exact permissions necessary to perform its job, and nothing more. In aws-finos, the Lambda backend is granted read-only telemetry permissions (like `ce:GetCostAndUsage` and `ec2:DescribeVolumes`), but is strictly denied destructive permissions like `ec2:TerminateInstances` or `s3:DeleteBucket`.

#### Q17: Why do we separate the detection of waste from its deletion?
**Answer:** Deleting cloud resources autonomously without human review can cause accidental downtime (for example, deleting a detached volume that contains an unmounted database backup). aws-finos uses a Human-in-the-Loop model: it detects waste and generates dry-run CLI commands, allowing engineers to verify and triage before deletion.

#### Q18: How are secrets and credentials handled in this project?
**Answer:** No AWS access keys, secret keys, or database credentials are ever hardcoded in the codebase. In local mode, the application uses an isolated mock data provider. In production, AWS credentials are provided automatically via IAM Roles attached to EC2 or Lambda (instance metadata service), eliminating static secret keys entirely.

---

### Category E: Infrastructure as Code (IaC) & DevOps Questions

#### Q19: Why did you write Terraform code for this project?
**Answer:** Terraform allows us to treat infrastructure as code (IaC). Instead of clicking manually in the AWS Console (which is error-prone, untracked, and cannot be reproduced), Terraform defines S3, CloudFront, Lambda, API Gateway, and DynamoDB in declarative configuration files. The entire cloud infrastructure can be spun up, updated, or destroyed predictably with a single command.

#### Q20: How does the Pre-Deployment Guardrail feature work?
**Answer:** When an engineer creates a pull request changing infrastructure (for example, in Terraform), CI/CD generates an execution plan. aws-finos evaluates the plan against three automated policies:
1. Does the monthly cost delta exceed the warning threshold ($150/month)?
2. Do all newly declared resources have required `CostCenter` and `Environment` tags?
3. Does the plan introduce restricted high-cost instance classes (like GPU instances `g5` or `p4`) without approval?
If any blocking rule fails, the plan is marked as blocked before deployment to production.

#### Q21: What is Amazon DynamoDB Pay-Per-Request billing?
**Answer:** Traditional databases require paying for provisioned CPU and memory 24/7. DynamoDB in On-Demand (Pay-Per-Request) mode charges zero money when there are no reads or writes. You only pay fractions of a cent per request when data is written or read, making it ideal for cost-efficient governance workloads.

#### Q22: If you could add one advanced AWS feature next, what would it be?
**Answer:** An AWS EventBridge rule configured on a cron schedule (for example, every midnight) to automatically trigger an AWS Lambda function that queries the AWS Cost Explorer API and CloudWatch, calculates the daily unit economics, and sends a Slack or Amazon SNS notification if burn rate drift is detected.

---

## Part 3: Quick Summary Cheat Sheet for Viva

If the examiner asks for a 30-second summary:
> "aws-finos is a Cloud Financial Operations (FinOps) system built with React and Node.js. It helps engineering teams avoid unexpected cloud bills by tracking unit economics (cost per business transaction), finding abandoned AWS resources like detached EBS disks and idle NAT gateways, and running pre-deployment checks on Terraform plans to block untagged or expensive infrastructure. It is designed to run entirely within the AWS Free Tier using S3, CloudFront, and EC2 or Lambda with DynamoDB."
