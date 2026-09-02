import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { allQuestions, categoriesMeta } from '../src/data/index.js';
import { CardTemplate, DeckTemplate, DecksManifest } from '../src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const targetDir = path.resolve(__dirname, '../public/decks');

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

const categoryIds = Object.keys(categoriesMeta);
const nowIso = new Date().toISOString();

const manifestDecks = [];
const allDecksData: Record<string, { deck: DeckTemplate; cards: CardTemplate[] }> = {};

for (const catId of categoryIds) {
  const meta = categoriesMeta[catId as keyof typeof categoriesMeta];
  const catQuestions = allQuestions.filter(q => q.category === catId);

  const deckTemplate: DeckTemplate = {
    id: `deck_${catId}`,
    name: meta?.name || catId,
    description: meta?.description || `Mastery cards for ${catId}`,
    category: catId,
    color: deckColorMap[catId] || '#6366F1',
    iconName: meta?.iconName || 'Layers',
    isDefault: true,
    totalCards: catQuestions.length
  };

  const cardTemplates: CardTemplate[] = catQuestions.map((q) => {
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

    return {
      id: `card_${q.id}`,
      deckId: `deck_${q.category}`,
      front: q.question,
      back: `${q.shortAnswer}\n\n**Key Points:**\n${q.keyPointsToMention?.map(p => `- ${p}`).join('\n') || ''}`,
      notes: notesMarkdown.trim() || undefined,
      spokenTip: q.spokenTip || '',
      tags: q.tags || [q.category, q.topic || 'General'],
      difficulty: q.difficulty || 'Intermediate',
      createdAt: nowIso,
      updatedAt: nowIso
    };
  });

  const filename = `${catId}.json`;
  const deckPayload = {
    deck: deckTemplate,
    cards: cardTemplates
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
    cardCount: cardTemplates.length,
    filename
  });
}

// Write combined all_decks.json for rapid 1-request bulk preload / fallback
fs.writeFileSync(
  path.join(targetDir, 'all_decks.json'),
  JSON.stringify(allDecksData, null, 2),
  'utf-8'
);

// Write manifest.json
const manifest: DecksManifest = {
  version: '1.0.0',
  updatedAt: nowIso,
  decks: manifestDecks
};

fs.writeFileSync(
  path.join(targetDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf-8'
);

console.log(`Successfully generated ${manifestDecks.length} deck JSON files and manifest.json in public/decks/`);
