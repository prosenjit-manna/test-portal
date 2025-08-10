import { JSONFilePreset } from 'lowdb/node';
import { join } from 'node:path';
import { nanoid } from 'nanoid';
import type { DB, Project, Suite, Section, Case, CaseStep, Run, RunCase, Result, User } from '@/types';

const dbFile = join(process.cwd(), 'data.json');

const defaultData: DB = {
  users: [],
  projects: [],
  suites: [],
  sections: [],
  cases: [],
  case_steps: [],
  runs: [],
  run_cases: [],
  results: [],
  milestones: [],
  plans: [],
  plan_runs: [],
  audit_logs: [],
  api_tokens: [],
  webhooks: [],
};

export const dbPromise = JSONFilePreset<DB>(dbFile, defaultData);

export async function seedIfEmpty() {
  const db = await dbPromise;
  if (db.data.projects.length === 0) {
    const now = new Date().toISOString();
    const user: User = { id: nanoid(), email: 'demo@example.com', name: 'Demo', role: 'Admin' };
    const project: Project = { id: nanoid(), name: 'Demo Project', key: 'DEMO', description: 'Sample project', createdAt: now };
    const suite: Suite = { id: nanoid(), projectId: project.id, name: 'Main Suite', description: 'Default suite' };
    const section: Section = { id: nanoid(), suiteId: suite.id, name: 'Login', order: 1 };
    const tc: Case = { id: nanoid(), suiteId: suite.id, sectionId: section.id, title: 'User can login', description: 'Valid creds', preconditions: 'User exists', priority: 'P1', type: 'Functional', tags: ['auth'], refs: [], updatedAt: now };
    const step1: CaseStep = { id: nanoid(), caseId: tc.id, index: 1, action: 'Open login page', expected: 'Page loads' };
    const step2: CaseStep = { id: nanoid(), caseId: tc.id, index: 2, action: 'Enter valid creds and submit', expected: 'Redirect to dashboard' };
    db.data.users.push(user);
    db.data.projects.push(project);
    db.data.suites.push(suite);
    db.data.sections.push(section);
    db.data.cases.push(tc);
    db.data.case_steps.push(step1, step2);
    const run: Run = { id: nanoid(), projectId: project.id, name: 'Smoke 1', description: 'Initial', status: 'draft' };
    db.data.runs.push(run);
    const rc: RunCase = { id: nanoid(), runId: run.id, caseId: tc.id };
    db.data.run_cases.push(rc);
    const result: Result = { id: nanoid(), runCaseId: rc.id, status: 'untested', createdBy: user.id, createdAt: now };
    db.data.results.push(result);
    await db.write();
  }
}
