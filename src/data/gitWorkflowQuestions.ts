import { Question } from '../types';

export const gitWorkflowQuestions: Question[] = [
  {
    id: 'git_01',
    category: 'gitworkflow',
    topic: 'Trunk-Based vs GitFlow & Merge vs Rebase',
    difficulty: 'Senior',
    question: 'Contrast Trunk-Based Development with GitFlow for modern frontend teams. What are the pros and cons of git merge vs git rebase?',
    shortAnswer: 'Trunk-Based Development uses short-lived feature branches (< 2 days) merged frequently into `main` behind Feature Flags, enabling continuous delivery. GitFlow uses long-lived `develop`, `release`, and `hotfix` branches, introducing merge debt and slow releases. `git merge` preserves full history with a merge commit; `git rebase` rewrites commits on top of the target branch for a clean, linear git history.',
    interviewAnswer: 'Branching strategies directly determine team velocity:\n1. **Trunk-Based vs GitFlow**:\n   - *GitFlow*: High ceremony with multiple parallel long-lived branches (`develop`, `feature/*`, `release/*`, `master`). Leads to painful merge conflicts, delayed feedback, and "integration hell".\n   - *Trunk-Based Development*: Developers work on small feature branches that live < 24-48 hours and merge directly into `main`. Large incomplete features are safely hidden behind client-side or server-side **Feature Flags** (LaunchDarkly / Unleash).\n2. **Merge vs Rebase**:\n   - `git merge main`: Creates a new merge commit. Non-destructive and preserves exact historical timeline, but creates cluttered commit graphs.\n   - `git rebase main`: Re-plays your feature commits on top of latest `main`. Produces a completely linear history, making `git bisect` trivial for debugging regressions.\n   - *Golden Rule of Rebase*: Never rebase a public shared branch (like `main` or `develop`). Only rebase your local unmerged feature branch.',
    spokenTip: 'Trunk-based development with short-lived branches and linear squash merges is the gold standard for high-velocity teams.',
    example: {
      language: 'shell',
      code: `# Keeping local feature branch up to date with linear history:
git checkout feature/user-profile
git fetch origin
git rebase origin/main

# If conflicts occur:
# 1. Resolve conflict markers in files
git add .
git rebase --continue

# Interactive rebase to clean up messy local commits before PR:
git rebase -i HEAD~3
# (Mark commits as 'pick', 'squash', or 'fixup')`,
      explanation: 'Shows commands for rebasing local feature branch on origin/main and interactive commit squashing.'
    },
    seniorPoint: 'Modern high-performing teams use **Squash and Merge** on GitHub/GitLab PRs: all 15 messy work-in-progress commits on a feature branch are squashed into a single clean, atomic commit on `main`, keeping the trunk linear and easy to revert with `git revert <commit-id>`.',
    followUps: [
      {
        question: 'How does `git bisect` work to find regressions?',
        answer: '`git bisect` performs a binary search through commit history between a known good commit and bad commit, checking out intermediate commits to pinpoint the exact commit that introduced a bug in O(log N) time.'
      },
      {
        question: 'What is the difference between `git pull` and `git pull --rebase`?',
        answer: '`git pull` runs `git fetch` followed by `git merge` (creating a merge commit). `git pull --rebase` runs `git fetch` and then rebases your local commits on top of the remote branch, avoiding clutter merge commits.'
      }
    ],
    keyPointsToMention: [
      'Trunk-Based Development: short-lived feature branches (<48h) + Feature Flags',
      'GitFlow drawbacks: long-lived branch merge debt and slow release cadence',
      'Rebase creates clean linear history; Merge preserves real timeline',
      'Golden Rule of Rebasing: never rebase public shared branches',
      'Squash and merge for clean PR history'
    ],
    tags: ['git', 'gitworkflow', 'trunk-based', 'gitflow', 'rebase', 'merge', 'ci-cd']
  },
  {
    id: 'git_02',
    category: 'gitworkflow',
    topic: 'Conventional Commits & Automated Quality Gates',
    difficulty: 'Senior',
    question: 'How do you set up an automated frontend quality gate using Conventional Commits, Husky, lint-staged, and Semantic Release?',
    shortAnswer: 'Husky configures Git hooks (`pre-commit`, `commit-msg`). `lint-staged` runs ESLint, Prettier, and type-checks strictly on staged files for sub-second feedback. `commitlint` enforces Conventional Commit formats (`feat:`, `fix:`, `refactor:`), allowing tools like Semantic Release to automatically compute SemVer versions, generate changelogs, and deploy tags in CI/CD.',
    interviewAnswer: 'Automating code quality before code reaches the repository:\n1. **Pre-commit Hook (Husky + `lint-staged`)**: When the developer runs `git commit`, Husky intercepts. `lint-staged` runs `eslint --fix` and `prettier --write` only on the modified files in the git index, preventing malformed code from ever entering git history.\n2. **Commit-msg Hook (`commitlint`)**: Enforces `type(scope): subject` syntax (`feat(auth): add biometric login`, `fix(cart): resolve discount calculation`).\n3. **Automated CI/CD Release (Semantic Release)**: In GitHub Actions, Semantic Release inspects commit messages on `main`:\n   - `fix:` triggers a `PATCH` release (`1.0.1`)\n   - `feat:` triggers a `MINOR` release (`1.1.0`)\n   - `BREAKING CHANGE:` triggers a `MAJOR` release (`2.0.0`)\nThis automates semantic versioning, GitHub releases, and changelog generation without human error.',
    spokenTip: 'Catch formatting and type errors on pre-commit with Husky and lint-staged; automate versioning with Conventional Commits.',
    example: {
      language: 'json',
      code: `// package.json configuration for Husky & lint-staged
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx,js}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,html,json}": [
      "prettier --write"
    ]
  }
}

// Example Conventional Commit Message:
// feat(checkout): add Apple Pay one-click payment
// 
// BREAKING CHANGE: replaces legacy payment tokens with PaymentMethod IDs`,
      explanation: 'Configuration for Husky pre-commit hooks, lint-staged filters, and conventional commit structure.'
    },
    seniorPoint: 'Running linters across an entire 200,000-line repository on every commit is too slow and frustrates developers. `lint-staged` filters execution strictly to files in the git index (`git status`), keeping pre-commit verification sub-second.',
    followUps: [
      {
        question: 'How do you run TypeScript type checking in `lint-staged`?',
        answer: 'TypeScript (`tsc --noEmit`) cannot check isolated individual files because it needs full project context. Configure a script: `"*.{ts,tsx}": () => "tsc -p tsconfig.json --noEmit"`.'
      },
      {
        question: 'What is the purpose of `commitizen`?',
        answer: 'An interactive CLI prompt (`git cz`) that guides developers to format Conventional Commits with proper types, scopes, and breaking change warnings.'
      }
    ],
    keyPointsToMention: [
      'Husky for Git hook orchestration (pre-commit, commit-msg)',
      'lint-staged for performance (analyzing only staged git files)',
      'Conventional Commits spec (feat, fix, docs, style, refactor, test, chore)',
      'Semantic Release automated versioning and changelog generation based on commit history'
    ],
    tags: ['gitworkflow', 'husky', 'lint-staged', 'conventional-commits', 'semantic-release', 'dx']
  }
];
