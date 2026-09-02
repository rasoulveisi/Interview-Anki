import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allQuestions as existingQuestions, categoriesMeta } from '../src/data/index.js';
import { CardTemplate, DeckTemplate, DecksManifest } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/decks');
const gptHandbookPath = path.resolve(__dirname, 'gpt-handbook.json');
const gptData = JSON.parse(fs.readFileSync(gptHandbookPath, 'utf-8'));

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const deckColorMap: Record<string, string> = {
  javascript: '#F59E0B',
  typescript: '#3B82F6',
  angular: '#EF4444',
  rxjs: '#EC4899',
  statemanagement: '#8B5CF6',
  htmlcss: '#F97316',
  browser: '#06B6D4',
  performance: '#10B981',
  architecture: '#6366F1',
  security: '#F43F5E',
  testing: '#14B8A6',
  patterns: '#A855F7',
  a11y: '#84CC16',
  tooling: '#0284C7',
  gitworkflow: '#D97706',
  fesystemdesign: '#D946EF',
  fescenarios: '#DC2626',
  reactcore: '#06B6D4',
  reactadvanced: '#2563EB',
  web: '#3B82F6',
  dotnet: '#8B5CF6',
  efcore: '#EC4899',
  sql: '#F59E0B',
  apidesign: '#10B981',
  microservices: '#06B6D4',
  systemdesign: '#6366F1',
  scenarios: '#EF4444'
};

