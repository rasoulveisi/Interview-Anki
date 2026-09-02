import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDecksDir = path.resolve(__dirname, '../public/decks');

// Test 1: Verify manifest.json
const manifestPath = path.join(publicDecksDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('FAIL: manifest.json does not exist');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
if (!manifest.version || !Array.isArray(manifest.decks) || manifest.decks.length !== 27) {
  console.error(`FAIL: manifest.decks length is ${manifest.decks?.length}, expected 27`);
  process.exit(1);
}

console.log(`PASS: Manifest contains ${manifest.decks.length} registered decks.`);

// Test 2: Verify all 27 individual deck files
for (const deckMeta of manifest.decks) {
  const filePath = path.join(publicDecksDir, deckMeta.filename);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing deck file ${deckMeta.filename}`);
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  if (!content.deck || !content.cards || !Array.isArray(content.cards)) {
    console.error(`FAIL: Invalid deck structure in ${deckMeta.filename}`);
    process.exit(1);
  }
}

console.log('PASS: All 27 deck JSON files are valid and well-formed.');

// Test 3: Verify all_decks.json
const allDecksPath = path.join(publicDecksDir, 'all_decks.json');
const allDecks = JSON.parse(fs.readFileSync(allDecksPath, 'utf-8'));
if (Object.keys(allDecks).length !== 27) {
  console.error(`FAIL: all_decks.json has ${Object.keys(allDecks).length} categories, expected 27`);
  process.exit(1);
}

console.log('PASS: all_decks.json is valid with all 27 categories.');
