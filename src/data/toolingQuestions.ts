import { Question } from '../types';

export const toolingQuestions: Question[] = [
  {
    id: 'tool_01',
    category: 'tooling',
    topic: 'Build Tools: Vite vs Webpack vs esbuild',
    difficulty: 'Senior',
    question: 'How do modern build tools (Vite, esbuild, Turbopack) achieve 100x faster dev builds than legacy Webpack? Explain native ESM and HMR.',
    shortAnswer: 'Webpack bundles the entire application dependency graph before starting the dev server. **Vite** leverages native browser ES Modules (`<script type="module">`): it pre-bundles third-party dependencies once using Go-based **esbuild** (100x faster), and serves application code on-demand without bundling. Hot Module Replacement (HMR) updates only the exact edited file without rebuilding the graph.',
    interviewAnswer: 'The architectural shift between legacy and modern build tools comes down to bundling strategy during development:\n1. **Legacy Webpack / Angular CLI (Webpack)**:\n   - *Mechanism*: Webpack crawls every file in your application, transpiles TypeScript, bundles everything into in-memory chunks, and only then starts the dev server. As an app grows to 10,000 files, cold dev server starts take 60-120 seconds, and HMR takes seconds per save.\n2. **Vite & Modern Angular CLI (Vite + esbuild)**:\n   - *Dev Server (Unbundled Native ESM)*: The dev server starts instantly (< 300ms). When the browser loads the page, it requests files natively (`import ./app.js`). Vite intercepts the HTTP request, compiles that single TypeScript file on the fly using esbuild, and serves it.\n   - *Dependency Pre-bundling*: Vite uses esbuild (written in Go) to pre-bundle CommonJS/node_modules dependencies into optimized ESM once and caches them with HTTP 304 headers.\n   - *Production*: Uses Rollup / esbuild to generate tree-shaken, code-split static assets for production deployment.',
    spokenTip: 'Vite starts instantly because it serves native ES modules on-demand in development instead of bundling the whole app up-front.',
    example: {
      language: 'javascript',
      code: `// vite.config.ts (Modern Vite configuration)
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    hmr: {
      overlay: true // Displays compile errors directly in browser overlay
    }
  },
  optimizeDeps: {
    // Pre-bundled via esbuild (compiled Go binary) on server start
    include: ['lodash-es', 'rxjs', 'date-fns']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild', // Sub-second minification
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['rxjs', 'tslib']
        }
      }
    }
  }
});`,
      explanation: 'Vite configuration demonstrating esbuild dependency pre-bundling and Rollup production chunking.'
    },
    seniorPoint: 'Why esbuild is so fast: esbuild is written in native Go, compiles down to machine code, parses ASTs in parallel worker threads, and avoids intermediate serialization overhead common to JavaScript-based parsers.',
    followUps: [
      {
        question: 'Why doesn\'t Vite use esbuild for production bundling instead of Rollup?',
        answer: 'While esbuild is blazing fast for compilation and minification, Rollup currently has more mature support for complex tree-shaking, CSS code splitting, and HTML plugin ecosystems.'
      },
      {
        question: 'How does modern Angular CLI (v17+) utilize Vite?',
        answer: 'Modern Angular CLI uses `esbuild` for compilation and Vite as the development server to provide instant startup and sub-second HMR.'
      }
    ],
    keyPointsToMention: [
      'Webpack: full app bundle required before dev server can serve requests',
      'Vite: unbundled dev server serving native browser ES Modules on demand',
      'esbuild (Go-based) for sub-second dependency pre-bundling',
      'HMR efficiency: updating individual modules without full dependency graph rebuilds'
    ],
    tags: ['tooling', 'vite', 'webpack', 'esbuild', 'bundling', 'hmr', 'esm']
  },
  {
    id: 'tool_02',
    category: 'tooling',
    topic: 'SemVer & Lockfile Determinism',
    difficulty: 'Senior',
    question: 'How does Semantic Versioning (SemVer) work, and why is npm ci with package-lock.json mandatory in CI/CD pipelines?',
    shortAnswer: 'SemVer is `MAJOR.MINOR.PATCH` (`BREAKING.FEATURE.FIX`). In `package.json`, caret `^1.2.3` allows minor/patch updates (`< 2.0.0`), while tilde `~1.2.3` allows patch updates only (`< 1.3.0`). `npm ci` is mandatory in CI/CD because it strictly installs exact dependencies from `package-lock.json` without modifying the lockfile, guaranteeing 100% reproducible, deterministic builds.',
    interviewAnswer: 'Package management in enterprise environments requires deterministic repeatability:\n1. **SemVer (`MAJOR.MINOR.PATCH`)**:\n   - `MAJOR` (e.g. `2.0.0`): Incompatible breaking API changes.\n   - `MINOR` (e.g. `1.1.0`): Backwards-compatible new features.\n   - `PATCH` (e.g. `1.0.1`): Backwards-compatible bug fixes.\n2. **Version Prefixes in package.json**:\n   - `^1.2.3` (Caret): Allows updates to latest minor/patch (`>= 1.2.3 < 2.0.0`).\n   - `~1.2.3` (Tilde): Allows updates to latest patch only (`>= 1.2.3 < 1.3.0`).\n   - `1.2.3` (Exact): Pin strictly to this exact version.\n3. **Lockfile (`package-lock.json` / `pnpm-lock.yaml`)**:\n   - Records the exact pinned version, sub-dependency tree, and SHA-512 integrity hashes for every package.\n4. **`npm install` vs `npm ci`**:\n   - `npm install`: Updates `package-lock.json` if matching semver ranges are available. Running this on CI can pull in a newly released broken sub-dependency that broke 10 minutes ago!\n   - `npm ci`: Deletes `node_modules` and strictly installs the exact versions in `package-lock.json`. If `package.json` and `package-lock.json` are out of sync, `npm ci` throws an error and fails the build.',
    spokenTip: 'Always use npm ci in CI/CD pipelines because it strictly installs the exact pinned versions from package-lock.json without modifying it.',
    example: {
      language: 'json',
      code: `// package.json vs package-lock.json
// package.json (Loose ranges)
{
  "dependencies": {
    "lodash": "^4.17.20" // Allows npm install to pull 4.17.21 automatically!
  }
}

// package-lock.json (Exact deterministic freeze)
{
  "packages": {
    "node_modules/lodash": {
      "version": "4.17.21",
      "resolved": "https://registry.npmjs.org/lodash/-/lodash-4.17.21.tgz",
      "integrity": "sha512-v2kDEe57lecTulaDIuNTPy3Ry4gLGJ6Z1O3vE1krgXZNrsQ+LFTGHVxVjcXPs17LhbZVGedAJv8XZ1tvj5FvSg=="
    }
  }
}

// CI/CD Script (GitHub Actions / GitLab CI):
// RUN: npm ci  <-- Guaranteed 100% deterministic build!`,
      explanation: 'Shows semver range in package.json versus exact integrity-hashed resolution in package-lock.json.'
    },
    seniorPoint: 'Never add `package-lock.json` to `.gitignore`. Without committing your lockfile, different team members and CI/CD pipelines will download differing transient sub-dependencies, causing "Works on my machine" bugs.',
    followUps: [
      {
        question: 'What is `npm audit` and how do you handle vulnerabilities in transitive dependencies?',
        answer: '`npm audit` checks dependencies against known CVE databases. For transitive dependencies, use the `overrides` (npm) or `resolutions` (yarn/pnpm) field in `package.json` to force a patched version of a sub-dependency.'
      },
      {
        question: 'Why is `pnpm` more disk and speed efficient than traditional `npm`?',
        answer: '`pnpm` uses a single global content-addressable storage store on disk, creating hard links in `node_modules` instead of duplicating gigabytes of packages across multiple projects.'
      }
    ],
    keyPointsToMention: [
      'SemVer structure: MAJOR (breaking), MINOR (features), PATCH (fixes)',
      'Prefixes: ^ (minor + patch) vs ~ (patch only) vs exact',
      'package-lock.json integrity hashes and dependency resolution trees',
      'npm ci (deterministic, fast, fails if out of sync) vs npm install (modifies lockfile)'
    ],
    tags: ['tooling', 'semver', 'npm', 'package-lock', 'ci-cd', 'dependencies', 'pnpm']
  }
];
