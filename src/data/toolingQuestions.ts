import { Question } from '../types';

export const toolingQuestions: Question[] = [
  {
    id: 'tool_01',
    category: 'tooling',
    topic: 'Bundlers: Vite vs Webpack vs esbuild',
    difficulty: 'Senior',
    question: 'How do modern bundlers like Vite and Angular CLI (esbuild/Vite-based) achieve near-instant development startup compared to legacy Webpack?',
    shortAnswer: 'Legacy Webpack bundles the entire application before starting the dev server. Vite and modern Angular CLI leverage native browser ES Modules (`<script type="module">`): in dev mode, they pre-bundle third-party dependencies using ultra-fast Go-based `esbuild`, and serve application source files unbundled on demand as requested by browser HTTP requests.',
    seniorPoint: 'In Vite dev mode, file changes don\'t trigger a full re-bundle; only the single edited file is transformed and pushed via Hot Module Replacement (HMR), keeping feedback cycles constant whether the app has 10 components or 10,000.',
    spokenTip: 'Vite transforms files on-demand over native ESM instead of bundling the whole dependency graph upfront.',
    interviewAnswer: '1. **Legacy Webpack Dev Server**: Crawls the entire import graph, parses and compiles every TypeScript file, and bundles them into large in-memory files before the server can start. As apps grow, dev server boot time balloons to minutes.\n2. **Vite / Modern Angular CLI Architecture**:\n   - **Dependency Pre-bundling**: Uses `esbuild` (written in Go, 10-100x faster than JS bundlers) to convert CommonJS dependencies into single ESM files once and caches them.\n   - **Native ESM Source Serving**: Browser requests individual `.ts` files on demand as imports are encountered. Vite simply transforms the requested `.ts` file into `.js` on the fly and returns it with appropriate MIME types.\n   - **Production**: Uses Rollup or esbuild for optimized tree-shaking, code-splitting, and minification.',
    keyPointsToMention: [
      'Native ES Modules in the browser for unbundled on-demand compilation',
      'esbuild for dependency pre-bundling',
      'Vite vs Webpack build-time scaling differences',
      'Production bundling with Rollup / esbuild'
    ],
    whatInterviewersLookFor: [
      'Understanding why native ESM dev servers scale independently of app size',
      'Knowledge of source map configuration and production minification'
    ],
    codeExample: `// vite.config.ts production optimization configuration
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: 'hidden', // Generates maps for Sentry/error reporting without exposing them in browser DevTools
    rollupOptions: {
      output: {
        manualChunks: {
          // Explicit vendor code-splitting
          vendor: ['react', 'react-dom'],
          charts: ['recharts', 'd3']
        }
      }
    }
  }
});`,
    tags: ['tooling', 'vite', 'webpack', 'esbuild', 'bundling', 'esm', 'hmr']
  },
  {
    id: 'tool_02',
    category: 'tooling',
    topic: 'Package Management & SemVer',
    difficulty: 'Senior',
    question: 'Explain Semantic Versioning (SemVer), caret (`^`) vs tilde (`~`), `peerDependencies`, and why committing `package-lock.json` is mandatory in CI/CD.',
    shortAnswer: 'SemVer uses `MAJOR.MINOR.PATCH` (Breaking.Features.Bugfixes). Caret (`^1.2.3`) permits updates to the same major version (`<2.0.0`); tilde (`~1.2.3`) permits updates to the same minor version (`<1.3.0`). `peerDependencies` declare expected host package versions without bundling them. Committing `package-lock.json` guarantees deterministic, byte-for-byte identical dependency trees across developers and CI builds via `npm ci`.',
    seniorPoint: 'Running `npm install` in CI without `package-lock.json` (or using `npm install` instead of `npm ci`) will auto-resolve newer minor/patch releases of sub-dependencies, causing unpredictable production build breaks due to unvetted upstream releases.',
    spokenTip: 'Always use `npm ci` in automated pipelines to ensure lockfile fidelity.',
    interviewAnswer: '1. **SemVer (`MAJOR.MINOR.PATCH`)**:\n   - `PATCH`: Backwards-compatible bug fixes.\n   - `MINOR`: Backwards-compatible new features.\n   - `MAJOR`: Breaking API changes.\n2. **Version Prefixes**:\n   - `^1.2.3`: Allows `>=1.2.3 <2.0.0`\n   - `~1.2.3`: Allows `>=1.2.3 <1.3.0`\n   - Exact `1.2.3`: Locks to that specific release.\n3. **`peerDependencies`**: Used in plugin/library development (e.g. Angular CDK) to require the host app to provide a compatible version of `@angular/core` rather than installing duplicate copies.\n4. **`package-lock.json` & `npm ci`**: The lockfile records the exact resolved version, SHA hash, and transitive dependency tree. In CI/CD, always run `npm ci` (clean install), which strictly respects the lockfile and refuses to update it.',
    keyPointsToMention: [
      'SemVer rules: Major (breaking), Minor (feature), Patch (fix)',
      '^ allows minor+patch, ~ allows patch only',
      'peerDependencies for library plugin ecosystems',
      'npm ci vs npm install in CI/CD pipelines'
    ],
    whatInterviewersLookFor: [
      'Understanding why npm ci is required in automated build pipelines',
      'Knowledge of transitive dependency vulnerability remediation'
    ],
    codeExample: `// package.json dependency specifications
{
  "dependencies": {
    "@angular/core": "^18.2.0" // Allows 18.2.1, 18.3.0, but NOT 19.0.0
  },
  "devDependencies": {
    "typescript": "~5.5.2"    // Allows 5.5.3, 5.5.4, but NOT 5.6.0
  },
  "peerDependencies": {
    "rxjs": "^7.8.0"          // Host application must provide RxJS 7.x
  }
}`,
    tags: ['tooling', 'npm', 'semver', 'package-lock', 'ci-cd', 'peer-dependencies']
  }
];
