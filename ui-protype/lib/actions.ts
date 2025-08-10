'use server';
import { nanoid } from 'nanoid';
import { dbPromise } from './db';
import type { Case, CaseStep, Project, Run, RunCase, Result, Section, Suite } from '@/types';

export async function createProject(formData: FormData) {
  const db = await dbPromise;
  const name = String((formData.get('name') as string) || '').trim();
  const key = String((formData.get('key') as string) || '').trim().toUpperCase();
  const description = String((formData.get('description') as string) || '').trim();
  if (!name || !key) return { ok: false, error: 'Name and Key are required' };
  const project: Project = { id: nanoid(), name, key, description, createdAt: new Date().toISOString() };
  db.data.projects.push(project);
  await db.write();
  return { ok: true, id: project.id };
}

export async function createSuite(projectId: string, name: string) {
  const db = await dbPromise;
  const suite: Suite = { id: nanoid(), projectId, name, description: '' };
  db.data.suites.push(suite);
  await db.write();
  return suite.id;
}

export async function createSection(suiteId: string, name: string, parentId?: string | null) {
  const db = await dbPromise;
  const order = db.data.sections.filter((s) => s.suiteId === suiteId).length + 1;
  const section: Section = { id: nanoid(), suiteId, parentId: parentId || null, name, order };
  db.data.sections.push(section);
  await db.write();
  return section.id;
}

export async function createCase(suiteId: string, sectionId: string | null, title: string) {
  const db = await dbPromise;
  const tc: Case = { id: nanoid(), suiteId, sectionId, title, description: '', preconditions: '', priority: 'P2', type: 'Functional', tags: [], refs: [], updatedAt: new Date().toISOString() };
  db.data.cases.push(tc);
  await db.write();
  return tc.id;
}

export async function updateCase(caseId: string, fields: Partial<Case>, steps?: { action: string; expected: string }[]) {
  const db = await dbPromise;
  const c = db.data.cases.find((c) => c.id === caseId);
  if (!c) return false;
  Object.assign(c, fields, { updatedAt: new Date().toISOString() });
  if (steps) {
    db.data.case_steps = db.data.case_steps.filter((cs) => cs.caseId !== caseId);
    steps.forEach((s, i) => {
      const step: CaseStep = { id: nanoid(), caseId, index: i + 1, action: s.action, expected: s.expected };
      db.data.case_steps.push(step);
    });
  }
  await db.write();
  return true;
}

export async function createRun(projectId: string, name: string, caseIds: string[]) {
  const db = await dbPromise;
  const run: Run = { id: nanoid(), projectId, name, description: '', status: 'draft', startedAt: null, completedAt: null };
  db.data.runs.push(run);
  caseIds.forEach(cid => db.data.run_cases.push({ id: nanoid(), runId: run.id, caseId: cid } as RunCase));
  await db.write();
  return run.id;
}

export async function recordResult(runCaseId: string, status: Result['status'], comment?: string, durationSec?: number) {
  const db = await dbPromise;
  const result: Result = { id: nanoid(), runCaseId, status, comment, durationSec, createdBy: db.data.users[0]?.id || 'system', createdAt: new Date().toISOString() };
  db.data.results.push(result);
  await db.write();
  return result.id;
}

export async function startRun(runId: string) {
  const db = await dbPromise;
  const r = db.data.runs.find((r) => r.id === runId);
  if (!r) return false;
  r.status = 'in_progress';
  r.startedAt = new Date().toISOString();
  await db.write();
  return true;
}

export async function completeRun(runId: string) {
  const db = await dbPromise;
  const r = db.data.runs.find((r) => r.id === runId);
  if (!r) return false;
  r.status = 'completed';
  r.completedAt = new Date().toISOString();
  await db.write();
  return true;
}

export async function createToken(userId: string, name: string) {
  const db = await dbPromise;
  const token = { id: nanoid(), userId, name, tokenHash: `hash_${nanoid(8)}`, lastUsedAt: null as string | null };
  db.data.api_tokens.push(token);
  await db.write();
  return token.id;
}

export async function createWebhook(projectId: string, url: string, events: string[]) {
  const db = await dbPromise;
  const wh = { id: nanoid(), projectId, url, secret: nanoid(16), events, active: true };
  db.data.webhooks.push(wh);
  await db.write();
  return wh.id;
}
