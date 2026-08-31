import { Question } from '../types';

export const a11yQuestions: Question[] = [
  {
    id: 'a11y_01',
    category: 'a11y',
    topic: 'Accessible Modals & Focus Trapping',
    difficulty: 'Senior',
    question: 'How do you build a fully accessible Modal/Dialog compliant with WAI-ARIA guidelines? Detail focus trapping, keyboard navigation, and screen reader attributes.',
    shortAnswer: 'An accessible modal requires: 1) `role="dialog"` or `role="alertdialog"`, 2) `aria-modal="true"`, 3) `aria-labelledby` pointing to the title ID, 4) **Focus Trap** (trapping Tab/Shift+Tab inside the modal), 5) Setting initial focus on the first interactive element, 6) Closing on `Escape` key, 7) Restoring focus to the triggering button upon closing, and 8) `aria-hidden="true"` or `inert` on background content.',
    interviewAnswer: 'Building an accessible modal involves both ARIA semantics and active focus management:\n1. **WAI-ARIA Roles & Labels**:\n   - Container attributes: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title-id"`, `aria-describedby="modal-desc-id"`.\n2. **Background Inactivity (`inert` / `aria-hidden`)**:\n   - Apply the HTML5 `inert` attribute to the main app container when the modal is open. This prevents screen readers and keyboard tab navigation from accessing background page content.\n3. **Focus Management Lifecycle**:\n   - *Open*: Store `document.activeElement` (the button that opened the modal) in a variable. Programmatically move focus to the first focusable element inside the modal.\n   - *Focus Trap*: Intercept `keydown` events: when pressing `Tab` on the last focusable element, loop focus back to the first element; on `Shift+Tab` from the first element, loop to the last element.\n   - *Escape Key*: Listen for `Escape` key to close the modal.\n   - *Close*: Return focus back to the original stored trigger button element so keyboard users do not lose their place on the page.',
    spokenTip: 'An accessible modal must trap keyboard focus, close on Escape, and restore focus to the trigger button when closed.',
    example: {
      language: 'html',
      code: `<!-- Accessible Modal HTML Structure -->
<div 
  role="dialog" 
  aria-modal="true" 
  aria-labelledby="dialog-title" 
  aria-describedby="dialog-desc"
  class="modal-backdrop"
  (keydown.escape)="closeModal()"
>
  <div class="modal-card">
    <h2 id="dialog-title">Delete Account Confirmation</h2>
    <p id="dialog-desc">Are you sure you want to permanently delete your profile? This cannot be undone.</p>
    
    <div class="modal-actions">
      <!-- Initial focus placed here -->
      <button (click)="closeModal()" #cancelBtn>Cancel</button>
      <button (click)="confirmDelete()" class="btn-danger">Delete</button>
    </div>
  </div>
</div>`,
      explanation: 'Shows WAI-ARIA role="dialog", aria-modal="true", and title/description ARIA bindings.'
    },
    seniorPoint: 'Using native HTML `<dialog>` with `dialogElement.showModal()` automatically handles `aria-modal="true"`, background inertness, focus trapping, and the Escape key natively in modern browsers with zero JavaScript boilerplate.',
    followUps: [
      {
        question: 'What is the difference between `role="dialog"` and `role="alertdialog"`?',
        answer: '`role="dialog"` is for standard user interactions (forms, settings). `role="alertdialog"` is for urgent interruptions (confirming deletion, session expiration) where user intervention is critical before continuing.'
      },
      {
        question: 'Why is `aria-modal="true"` insufficient on its own for keyboard accessibility?',
        answer: '`aria-modal="true"` tells screen readers that background content is inaccessible, but does not stop keyboard `Tab` key navigation in standard HTML without an active Focus Trap or the `inert` attribute.'
      }
    ],
    keyPointsToMention: [
      'WAI-ARIA attributes: role="dialog", aria-modal="true", aria-labelledby, aria-describedby',
      'Focus management lifecycle: store trigger element -> focus first child -> trap focus -> restore trigger focus on close',
      'Escape key listener for dismissal',
      'HTML5 inert attribute or native HTML5 <dialog> element'
    ],
    tags: ['accessibility', 'a11y', 'modal', 'dialog', 'wai-aria', 'focus-trap', 'keyboard-navigation']
  },
  {
    id: 'a11y_02',
    category: 'a11y',
    topic: 'Accessible Forms & Dynamic Live Regions',
    difficulty: 'Senior',
    question: 'How do you design accessible Form validation and dynamic UI notifications using aria-describedby, aria-invalid, and aria-live regions?',
    shortAnswer: 'For forms: link input fields to their explicit `<label for="id">`, set `aria-invalid="true"` when errors occur, and connect error messages via `aria-describedby="error-id"`. For dynamic updates (toasts, alerts): use `aria-live="polite"` (waits until user is idle) or `aria-live="assertive"` (interrupts immediately for critical alerts).',
    interviewAnswer: 'Accessible form validation and dynamic notifications require explicit programmatic relationships:\n1. **Form Controls & Error Association**:\n   - Every input needs an explicit `<label for="email-input">` (or `aria-label`).\n   - When validation fails, set `aria-invalid="true"`. This informs screen readers that the current input has an error.\n   - Link helper text and error messages using `aria-describedby="email-error email-hint"`. When the user tabs to the input, the screen reader automatically announces the label, the input value, the invalid state, AND reads the exact error message text.\n2. **Dynamic Live Regions (`aria-live`)**:\n   - When asynchronous events happen (e.g. "Item added to cart" toast or WebSocket update), sighted users see the banner, but screen readers are blind to it unless placed in an `aria-live` container.\n   - `aria-live="polite"`: Screen reader finishes speaking its current sentence, then reads the alert (standard for toasts and status updates).\n   - `aria-live="assertive"`: Screen reader interrupts immediately (reserved for emergency alerts, payment failure, or timeout warnings).',
    spokenTip: 'Link form errors using aria-describedby and aria-invalid, and announce asynchronous alerts with aria-live="polite".',
    example: {
      language: 'html',
      code: `<!-- 1. Accessible Form Field with Error Association -->
<div class="form-group">
  <label for="user-email">Email Address <span aria-hidden="true">*</span></label>
  <input 
    id="user-email" 
    type="email" 
    required
    [attr.aria-invalid]="emailControl.invalid && emailControl.touched"
    aria-describedby="email-error-msg email-helper"
  />
  <span id="email-helper" class="helper">We never share your email.</span>
  
  @if (emailControl.invalid && emailControl.touched) {
    <span id="email-error-msg" class="error-text" role="alert">
      Please enter a valid work email address.
    </span>
  }
</div>

<!-- 2. Dynamic Live Region for Asynchronous Toasts -->
<div aria-live="polite" aria-atomic="true" class="toast-container">
  @if (toastMessage()) {
    <div class="toast-card">{{ toastMessage() }}</div>
  }
</div>`,
      explanation: 'Demonstrates programmatic error association via aria-describedby/aria-invalid and aria-live polite toast announcements.'
    },
    seniorPoint: '`aria-live` containers must exist in the initial DOM tree *before* content is inserted into them. If you create the `aria-live` container and insert text at the exact same instant, many screen reader engines fail to announce the change.',
    followUps: [
      {
        question: 'What does `aria-atomic="true"` do on a live region?',
        answer: 'It instructs the screen reader to announce the *entire* contents of the live region when any part of it changes, rather than only announcing the specific text fragment that was appended.'
      },
      {
        question: 'What is the First Rule of ARIA?',
        answer: 'If you can use a native HTML5 element (e.g. `<button>`, `<dialog>`, `<nav>`, `<input type="checkbox">`) instead of custom `<div>` tags with ARIA attributes, always use the native HTML element.'
      }
    ],
    keyPointsToMention: [
      'First Rule of ARIA: prefer native semantic HTML elements over ARIA roles',
      'aria-describedby connects inputs to helper and error text IDs',
      'aria-invalid="true" signals validation failure to assistive technologies',
      'aria-live="polite" (queued) vs aria-live="assertive" (immediate interrupt)',
      'Pre-mounting aria-live containers in the DOM before injecting dynamic text'
    ],
    tags: ['accessibility', 'a11y', 'forms', 'aria-live', 'aria-describedby', 'screen-readers', 'wai-aria']
  },
  {
    id: 'a11y_03',
    category: 'a11y',
    topic: 'WCAG Color Contrast & Focus Indicators',
    difficulty: 'Senior',
    question: 'What are the WCAG 2.1/2.2 Color Contrast ratios, and how do you implement accessible keyboard focus rings using `:focus-visible` without ruining mouse click aesthetics?',
    shortAnswer: 'WCAG AA requires a 4.5:1 contrast ratio for normal text, 3:1 for large text (>=18pt or >=14pt bold), and 3:1 for UI components and focus rings. Never remove `outline: none` without a replacement. Use `:focus-visible` to display custom, high-contrast focus rings exclusively for keyboard users while keeping mouse clicks clean.',
    interviewAnswer: 'Accessibility standards specify exact luminance contrast ratios:\n1. **Text Contrast (WCAG AA)**:\n   - Normal body text (< 18pt / 24px): **4.5:1 minimum** against the background.\n   - Large text (>= 18pt or >= 14pt bold): **3:1 minimum**.\n   - Enhanced AAA standard: **7:1** for normal text, **4.5:1** for large text.\n2. **Non-Text & Focus Indicators (WCAG 2.2)**:\n   - Interactive borders, icons, and focus rings must meet **3:1 contrast** against adjacent colors.\n3. **Focus Styling (`:focus-visible`)**:\n   - Removing focus outlines with `outline: none` without providing an alternative is a critical accessibility violation.\n   - The modern CSS standard is `:focus:not(:focus-visible) { outline: none; }` and `:focus-visible { outline: 2px solid #6366f1; outline-offset: 2px; }`. This shows focus rings only when navigating via keyboard Tab key, but hides them on mouse or touch clicks.',
    spokenTip: 'Always use `:focus-visible` with `outline-offset` to provide prominent 3:1 contrast focus rings for keyboard users without affecting mouse clicks.',
    example: {
      language: 'css',
      code: `/* Modern Accessible Focus System in CSS */
button, a, input, select, textarea {
  /* Remove default ring for mouse clicks only */
  &:focus:not(:focus-visible) {
    outline: none;
  }

  /* High-contrast focus indicator for keyboard Tab users */
  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.2);
    border-radius: 4px;
  }
}`,
      explanation: 'Applies :focus-visible with outline-offset for keyboard users while eliminating unwanted focus outlines on mouse clicks.'
    },
    seniorPoint: 'WCAG 2.2 introduces Focus Appearance (Level AA) requiring the focus indicator to have an area of at least the perimeter of the focused element times 2 CSS pixels and a 3:1 contrast ratio against both focused and unfocused states.',
    followUps: [
      {
        question: 'Why is using `box-shadow` alone sometimes risky for focus indicators in Windows High Contrast Mode?',
        answer: 'Windows High Contrast Mode strips `box-shadow` and background colors. Using a real `outline: 2px solid transparent` or standard `outline` ensures the focus ring remains visible in Forced Colors mode.'
      },
      {
        question: 'Does placeholder text inside inputs count towards WCAG text contrast?',
        answer: 'Yes, if placeholder text contains critical instructions, it must meet 4.5:1 contrast, though standard UX practice recommends using visible `<label>` and helper text instead.'
      }
    ],
    keyPointsToMention: [
      'WCAG AA 4.5:1 for normal text, 3:1 for large text and UI components',
      ':focus-visible vs :focus for keyboard-only focus indicators',
      'outline-offset for distinct ring separation',
      'Forced Colors / Windows High Contrast Mode support via native outline'
    ],
    tags: ['accessibility', 'a11y', 'wcag', 'color-contrast', 'focus-visible', 'css']
  },
  {
    id: 'a11y_04',
    category: 'a11y',
    topic: 'Complex Widget Navigation (Roving Tabindex vs Aria-activedescendant)',
    difficulty: 'Senior',
    question: 'How do you implement keyboard navigation for complex composite widgets (e.g. TreeViews, Grid menus, Custom Selects) using Roving tabindex vs aria-activedescendant?',
    shortAnswer: 'For composite widgets, Tab enters/exits the widget as a single tab stop, while Arrow keys navigate items inside. **Roving tabindex** sets `tabindex="0"` on the actively selected item and `tabindex="-1"` on all others. **aria-activedescendant** keeps focus on the parent container (`tabindex="0"`) and points `aria-activedescendant="item-id"` to the currently highlighted item.',
    interviewAnswer: 'When building composite components like custom Select dropdowns, Menus, or Data Grids, placing `tabindex="0"` on every single row or option forces keyboard users to press Tab 50 times to skip the widget. Accessibility guidelines require **Single Tab Stop** with Arrow key navigation inside:\n\n1. **Roving Tabindex**:\n   - Set `tabindex="0"` on the currently active child item, and `tabindex="-1"` on all other items.\n   - When the user presses ArrowDown/ArrowUp, change the active item\'s tabindex to 0, update the previous item to -1, and call `.focus()` on the new DOM element.\n2. **`aria-activedescendant`**:\n   - Focus stays permanently on the parent container element (`<div role="listbox" tabindex="0">`).\n   - As the user presses Arrow keys, update `aria-activedescendant="option-id-2"` on the parent.\n   - Screen readers announce the active option without DOM focus ever leaving the container. This is standard for Autocomplete search inputs and ComboBoxes.',
    spokenTip: 'For composite widgets: Tab moves past the whole component, while Arrow keys move inside using either Roving Tabindex or aria-activedescendant.',
    example: {
      language: 'typescript',
      code: `// Custom ListBox with Roving Tabindex in Angular / React
@Component({
  selector: 'app-custom-menu',
  standalone: true,
  template: \`
    <ul role="menu" (keydown)="handleKeyDown($event)">
      @for (item of items(); track item.id; let i = $index) {
        <li 
          role="menuitem"
          [attr.tabindex]="focusedIndex() === i ? 0 : -1"
          [class.focused]="focusedIndex() === i"
          (click)="selectItem(item)"
          #itemRef
        >
          {{ item.label }}
        </li>
      }
    </ul>
  \`
})
export class CustomMenuComponent {
  items = signal([{ id: 1, label: 'Profile' }, { id: 2, label: 'Billing' }, { id: 3, label: 'Logout' }]);
  focusedIndex = signal(0);

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedIndex.update(i => (i + 1) % this.items().length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedIndex.update(i => (i - 1 + this.items().length) % this.items().length);
    }
  }
}`,
      explanation: 'Roving tabindex pattern ensuring only the active menu item has tabindex=0 while arrow keys update focus.'
    },
    seniorPoint: '`aria-activedescendant` is ideal for ComboBoxes (search input with dropdown) because focus must stay in the `<input>` element so the user can continue typing text while browsing suggestions with Arrow keys.',
    followUps: [
      {
        question: 'When should you prefer `aria-activedescendant` over Roving Tabindex?',
        answer: 'When you have a search input with a dropdown popup (ComboBox), because focus must remain inside the text input for keyboard typing while Arrow keys select items in the popup list.'
      },
      {
        question: 'What roles are required for custom dropdowns?',
        answer: '`role="combobox"`, `role="listbox"`, and `role="option"` with `aria-expanded` and `aria-haspopup="listbox"`.'
      }
    ],
    keyPointsToMention: [
      'Single tab stop principle for composite widgets',
      'Roving tabindex (tabindex="0" on active, -1 on others) vs aria-activedescendant',
      'Arrow key navigation inside composite widgets',
      'ComboBox pattern keeping focus on text input while selecting suggestions'
    ],
    tags: ['accessibility', 'a11y', 'roving-tabindex', 'aria-activedescendant', 'keyboard-navigation', 'combobox']
  }
];
