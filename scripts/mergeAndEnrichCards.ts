import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gptHandbookPath = path.resolve(__dirname, 'gpt-handbook.json');
const gptData = JSON.parse(fs.readFileSync(gptHandbookPath, 'utf-8'));

console.log(`Loaded ${gptData.categories.length} categories with total ${gptData.metadata.question_count} questions.`);

// Map GPT question IDs to our 27 app categories
const categoryMapping: Record<string, string> = {
  // TypeScript & JavaScript
  'TS-01': 'typescript',
  'TS-02': 'typescript',
  'TS-03': 'typescript',
  'TS-04': 'typescript',
  'TS-05': 'javascript',
  'TS-06': 'javascript',
  'TS-07': 'javascript',
  'TS-08': 'javascript',
  'TS-09': 'architecture',
  'TS-10': 'typescript',

  // Angular
  'NG-01': 'angular',
  'NG-02': 'angular',
  'NG-03': 'angular',
  'NG-04': 'angular',
  'NG-05': 'angular',
  'NG-06': 'angular',
  'NG-07': 'angular',
  'NG-08': 'angular',
  'NG-09': 'angular',
  'NG-10': 'architecture',

  // RxJS & State Management
  'RX-01': 'rxjs',
  'RX-02': 'rxjs',
  'RX-03': 'rxjs',
  'RX-04': 'rxjs',
  'RX-05': 'rxjs',
  'RX-06': 'statemanagement',
  'RX-07': 'statemanagement',
  'RX-08': 'statemanagement',
  'RX-09': 'rxjs',
  'RX-10': 'statemanagement',

  // UI, CSS, Accessibility, Forms
  'UI-01': 'patterns',
  'UI-02': 'patterns',
  'UI-03': 'htmlcss',
  'UI-04': 'htmlcss',
  'UI-05': 'a11y',
  'UI-06': 'patterns',
  'UI-07': 'patterns',
  'UI-08': 'htmlcss',
  'UI-09': 'performance',
  'UI-10': 'fesystemdesign',

  // Frontend Performance, Quality, Security, Delivery
  'FE-01': 'performance',
  'FE-02': 'tooling',
  'FE-03': 'performance',
  'FE-04': 'testing',
  'FE-05': 'testing',
  'FE-06': 'security',
  'FE-07': 'security',
  'FE-08': 'browser',
  'FE-09': 'gitworkflow',
  'FE-10': 'tooling',

  // React Foundations
  'RC-01': 'reactcore',
  'RC-02': 'reactcore',
  'RC-03': 'reactcore',
  'RC-04': 'reactcore',
  'RC-05': 'reactcore',
  'RC-06': 'reactcore',
  'RC-07': 'reactcore',
  'RC-08': 'reactcore',
  'RC-09': 'reactcore',
  'RC-10': 'reactcore',

  // React Architecture & Next.js
  'RA-01': 'reactadvanced',
  'RA-02': 'reactadvanced',
  'RA-03': 'reactadvanced',
  'RA-04': 'reactadvanced',
  'RA-05': 'reactadvanced',
  'RA-06': 'reactadvanced',
  'RA-07': 'reactadvanced',
  'RA-08': 'reactadvanced',
  'RA-09': 'reactadvanced',
  'RA-10': 'reactadvanced',

  // .NET & ASP.NET Core
  'NET-01': 'dotnet',
  'NET-02': 'dotnet',
  'NET-03': 'dotnet',
  'NET-04': 'dotnet',
  'NET-05': 'apidesign',
  'NET-06': 'dotnet',
  'NET-07': 'apidesign',
  'NET-08': 'dotnet',
  'NET-09': 'dotnet',
  'NET-10': 'dotnet',

  // EF Core & SQL
  'DB-01': 'efcore',
  'DB-02': 'efcore',
  'DB-03': 'efcore',
  'DB-04': 'sql',
  'DB-05': 'sql',
  'DB-06': 'efcore',
  'DB-07': 'efcore',
  'DB-08': 'efcore',
  'DB-09': 'efcore',
  'DB-10': 'sql',

  // API Reliability, Security & Delivery
  'OPS-01': 'web',
  'OPS-02': 'web',
  'OPS-03': 'web',
  'OPS-04': 'web',
  'OPS-05': 'microservices',
  'OPS-06': 'microservices',
  'OPS-07': 'microservices',
  'OPS-08': 'gitworkflow',
  'OPS-09': 'microservices',
  'OPS-10': 'web',

  // Full-Stack Debugging
  'DBG-01': 'fescenarios',
  'DBG-02': 'fescenarios',
  'DBG-03': 'scenarios',
  'DBG-04': 'scenarios',
  'DBG-05': 'scenarios',
  'DBG-06': 'fescenarios',
  'DBG-07': 'scenarios',
  'DBG-08': 'fescenarios',
  'DBG-09': 'fescenarios',
  'DBG-10': 'fescenarios',

  // System Design & Leadership
  'SD-01': 'fesystemdesign',
  'SD-02': 'systemdesign',
  'SD-03': 'fesystemdesign',
  'SD-04': 'systemdesign',
  'SD-05': 'systemdesign',
  'SD-06': 'architecture',
  'SD-07': 'systemdesign',
  'SD-08': 'architecture',
  'SD-09': 'architecture',
  'SD-10': 'systemdesign'
};

const countsPerCategory: Record<string, number> = {};
for (const cat of gptData.categories) {
  for (const q of cat.questions) {
    const targetCat = categoryMapping[q.id] || 'scenarios';
    countsPerCategory[targetCat] = (countsPerCategory[targetCat] || 0) + 1;
  }
}

console.log('Distribution of GPT questions across 27 app decks:');
console.table(countsPerCategory);
