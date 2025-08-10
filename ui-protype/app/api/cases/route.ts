import { dbPromise } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const suiteId = searchParams.get('suiteId');
  
  const db = await dbPromise;
  let cases = db.data.cases;
  
  if (projectId) {
    const suites = db.data.suites.filter(s => s.projectId === projectId);
    cases = cases.filter(c => suites.some(s => s.id === c.suiteId));
  }
  if (suiteId) {
    cases = cases.filter(c => c.suiteId === suiteId);
  }
  
  const header = 'id,title,description,preconditions,priority,type,tags,suiteId,sectionId\n';
  const rows = cases.map(c => [
    c.id,
    escapeCsv(c.title),
    escapeCsv(c.description || ''),
    escapeCsv(c.preconditions || ''),
    c.priority || 'P2',
    c.type || 'Functional',
    escapeCsv((c.tags || []).join(',')),
    c.suiteId,
    c.sectionId || ''
  ].join(','));
  
  const csv = header + rows.join('\n') + '\n';
  return new Response(csv, { headers: { 'Content-Type': 'text/csv' } });
}

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
  
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  const [header, ...rows] = lines;
  
  if (!header.includes('title')) {
    return Response.json({ error: 'CSV must have a title column' }, { status: 400 });
  }
  
  const db = await dbPromise;
  let imported = 0;
  
  for (const row of rows) {
    const cols = row.split(',');
    const title = cols[1]?.replace(/"/g, '') || 'Imported Case';
    const description = cols[2]?.replace(/"/g, '') || '';
    const suiteId = formData.get('suiteId') as string;
    
    if (suiteId && title) {
      const newCase = {
        id: crypto.randomUUID(),
        suiteId,
        sectionId: null,
        title,
        description,
        preconditions: cols[3]?.replace(/"/g, '') || '',
        priority: (cols[4] as any) || 'P2',
        type: (cols[5] as any) || 'Functional',
        tags: cols[6] ? cols[6].replace(/"/g, '').split(',').filter(Boolean) : [],
        refs: [],
        updatedAt: new Date().toISOString()
      };
      db.data.cases.push(newCase);
      imported++;
    }
  }
  
  await db.write();
  return Response.json({ imported });
}

function escapeCsv(v: string) {
  const needs = /[",\n]/.test(v);
  return needs ? '"' + v.replace(/"/g, '""') + '"' : v;
}
