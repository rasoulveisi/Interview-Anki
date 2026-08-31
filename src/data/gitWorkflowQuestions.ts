import { Question } from '../types';

export const gitWorkflowQuestions: Question[] = [
  {
    id: 'git_01',
    category: 'gitworkflow',
    topic: 'Branching: Trunk-Based vs GitFlow & Merge vs Rebase',
    difficulty: 'Senior',
    question: 'Contrast Trunk-Based Development with GitFlow for modern frontend teams. What are the pros and cons of `git merge` vs `git rebase`?',
    shortAnswer: 'Trunk-Based Development uses short-lived feature branches merged frequently into `main` behind Feature Flags, enabling continuous delivery. GitFlow uses long-lived `develop`, `release`, and `hotfix` branches, introducing merge debt and slow releases. `git merge` preserves full branch history with a merge commit; `git rebase` rewrites commits on top of the target branch for a clean, linear git history.',
    seniorPoint: 'Golden Rule of Rebase: Never rebase a public shared branch (like `main` or `develop`). Only rebase your local unmerged feature branch to pull in upstream updates before opening or merging a PR.',
    spokenTip: 'Trunk-based development with short-lived branches and linear squash merges is the gold standard for high-velocity teams.',
    interviewAnswer: '1. **Trunk-Based vs GitFlow**:\n   - *GitFlow*: High ceremony with multiple parallel long-lived branches (`develop`, `feature/*`, `release/*`, `master`). Leads to painful merge conflicts and delayed feedback.\n   - *Trunk-Based Development*: Developers work on small feature branches that live < 24-48 hours and merge directly into `main`. Large incomplete features are safely hidden behind client-side or server-side Feature Flags.\n2. **Merge vs Rebase**:\n   - `git merge main`: Creates a new merge commit. Non-destructive and preserves exact historical timeline, but creates cluttered commit graphs.\n   - `git rebase main`: Re-plays your feature commits on top of latest `main`. Produces a completely linear history, making `git bisect` trivial for debugging regressions.\n   - *Best Practice*: Rebase locally during development, and use **Squash and Merge** on GitHub/GitLab PRs to keep the `main` branch clean and atomic.',
    keyPointsToMention: [
      'Trunk-Based Development enables fast CI/CD and smaller PR review sizes',
      'Feature Flags to decouple deployment from release',
      'Rebase creates clean linear history; Merge preserves real timeline',
      'Squash and Merge on pull requests'
    ],
    whatInterviewersLookFor: [
      'Understanding of the Golden Rule of Rebasing (never rebase shared public branches)',
      'Practical familiarity with Feature Flags in trunk-based workflows'
    ],
    codeExample: `# Keeping feature branch up to date with linear history:
git checkout feature/user-profile
git fetch origin
git rebase origin/main

# If conflicts occur:
# 1. Resolve conflict in files
git add .
git rebase --continue

# Interactive rebase to clean up messy local commits before PR:
git rebase -i HEAD~3
# (Mark commits as 'pick', 'squash', or 'fixup')`,
    tags: ['gitworkflow', 'git', 'trunk-based', 'gitflow', 'rebase', 'merge', 'ci-cd']
  },
  {
    id: 'git_02',
    category: 'gitworkflow',
    topic: 'Conventional Commits & Automated Git Hooks',
    difficulty: 'Senior',
    question: 'How do you set up an automated frontend quality gate using Conventional Commits, Husky, `lint-staged`, and Semantic Release?',
    shortAnswer: 'Automate quality before code hits GitHub: Husky configures Git hooks (`pre-commit`, `commit-msg`). `lint-staged` runs ESLint, Prettier, and type-checks only on staged files for instant feedback. `commitlint` enforces Conventional Commit formats (`feat:`, `fix:`, `refactor:`), allowing tools like Semantic Release to automatically compute the next SemVer version, generate changelogs, and deploy tags in CI.',
    seniorPoint: 'Running linters across an entire 200,000-line repository on every commit is too slow. `lint-staged` filters execution strictly to files in the git index (`git status`), keeping commits sub-second.',
    spokenTip: 'Catch formatting and type errors on pre-commit with Husky and lint-staged; automate versioning with Conventional Commits.',
    interviewAnswer: 'A modern frontend team workflow:\n1. **Pre-commit Hook (Husky + lint-staged)**: When the developer runs `git commit`, Husky intercepts. `lint-staged` runs `eslint --fix` and `prettier --write` only on the modified files, preventing malformed code from ever entering git history.\n2. **Commit-msg Hook (commitlint)**: Enforces `type(scope): subject` syntax (`feat(auth): add biometric login`).\n3. **Automated CI/CD Release**: In GitHub Actions, Semantic Release inspects commit messages:\n   - `fix:` triggers a `PATCH` release (`1.0.1`)\n   - `feat:` triggers a `MINOR` release (`1.1.0`)\n   - `BREAKING CHANGE:` triggers a `MAJOR` release (`2.0.0`)\nThis automates semantic versioning and changelog generation without human error.',
    keyPointsToMention: [
      'Husky for Git hook orchestration',
      'lint-staged for performance (analyzing only staged git files)',
      'Conventional Commits spec (feat, fix, docs, style, refactor, test, chore)',
      'Semantic Release automated versioning based on commit history'
    ],
    whatInterviewersLookFor: [
      'Holistic developer experience (DX) and automated release pipeline design'
    ],
    codeExample: `// package.json configuration for Husky & lint-staged
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
    tags: ['gitworkflow', 'husky', 'lint-staged', 'conventional-commits', 'semantic-release', 'dx']
  }
];
