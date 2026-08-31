import { Question } from '../types';

export const htmlCssQuestions: Question[] = [
  {
    id: 'htmlcss_01',
    category: 'htmlcss',
    topic: 'Stacking Context & z-index',
    difficulty: 'Senior',
    question: 'How do Stacking Contexts work in CSS? Why does z-index: 9999 sometimes fail to appear on top, and how does isolation: isolate fix it?',
    shortAnswer: '`z-index` only compares elements within the *same* Stacking Context. If a parent element forms a lower stacking context (due to `opacity < 1`, `transform`, `filter`, or `contain`), its children are trapped inside it and cannot render above siblings in higher stacking contexts, regardless of having `z-index: 999999`. `isolation: isolate` creates a clean, independent stacking context boundary without side effects.',
    interviewAnswer: 'In CSS, elements are rendered in 3D layering along the z-axis based on Stacking Contexts:\n1. **The Root Stacking Context**: Formed by the `<html>` element.\n2. **Stacking Context Creation Triggers**:\n   - Positioned elements (`relative`, `absolute`, `fixed`, `sticky`) with a non-`auto` `z-index`.\n   - Elements with `opacity < 1`.\n   - Elements with `transform`, `filter`, `perspective`, `clip-path`, or `backdrop-filter`.\n   - Elements with `isolation: isolate` or `contain: paint`.\n   - Flexbox or Grid children with a non-`auto` `z-index`.\n\n**The z-index: 9999 Bug**:\nIf Card A has `z-index: 1` and Card B has `z-index: 2`, a tooltip inside Card A with `z-index: 9999` is strictly bounded by Card A\'s context. It will always render *underneath* Card B! To solve this, isolate stacking contexts cleanly using `isolation: isolate` or render modal/tooltip overlays at the document body root using portals/CDK overlays.',
    spokenTip: 'z-index is local to its parent stacking context. If the parent is behind a sibling, child z-index cannot escape it.',
    example: {
      language: 'css',
      code: `/* Stacking Context Isolation Example */
.card-container {
  /* ✅ Modern solution: Creates a clean isolated stacking context */
  isolation: isolate;
  position: relative;
}

.card-a {
  position: relative;
  z-index: 1; /* Stacking context #1 */
}

.card-a .tooltip {
  position: absolute;
  z-index: 99999; /* Trapped inside Card A! Cannot appear above Card B */
}

.card-b {
  position: relative;
  z-index: 2; /* Stacking context #2: Renders on top of Card A and all its children! */
}`,
      explanation: 'Illustrates how parent stacking contexts trap child z-index values, and how isolation: isolate sets clean boundaries.'
    },
    seniorPoint: 'Applying CSS animations with `transform` or `filter` dynamically creates a new stacking context on the fly during the animation, which can cause elements to suddenly jump beneath other elements.',
    followUps: [
      {
        question: 'Why do Angular CDK Overlay and React Portals render modals directly at `document.body`?',
        answer: 'To escape parent stacking contexts (`transform`, `overflow: hidden`, `opacity`) and guarantee modals and dropdowns render at the top-level root stacking context.'
      },
      {
        question: 'What is the difference between `z-index: auto` and `z-index: 0`?',
        answer: '`z-index: auto` does NOT create a new stacking context on positioned elements. `z-index: 0` DOES create a new stacking context on positioned elements.'
      }
    ],
    keyPointsToMention: [
      'z-index only applies within the same stacking context',
      'Triggers: opacity < 1, transform, filter, backdrop-filter, isolation: isolate',
      'Overlay portals/CDK as architectural solution for dropdowns/modals',
      'isolation: isolate creates local stacking boundaries without visual side effects'
    ],
    tags: ['css', 'stacking-context', 'z-index', 'isolation', 'layout', 'rendering']
  },
  {
    id: 'htmlcss_02',
    category: 'htmlcss',
    topic: 'Modern CSS Layouts & Container Queries',
    difficulty: 'Senior',
    question: 'Contrast CSS Grid and Flexbox for modern design systems. How do Container Queries (@container) and CSS Subgrid fundamentally change component-driven styling?',
    shortAnswer: 'Flexbox is 1-dimensional (content-out flow along row or column). CSS Grid is 2-dimensional (layout-in with explicit rows and columns). **Container Queries (`@container`)** style components based on the size of their parent container rather than the global browser viewport (`@media`). **CSS Subgrid (`grid-template-columns: subgrid`)** aligns nested child elements with the parent grid tracks.',
    interviewAnswer: 'Modern CSS layout architecture is built on complementary tools:\n- **Flexbox (1D - Content-Out)**: Perfect for distributing space along a single axis (navigation bars, chip lists, button groups, vertical centering). Sizing is determined by content.\n- **CSS Grid (2D - Layout-In)**: Perfect for complex two-dimensional layouts with aligned rows AND columns (dashboards, product cards, full-page structures).\n- **Container Queries (`@container`)**: Viewport media queries (`@media (min-width: 768px)`) break component modularity because a component in a sidebar has different available width than in the main column. With `container-type: inline-size`, components adapt dynamically to their immediate parent container width.\n- **CSS Subgrid (`subgrid`)**: Solves the alignment problem in card lists: child card headers, images, and footers align across cards regardless of differing text lengths.',
    spokenTip: 'Use Flexbox for 1D content alignment, Grid for 2D structured layouts, and Container Queries so components adapt to their parent container size.',
    example: {
      language: 'css',
      code: `/* 1. Container Queries: Component adapts to parent width */
.card-wrapper {
  container-type: inline-size;
  container-name: product-card;
}

.product-card {
  display: flex;
  flex-direction: column;
}

/* When the card container has at least 500px, switch to 2-column layout */
@container product-card (min-width: 500px) {
  .product-card {
    flex-direction: row;
    align-items: center;
  }
}

/* 2. CSS Subgrid: Align cards across grid rows */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  grid-auto-rows: auto auto 1fr auto; /* header, image, body, footer */
}

.card {
  display: grid;
  grid-row: span 4;
  grid-template-rows: subgrid; /* Inherits row track alignments! */
}`,
      explanation: 'Demonstrates Container Queries for modular component responsiveness and CSS Subgrid for multi-card row alignment.'
    },
    seniorPoint: 'Using `@media` queries forces design systems to create variant classes (`.card--sidebar`, `.card--fullwidth`). Container queries make components truly modular and self-responsive anywhere they are placed.',
    followUps: [
      {
        question: 'What is the difference between `container-type: inline-size` and `container-type: size`?',
        answer: '`inline-size` monitors only the horizontal axis (width), which is standard and avoids infinite layout loops. `size` monitors both width and height, requiring explicit container dimensions.'
      },
      {
        question: 'How do you create an intrinsically responsive grid without media queries?',
        answer: '`grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));` automatically wraps cards and expands columns based on available space.'
      }
    ],
    keyPointsToMention: [
      'Flexbox (1D content-driven) vs Grid (2D layout-driven)',
      'Container Queries (@container) decouple responsiveness from browser viewport',
      'container-type: inline-size setup',
      'Subgrid (grid-template-rows: subgrid) aligning nested child components across card rows'
    ],
    tags: ['css', 'flexbox', 'grid', 'container-queries', 'subgrid', 'responsive-design']
  },
  {
    id: 'htmlcss_03',
    category: 'htmlcss',
    topic: 'Specificity & Cascade Layers (@layer)',
    difficulty: 'Senior',
    question: 'How is CSS Specificity calculated? How do CSS Cascade Layers (@layer) solve specificity wars in large codebases?',
    shortAnswer: 'Specificity is a 3-column tuple `(Inline, IDs, Classes/Attributes/Pseudo-classes, Elements/Pseudo-elements)`. **Cascade Layers (`@layer`)** create an explicit hierarchy where styles in higher layers always override lower layers, regardless of the selector specificity inside those layers.',
    interviewAnswer: 'CSS specificity determines which rules apply when multiple selectors match an element:\n1. **Specificity Weight Matrix**: `(A, B, C)` where:\n   - `A`: ID selectors (`#header`) = `(1, 0, 0)`\n   - `B`: Classes, attribute selectors, pseudo-classes (`.btn`, `[type="text"]`, `:hover`) = `(0, 1, 0)`\n   - `C`: Element tags and pseudo-elements (`div`, `p`, `::before`) = `(0, 0, 1)`\n   - Inline styles (`style="..."`) override all standard selectors.\n   - `!important` overrides normal declarations.\n\n**The Specificity War Problem**:\nIn large projects with third-party libraries (Bootstrap, Tailwind, Angular Material), developers often write ugly selectors like `body .app-container .btn.btn-primary` or sprinkle `!important` to override library styles.\n\n**The Solution: Cascade Layers (`@layer`)**:\nCascade Layers establish an explicit layer order: `@layer reset, framework, components, utilities;`. Rules in `@layer utilities` **always beat** `@layer framework`, even if the framework selector has higher specificity (`#id.class`) and the utility is a simple `.text-center`!',
    spokenTip: 'Cascade layers let us define explicit layer priority, ending specificity wars between design libraries and custom components.',
    example: {
      language: 'css',
      code: `/* Define Layer Precedence (Order matters: right-most layer wins!) */
@layer reset, vendor, components, overrides;

@layer reset {
  button {
    padding: 0;
    border: none;
  }
}

@layer vendor {
  /* High specificity in vendor library */
  #main-content button.btn-primary {
    padding: 16px 24px;
    background-color: blue;
  }
}

@layer components {
  /* ✅ Wins over vendor layer despite lower specificity! */
  button {
    padding: 8px 12px;
    background-color: green;
  }
}

@layer overrides {
  .compact {
    padding: 4px 8px;
  }
}`,
      explanation: 'Demonstrates how @layer precedence overrides higher-specificity selectors in lower layers.'
    },
    seniorPoint: 'Unlayered CSS styles (styles written outside any `@layer`) take precedence over all layered styles. This ensures that legacy CSS and quick overrides continue to work seamlessly during migration to `@layer`.',
    followUps: [
      {
        question: 'How does `!important` interact with `@layer`?',
        answer: '`!important` reverses the layer cascade order! An `!important` declaration in `@layer reset` will override an `!important` declaration in `@layer components`.'
      },
      {
        question: 'Does the `:where()` pseudo-class add specificity?',
        answer: 'No. `:where()` has `(0, 0, 0)` specificity, making it ideal for base library defaults that developers can override with a single class.'
      }
    ],
    keyPointsToMention: [
      'Specificity calculation: (Inline, IDs, Classes/Attributes, Elements)',
      ':where() adds 0 specificity vs :is() takes highest specificity of arguments',
      'Cascade Layers (@layer) establish explicit priority above specificity',
      'Unlayered CSS rules beat all layered CSS rules'
    ],
    tags: ['css', 'specificity', 'cascade-layers', 'architecture', 'design-systems']
  },
  {
    id: 'htmlcss_04',
    category: 'htmlcss',
    topic: 'CSS Custom Properties & Dynamic Theming',
    difficulty: 'Senior',
    question: 'How do CSS Custom Properties (Variables) differ from preprocessor variables (Sass/SCSS)? How do you build a dynamic dark/light theme system in TypeScript?',
    shortAnswer: 'Sass variables (`$color`) are compiled at build time into static CSS and cannot change at runtime. CSS Custom Properties (`--color: #fff`) live in the live browser DOM, respect the cascade, inherit down the tree, and can be read/updated dynamically at runtime via JavaScript and media queries.',
    interviewAnswer: 'CSS Custom Properties represent a massive shift in styling architecture:\n1. **Runtime vs Build-Time**: Sass `$primary: blue` vanishes into hardcoded hex values in the final `.css` file. CSS variables (`var(--primary)`) remain live in the CSSOM and can be updated instantly via `document.documentElement.style.setProperty(\'--primary\', \'#6366f1\')` without recompiling CSS.\n2. **DOM Cascade & Scoping**: A CSS variable defined on `:root` is global. However, you can override `--badge-color` on a specific `.card` or `:host` element, and all children inside that subtree will inherit the overridden value.\n3. **Modern Theming**: Define color tokens using HSL/RGB channels (`--bg-rgb: 15, 23, 42`). This allows dynamic opacity adjustments (`rgba(var(--bg-rgb), 0.8)`) and seamless Dark Mode toggling using `@media (prefers-color-scheme: dark)` or `[data-theme="dark"]` attribute selectors.',
    spokenTip: 'CSS variables live in the browser DOM and respect the cascade, making dynamic theming and JavaScript runtime styling effortless without recompiling CSS.',
    example: {
      language: 'css',
      code: `/* 1. Global Theming Tokens */
:root {
  --bg-primary: #ffffff;
  --text-primary: #0f172a;
  --accent: #4f46e5;
  --accent-rgb: 79, 70, 229;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --text-primary: #f8fafc;
  --accent: #818cf8;
  --accent-rgb: 129, 140, 248;
}

/* 2. Usage with alpha opacity */
.modal-backdrop {
  background-color: rgba(var(--accent-rgb), 0.15);
  color: var(--text-primary);
}

/* 3. Component-level local override */
.warning-box {
  --accent: #ef4444; /* Local cascade override for this box and its children! */
}`,
      explanation: 'Shows theme switching via data-theme attribute, RGB channel opacity support, and local cascade overrides.'
    },
    seniorPoint: 'Accessing or changing CSS variables in JavaScript (`getComputedStyle(el).getPropertyValue(...)`) causes a synchronous style calculation. Avoid calling this inside high-frequency animation loops.',
    followUps: [
      {
        question: 'How do you provide a fallback default if a CSS variable is undefined?',
        answer: 'Pass a second argument to `var()`: `color: var(--theme-color, #3b82f6)`.'
      },
      {
        question: 'What is the CSS `@property` rule (Houdini)?',
        answer: '`@property --my-color { syntax: "<color>"; inherits: false; initial-value: red; }` registers custom properties with strict type definitions, enabling smooth CSS transition animations between gradient and color variables.'
      }
    ],
    keyPointsToMention: [
      'Live in browser CSSOM vs static Sass build-time compilation',
      'Cascade and inheritance behavior at element level',
      'Dynamic theming via data-theme attributes and prefers-color-scheme',
      'CSS Houdini @property for typed animatable custom properties'
    ],
    tags: ['css', 'custom-properties', 'theming', 'dark-mode', 'css-variables', 'houdini']
  },
  {
    id: 'htmlcss_05',
    category: 'htmlcss',
    topic: 'Rendering Optimization & content-visibility',
    difficulty: 'Senior',
    question: 'How does content-visibility: auto dramatically accelerate long-page rendering, and why is contain-intrinsic-size mandatory with it?',
    shortAnswer: '`content-visibility: auto` tells the browser to skip layout and painting for off-screen DOM elements until the user scrolls near them, reducing initial page load rendering time by up to 70%. `contain-intrinsic-size` specifies placeholder dimensions (e.g. `500px`) so the scrollbar doesn’t jump or shrink unexpectedly as off-screen elements enter the viewport.',
    interviewAnswer: 'On pages rendering hundreds of complex cards, tables, or long comment feeds, the browser spends substantial time calculating layout geometry and rasterizing pixels for elements far below the fold:\n\n1. **`content-visibility: auto`**: Turns on layout containment and paint containment for off-screen elements. The browser constructs the DOM node, but completely bypasses layout, styling, and paint until the element approaches the viewport.\n2. **The Scrollbar Jump Problem**: Because off-screen elements are treated as having 0px height, the browser scrollbar shrinks to the top. As the user scrolls down, elements suddenly expand, causing jarring layout shifts and scroll jumps.\n3. **The Solution (`contain-intrinsic-size`)**: By pairing `content-visibility: auto; contain-intrinsic-size: 0 450px;`, we give the browser an estimated placeholder height. The scrollbar remains stable, and initial First Contentful Paint (FCP) and Time to Interactive (TTI) improve dramatically.',
    spokenTip: 'Use content-visibility: auto with contain-intrinsic-size to skip rendering off-screen elements without causing scrollbar jumping.',
    example: {
      language: 'css',
      code: `/* High-performance long list rendering */
.feed-item {
  /* Skips layout and paint when scrolled off-screen */
  content-visibility: auto;

  /* Estimated placeholder dimensions to preserve authentic scrollbar travel */
  contain-intrinsic-size: auto 320px;

  /* Card visual styling */
  padding: 1.5rem;
  margin-bottom: 1rem;
  background-color: #1e293b;
  border-radius: 0.75rem;
}`,
      explanation: 'Applies content-visibility: auto and contain-intrinsic-size to optimize long feed rendering.'
    },
    seniorPoint: '`content-visibility: hidden` can be used instead of `display: none` for tabs or accordion panels: it hides the content from view and skips painting, but keeps cached rendering state in memory so opening the panel is instantaneous.',
    followUps: [
      {
        question: 'Does `content-visibility: auto` hide content from browser in-page search (Ctrl+F)?',
        answer: 'No! Modern browsers still index the text inside `content-visibility: auto` elements for in-page search, automatically expanding and scrolling to matching elements when found.'
      },
      {
        question: 'How does `content-visibility` compare to JavaScript Virtual Scrolling?',
        answer: '`content-visibility` is native CSS and handles in-page search, accessibility, and SEO naturally. Virtual scrolling removes DOM nodes entirely with JavaScript, which is lighter on RAM for 100,000+ items but requires custom accessibility handling.'
      }
    ],
    keyPointsToMention: [
      'content-visibility: auto skips layout and paint for off-screen elements',
      'contain-intrinsic-size provides placeholder dimensions to stabilize the scrollbar',
      'Retains accessibility and Ctrl+F in-page search support',
      'Comparison with JavaScript-based Virtual Scrolling'
    ],
    tags: ['css', 'performance', 'content-visibility', 'containment', 'layout-shifts', 'rendering']
  }
];
