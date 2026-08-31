import { Question } from '../types';

export const a11yQuestions: Question[] = [
  {
    id: 'a11y_01',
    category: 'a11y',
    topic: 'Modal Focus Trap & Keyboard Navigation',
    difficulty: 'Senior',
    question: 'How do you build a fully accessible Modal Dialog adhering to WCAG standards (focus trapping, keyboard navigation, and ARIA roles)?',
    shortAnswer: 'An accessible modal must: 1) Have `role="dialog"` or `role="alertdialog"`, `aria-modal="true"`, and `aria-labelledby="modal-title"`; 2) Save the active trigger element before opening; 3) Trap keyboard Tab navigation within the modal elements; 4) Close on `Escape` key; 5) Return focus back to the original trigger element upon dismissal; 6) Mark background sibling elements `aria-hidden="true"` or use `<dialog>` with `.showModal()`.',
    seniorPoint: 'Using the native HTML5 `<dialog>` element and calling `dialog.showModal()` provides automatic focus trapping, backdrop rendering, and ESC closing for free natively in modern browsers.',
    spokenTip: 'Save previous focus, trap Tab focus inside the dialog, handle Escape, and restore previous focus on close.',
    interviewAnswer: 'When creating an accessible modal dialog:\n1. **Semantics**: Use native `<dialog>` or `role="dialog"`, with `aria-modal="true"` and `aria-labelledby` referencing the dialog title heading.\n2. **Focus Management**: On open, save `document.activeElement`. Move focus to the first focusable element inside the modal (or the close button).\n3. **Focus Trapping**: Listen for `keydown` (Tab / Shift+Tab). When tabbing on the last focusable element, wrap focus to the first; on Shift+Tab from the first, wrap to the last.\n4. **Escape Dismissal**: Listen for `Escape` to close the modal.\n5. **Focus Restoration**: When the modal closes, return focus to the original saved trigger button so keyboard/screen reader users don\'t lose their position in the document.',
    keyPointsToMention: [
      'Focus trapping (Tab / Shift+Tab cycling)',
      'Returning focus to document.activeElement on dismissal',
      'role="dialog", aria-modal="true", aria-labelledby="title-id"',
      'Native <dialog> element and showModal() benefits'
    ],
    whatInterviewersLookFor: [
      'Remembering focus restoration to the opening trigger',
      'Knowledge of native HTML5 dialog element'
    ],
    codeExample: `// Angular / TypeScript Accessible Modal Logic
@Component({
  selector: 'app-accessible-modal',
  standalone: true,
  template: \`
    <dialog #dialogRef (close)="onClose()" class="modal-backdrop">
      <div class="modal-content" role="document">
        <h2 id="modal-title">{{ title() }}</h2>
        <ng-content />
        <button (click)="close()" class="btn-close">Close</button>
      </div>
    </dialog>
  \`
})
export class AccessibleModalComponent {
  title = input.required<string>();
  @ViewChild('dialogRef') dialogEl!: ElementRef<HTMLDialogElement>;
  private previousActiveElement: HTMLElement | null = null;

  open() {
    this.previousActiveElement = document.activeElement as HTMLElement;
    this.dialogEl.nativeElement.showModal(); // Built-in focus trap + ESC handling!
  }

  close() {
    this.dialogEl.nativeElement.close();
  }

  onClose() {
    // Restore focus to original trigger
    this.previousActiveElement?.focus();
  }
}`,
    tags: ['a11y', 'accessibility', 'modal', 'focus-trap', 'wcag', 'keyboard-navigation']
  },
  {
    id: 'a11y_02',
    category: 'a11y',
    topic: 'Accessible Forms & ARIA Live Regions',
    difficulty: 'Senior',
    question: 'How do you make complex forms and dynamic asynchronous notifications accessible using `aria-invalid`, `aria-describedby`, and `aria-live` regions?',
    shortAnswer: 'Link inputs with their validation error messages using `aria-describedby="error-id"` and toggle `aria-invalid="true"`. For dynamic notifications (toast messages, live search results, shopping cart badge updates), use `aria-live="polite"` so screen readers announce updates without interrupting user speech.',
    seniorPoint: 'Never replace semantic HTML with ARIA when semantic HTML is available (The First Rule of ARIA). Use native `<button>`, `<label for="...">`, and `<input>` before resorting to `role="button"` or `tabindex="0"`.',
    spokenTip: 'Use semantic HTML first, connect error texts with `aria-describedby`, and broadcast dynamic updates with `aria-live="polite"`.',
    interviewAnswer: '1. **Form Fields**: Every `<input>` must be explicitly associated with a `<label for="inputId">` or wrapped inside a `<label>`.\n2. **Validation Errors**: When a field fails validation, set `aria-invalid="true"`, and set `aria-describedby="email-error-msg"` to programmatically link the input to the error `<p id="email-error-msg">`. Screen readers will read the error description automatically when the user focuses the field.\n3. **Live Updates (`aria-live`)**: When asynchronous events happen (e.g. "Item added to cart", "Save completed", "5 search results found"), screen readers don\'t know the DOM updated. An element with `aria-live="polite"` ensures assistive tech speaks the new text as soon as the user is idle. Use `aria-live="assertive"` only for critical time-sensitive alerts (e.g. session expiring).',
    keyPointsToMention: [
      'First Rule of ARIA: Use native HTML elements before ARIA',
      'aria-invalid="true" and aria-describedby for field-level error association',
      'aria-live="polite" vs aria-live="assertive" for live announcements',
      'WCAG contrast requirement: 4.5:1 for standard body text'
    ],
    whatInterviewersLookFor: [
      'Understanding of how screen readers parse connected error descriptions',
      'Proper discretion between polite and assertive live regions'
    ],
    codeExample: `<!-- Accessible Form Field with Error Binding -->
<div class="form-group">
  <label for="user-email">Email Address</label>
  <input
    id="user-email"
    type="email"
    [attr.aria-invalid]="emailControl.invalid && emailControl.touched"
    [attr.aria-describedby]="emailControl.invalid && emailControl.touched ? 'email-err' : null"
  />
  @if (emailControl.invalid && emailControl.touched) {
    <p id="email-err" class="error-msg" role="alert">
      Please enter a valid email address.
    </p>
  }
</div>

<!-- Screen Reader Live Region for Dynamic Toast Announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {{ latestAnnouncement() }}
</div>`,
    tags: ['a11y', 'accessibility', 'forms', 'aria-live', 'aria-describedby', 'screen-readers']
  }
];
