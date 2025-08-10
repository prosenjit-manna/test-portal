export type ID = string;

export type Role = 'Admin' | 'Manager' | 'Tester' | 'Viewer';

export interface User {
  id: ID;
  email: string;
  name: string;
  role: Role;
}

export interface Project {
  id: ID;
  name: string;
  key: string;
  description?: string;
  createdAt: string;
}

export interface Suite {
  id: ID;
  projectId: ID;
  name: string;
  description?: string;
}

export interface Section {
  id: ID;
  suiteId: ID;
  parentId?: ID | null;
  name: string;
  order: number;
}

export interface CaseStep { id: ID; caseId: ID; index: number; action: string; expected: string; }

export interface Case {
  id: ID;
  suiteId: ID;
  sectionId?: ID | null;
  title: string;
  description?: string;
  preconditions?: string;
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  type?: 'Functional' | 'Regression' | 'Smoke' | 'Other';
  tags?: string[];
  refs?: string[];
  updatedAt: string;
}

export interface Run {
  id: ID;
  projectId: ID;
  name: string;
  description?: string;
  assigneeId?: ID | null;
  status: 'draft' | 'in_progress' | 'completed';
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface RunCase { id: ID; runId: ID; caseId: ID; assigneeId?: ID | null; }

export interface Result { id: ID; runCaseId: ID; status: 'passed'|'failed'|'blocked'|'retest'|'untested'; comment?: string; durationSec?: number; createdBy: ID; createdAt: string; }

export interface Milestone { id: ID; projectId: ID; name: string; dueDate?: string; status: 'planned'|'active'|'done'; }

export interface Plan { id: ID; projectId: ID; name: string; description?: string; milestoneId?: ID | null; status: 'draft'|'active'|'completed'; }

export interface Webhook { id: ID; projectId: ID; url: string; secret: string; events: string[]; active: boolean; }

export interface ApiToken { id: ID; userId: ID; name: string; tokenHash: string; lastUsedAt?: string | null; }

export interface AuditLog { id: ID; actorId: ID; action: string; entityType: string; entityId: ID; diffJson?: any; createdAt: string; }

export interface DB {
  users: User[];
  projects: Project[];
  suites: Suite[];
  sections: Section[];
  cases: Case[];
  case_steps: CaseStep[];
  runs: Run[];
  run_cases: RunCase[];
  results: Result[];
  milestones: Milestone[];
  plans: Plan[];
  plan_runs: { planId: ID; runId: ID }[];
  audit_logs: AuditLog[];
  api_tokens: ApiToken[];
  webhooks: Webhook[];
}
