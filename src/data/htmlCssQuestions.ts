import { Question } from '../types';

export const htmlCssQuestions: Question[] = [
  {
    id: 'css_01',
    category: 'htmlcss',
    topic: 'Stacking Context & z-index',
    difficulty: 'Senior',
    question: 'How is a Stacking Context formed in CSS, and why does setting `z-index: 9999` often fail to bring an element above other elements?',
    shortAnswer: '`z-index` only compares elements within the same stacking context. If a parent element forms its own stacking context with a lower z-index (or no z-index in the root), no child element—regardless of `z-index: 999999`—can ever escape or render above sibling stacking contexts that sit higher in the document tree.',
    seniorPoint: 'A new stacking context is created not just by positioned elements with `z-index`, but also by modern CSS properties: `opacity < 1`, `transform`, `filter`, `perspective`, `clip-path`, `will-change`, and `isolation: isolate`. Using `isolation: isolate` is the modern, clean way to create local stacking contexts without hacky z-indexes.',
    spokenTip: '`z-index` is not global; it is strictly local to its nearest ancestor stacking context.',
    interviewAnswer: 'When elements overlap, the browser renders them along the Z-axis according to stacking context hierarchy. If an element has `z-index: 9999` but is nested inside Parent A (which is at `z-index: 1`), and Parent B is at `z-index: 2`, Parent B and all its children will always render on top of our element.\n\nStacking contexts are triggered by:\n1. Root element `<html>`\n2. Positioned elements (`relative`, `absolute`, `fixed`, `sticky`) with `z-index` other than `auto`\n3. `opacity` less than 1\n4. CSS `transform`, `filter`, `clip-path`, `perspective`\n5. `isolation: isolate`\n\nTo debug stacking wars in design systems, avoid arbitrary large z-indexes (99999), create clean local contexts using `isolation: isolate`, and maintain a central design-token z-index scale (e.g. dropdown: 100, modal: 1000, toast: 2000).',
    keyPointsToMention: [
      'Stacking contexts are hierarchical and isolated',
      'Common triggers: opacity < 1, transform, filter, will-change, and isolation: isolate',
      'Why z-index: 9999 fails when trapped in a lower parent stacking context',
      'Design token scales for modal, tooltip, popover, and dropdown layers'
    ],
    whatInterviewersLookFor: [
      'Understanding that transform / filter silently triggers a new stacking context',
      'Modern solution: isolation: isolate'
    ],
    codeExample: `/* Problem: Child cannot escape parent's stacking context */
.parent-a {
  position: relative;
  z-index: 1; /* Establishes Stacking Context 1 */
}

.child-a {
  position: absolute;
  z-index: 999999; /* Trapped inside Context 1! Cannot overlap parent-b */
}

.parent-b {
  position: relative;
  z-index: 2; /* Sits higher than parent-a and all parent-a children */
}

/* Modern Clean Stacking Management */
.modal-overlay {
  isolation: isolate; /* Creates clean local boundary without side effects */
  z-index: var(--z-modal); /* e.g. 1000 */
}`,
    tags: ['htmlcss', 'z-index', 'stacking-context', 'isolation', 'css-layout']
  },
  {
    id: 'css_02',
    category: 'htmlcss',
    topic: 'Flexbox vs CSS Grid & Container Queries',
    difficulty: 'Senior',
    question: 'Contrast Flexbox (1D) vs CSS Grid (2D). When should you use Grid vs Flexbox, and how do modern Container Queries (`@container`) replace media queries in component architecture?',
    shortAnswer: 'Flexbox is one-dimensional (row OR column), ideal for content-driven alignment, toolbars, and dynamic item wrapping. CSS Grid is two-dimensional (rows AND columns simultaneously), ideal for layout-driven page structures, bento grids, and precise alignment. Container Queries (`@container`) allow components to adapt their layout based on their parent container width rather than the global viewport width.',
    seniorPoint: 'Media queries break component encapsulation: a card component in a narrow sidebar shouldn\'t display wide desktop styles just because the user has a 4K monitor. `@container` enables true micro-layouts where components adapt anywhere they are embedded.',
    spokenTip: 'Flexbox for micro-alignments in 1D; Grid for 2D structural frameworks; Container Queries for truly responsive, portable components.',
    interviewAnswer: '1. **Flexbox**: Content-out layout. Items dictate their size and flex along one axis (main axis). Perfect for navigation bars, button groups, icon+label alignment, and card rows.\n2. **CSS Grid**: Layout-in design. You define the 2D grid structure (tracks, gutters, `minmax()`, `grid-template-areas`) and place content inside. Perfect for whole-page layouts, dashboards, complex forms, and responsive photo galleries with `grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`.\n3. **Container Queries (`@container`)**: Media queries query the whole viewport (`@media (min-width: 768px)`), which is rigid. By applying `container-type: inline-size` to a wrapper, child components query their direct container width (`@container (min-width: 400px)`), allowing the exact same component to be rendered in a main feed or a sidebar seamlessly.',
    keyPointsToMention: [
      '1D (Flexbox) vs 2D (Grid)',
      'auto-fill vs auto-fit in CSS Grid',
      'Container Queries syntax: container-type: inline-size and @container',
      'Component modularity without relying on viewport media queries'
    ],
    whatInterviewersLookFor: [
      'Deep appreciation for component-first responsive design',
      'Familiarity with repeat(auto-fit, minmax(...)) responsive grid pattern'
    ],
    codeExample: `/* 1. Responsive Grid without Media Queries */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* 2. Container Queries (Modular Component Architecture) */
.card-wrapper {
  container-type: inline-size;
  container-name: product-card;
}

.product-card {
  display: flex;
  flex-direction: column; /* Default: compact vertical stack */
}

/* When the container itself (sidebar or main feed) is >= 500px */
@container product-card (min-width: 500px) {
  .product-card {
    flex-direction: row; /* Switches to horizontal layout */
    align-items: center;
  }
}`,
    tags: ['htmlcss', 'flexbox', 'css-grid', 'container-queries', 'responsive-design']
  },
  {
    id: 'css_03',
    category: 'htmlcss',
    topic: 'Specificity, Cascade Layers & CSS Architecture',
    difficulty: 'Senior',
    question: 'How is CSS Specificity calculated, and how do modern Cascade Layers (`@layer`) eliminate specificity wars in large enterprise codebases?',
    shortAnswer: 'Specificity is calculated as a 3-part tuple: `(ID, Class/Attribute/Pseudo-class, Element/Pseudo-element)`. Inline styles and `!important` override normal specificity. CSS Cascade Layers (`@layer reset, base, components, utilities`) define explicit priority orders: rules in a higher layer always beat rules in lower layers regardless of selector specificity.',
    seniorPoint: 'In large design systems, developers used to add higher specificity hacks (`.btn.btn.btn-primary` or `!important`) to override reset styles. With `@layer`, unlayered styles win over layered styles, and explicit layer order controls overrides cleanly.',
    spokenTip: 'Specificity is a tuple of (IDs, Classes, Elements); Cascade Layers allow us to declare architectural precedence without specificity inflation.',
    interviewAnswer: 'CSS Specificity scoring:\n- **(1, 0, 0)**: ID selectors (`#header`)\n- **(0, 1, 0)**: Class (`.btn`), attribute (`[type="text"]`), and pseudo-classes (`:hover`, `:first-child`)\n- **(0, 0, 1)**: Element (`div`, `h1`) and pseudo-elements (`::before`)\n- Universal selector `*`, `:where()`, and combinators (`+`, `>`, `~`) have **0** specificity.\n\n**Cascade Layers (`@layer`)**: In modern enterprise CSS, we declare layer priority at the top: `@layer reset, theme, components, utilities;`. A simple `.btn` selector in `@layer utilities` will effortlessly override a heavy `#nav .sidebar div.active.btn` in `@layer components` without needing `!important` or selector bloat.',
    keyPointsToMention: [
      'Specificity tuple: (ID, Class, Element)',
      ':where() has 0 specificity; :is() takes the highest specificity of its arguments',
      'Cascade Layers @layer for managing design system hierarchy',
      'The harmful cycle of !important and specificity inflation'
    ],
    whatInterviewersLookFor: [
      'Knowledge of modern CSS standards (:where, :is, @layer)',
      'Strategies for architecting large maintainable CSS codebases'
    ],
    codeExample: `/* Declare Cascade Layer hierarchy */
@layer reset, framework, components, utilities;

@layer framework {
  /* Heavy selector in framework layer */
  nav.navbar > ul.menu-list > li.active > a {
    color: #333;
    padding: 10px;
  }
}

@layer utilities {
  /* Simple class in higher layer ALWAYS WINS, regardless of low specificity! */
  .text-primary {
    color: #3b82f6;
  }
}

/* Zero-specificity helper with :where() */
:where(button, input, select) {
  margin: 0; /* Easy for consumers to override without fighting specificity */
}`,
    tags: ['htmlcss', 'specificity', 'cascade-layers', 'css-architecture', 'design-systems']
  }
];