const categoryMapping: Record<string, string> = {
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

const nowIso = new Date().toISOString();

// Transform GPT questions into CardTemplate objects
const gptCardsByCategory: Record<string, CardTemplate[]> = {};

for (const cat of gptData.categories) {
  for (const q of cat.questions) {
    const targetCat = categoryMapping[q.id] || 'scenarios';
    if (!gptCardsByCategory[targetCat]) {
      gptCardsByCategory[targetCat] = [];
    }

    const paragraphs = q.model_answer.split('\n\n');
    const directSummary = paragraphs[0] || q.model_answer.substring(0, 200);

    const strongSignals = q.evaluation?.strong_signals || [];
    const warningSignals = q.evaluation?.warning_signals || [];
    const followUps = q.follow_ups || [];

    const keyPoints = strongSignals.map((s: string) => `- ${s}`).join('\n');
    const backContent = `${directSummary}\n\n**Key Points:**\n${keyPoints}`;

    let notesMarkdown = `### Comprehensive Senior Answer\n${q.model_answer}\n\n`;

    if (strongSignals.length > 0) {
      notesMarkdown += `### 💡 Senior Engine & Architecture Insight\n> ${strongSignals[0]}\n\n`;
    }

    if (followUps.length > 0) {
      notesMarkdown += `### 🎯 Probable Interviewer Follow-ups\n`;
      for (const fu of followUps) {
        notesMarkdown += `- **${fu}**\n`;
      }
      notesMarkdown += '\n';
    }

    if (strongSignals.length > 0 || warningSignals.length > 0) {
      notesMarkdown += `### 🔍 Interview Evaluation Signals\n`;
      if (strongSignals.length > 0) {
        notesMarkdown += `**Strong Signals (What interviewers look for):**\n` + strongSignals.map((s: string) => `✅ ${s}`).join('\n') + `\n\n`;
      }
      if (warningSignals.length > 0) {
        notesMarkdown += `**Warning Signals (Pitfalls to avoid):**\n` + warningSignals.map((s: string) => `⚠️ ${s}`).join('\n') + `\n`;
      }
    }

    const spokenTip = `I approach this by distinguishing the core boundary: ${strongSignals[0] || 'clarifying assumptions and evaluating the trade-offs.'}`;

    const card: CardTemplate = {
      id: `card_gpt_${q.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      deckId: `deck_${targetCat}`,
      front: q.question,
      back: backContent,
      notes: notesMarkdown.trim(),
      spokenTip,
      tags: [targetCat, q.type || 'Senior Architecture', 'Candidate-Calibrated'],
      difficulty: q.difficulty || 'Senior',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    gptCardsByCategory[targetCat].push(card);
  }
}

// Convert existing questions to CardTemplate
const existingCardsByCategory: Record<string, CardTemplate[]> = {};
for (const q of existingQuestions) {
  const catId = q.category;
  if (!existingCardsByCategory[catId]) {
    existingCardsByCategory[catId] = [];
  }

  const isBackend = ['web', 'dotnet', 'efcore', 'sql', 'apidesign', 'microservices', 'systemdesign', 'scenarios'].includes(q.category);
  const codeSnippet = q.example?.code || q.codeExample || '';
  const codeLang = q.example?.language || (isBackend ? 'csharp' : 'typescript');
  const codeExplanation = q.example?.explanation || '';

  let notesMarkdown = '';
  if (q.interviewAnswer) {
    notesMarkdown += `### Comprehensive Senior Answer\n${q.interviewAnswer}\n\n`;
  } else if (q.detailedExplanation) {
    notesMarkdown += `### Detailed Explanation\n${q.detailedExplanation}\n\n`;
  }

  if (codeSnippet) {
    notesMarkdown += `### Code Example\n\`\`\`${codeLang}\n${codeSnippet}\n\`\`\`\n`;
    if (codeExplanation) {
      notesMarkdown += `_${codeExplanation}_\n\n`;
    }
  }

  if (q.seniorPoint) {
    notesMarkdown += `### 💡 Senior Engine & Architecture Insight\n> ${q.seniorPoint}\n\n`;
  }

  if (q.followUps && Array.isArray(q.followUps) && q.followUps.length > 0) {
    notesMarkdown += `### 🎯 Probable Interviewer Follow-ups\n`;
    for (const fu of q.followUps) {
      notesMarkdown += `- **Q: ${fu.question}**\n  *A:* ${fu.answer}\n`;
    }
  }

  const card: CardTemplate = {
    id: `card_${q.id}`,
    deckId: `deck_${q.category}`,
    front: q.question,
    back: `${q.shortAnswer}\n\n**Key Points:**\n${q.keyPointsToMention?.map((p: string) => `- ${p}`).join('\n') || ''}`,
    notes: notesMarkdown.trim() || undefined,
    spokenTip: q.spokenTip || '',
    tags: q.tags || [q.category, q.topic || 'General'],
    difficulty: q.difficulty || 'Intermediate',
    createdAt: nowIso,
    updatedAt: nowIso
  };

  existingCardsByCategory[catId].push(card);
}

// Combine for all 27 categories
const categoryIds = Object.keys(categoriesMeta);
const manifestDecks = [];
const allDecksData: Record<string, { deck: DeckTemplate; cards: CardTemplate[] }> = {};
let totalCombinedCards = 0;

for (const catId of categoryIds) {
  const meta = categoriesMeta[catId as keyof typeof categoriesMeta];
  const existingCards = existingCardsByCategory[catId] || [];
  const gptCards = gptCardsByCategory[catId] || [];

  // Combine: GPT candidate-calibrated questions first + existing detailed questions
  const combinedCards = [...gptCards, ...existingCards];
  totalCombinedCards += combinedCards.length;

  const deckTemplate: DeckTemplate = {
    id: `deck_${catId}`,
    name: meta?.name || catId,
    description: meta?.description || `Mastery cards for ${catId}`,
    category: catId,
    color: deckColorMap[catId] || '#6366F1',
    iconName: meta?.iconName || 'Layers',
    isDefault: true,
    totalCards: combinedCards.length
  };

  const filename = `${catId}.json`;
  const deckPayload = {
    deck: deckTemplate,
    cards: combinedCards
  };

  allDecksData[catId] = deckPayload;

  fs.writeFileSync(
    path.join(targetDir, filename),
    JSON.stringify(deckPayload, null, 2),
    'utf-8'
  );

  manifestDecks.push({
    id: deckTemplate.id,
    category: catId,
    name: deckTemplate.name,
    description: deckTemplate.description,
    color: deckTemplate.color,
    iconName: deckTemplate.iconName,
    cardCount: combinedCards.length,
    filename
  });
}

// Write combined all_decks.json
fs.writeFileSync(
  path.join(targetDir, 'all_decks.json'),
  JSON.stringify(allDecksData, null, 2),
  'utf-8'
);

// Write manifest.json with version 2.0.0
const manifest: DecksManifest = {
  version: '2.0.0',
  updatedAt: nowIso,
  decks: manifestDecks
};

fs.writeFileSync(
  path.join(targetDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf-8'
);

console.log(`Successfully generated ${manifestDecks.length} deck JSON files with TOTAL ${totalCombinedCards} combined cards in public/decks/!`);
