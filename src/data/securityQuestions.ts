import { Question } from '../types';

export const securityQuestions: Question[] = [
  {
    id: 'sec_01',
    category: 'security',
    topic: 'XSS & DomSanitizer Risks',
    difficulty: 'Senior',
    question: 'Explain the 3 types of XSS (Stored, Reflected, DOM-based). How does Angular/React protect against them by default, and what are the security risks of `DomSanitizer.bypassSecurityTrust*` or `dangerouslySetInnerHTML`?',
    shortAnswer: 'Stored XSS persists malicious scripts in the database; Reflected XSS reflects scripts from URL parameters/requests; DOM-based XSS executes scripts through client-side DOM sinks (`innerHTML`, `eval`, `document.write`). Modern frameworks auto-escape template bindings (`{{}}` or `{}`) by default. Bypassing sanitization tells the framework to trust untrusted input, opening direct XSS vulnerabilities.',
    seniorPoint: 'Never pass unsanitized user inputs or rich text payloads into `bypassSecurityTrustHtml()`. If rich markdown/HTML must be rendered, run the HTML through a certified sanitizer library like **DOMPurify** before trusting it, and enforce a strict Content Security Policy (CSP).',
    spokenTip: 'Frameworks treat all values as untrusted strings by default; manual sanitization bypasses are the primary source of modern frontend XSS.',
    interviewAnswer: '1. **Stored XSS**: Attacker injects malicious JS into a database (e.g. comment field) that is later served to all users.\n2. **Reflected XSS**: Script is delivered via a crafted phishing link (e.g. `?search=<script>...`) and reflected by the server without encoding.\n3. **DOM-based XSS**: Vulnerability entirely in client-side code where untrusted input from a source (`location.hash`, query param) is written directly to a DOM sink (`element.innerHTML`, `location.href = userInput`).\n\nAngular and React treat all interpolated strings as untrusted text, escaping HTML characters (`<`, `>`, `&`). If a developer uses Angular\'s `bypassSecurityTrustHtml()` or React\'s `dangerouslySetInnerHTML`, the framework stops escaping. If untrusted input enters that sink, the attacker can execute arbitrary JavaScript, steal session cookies/tokens, or make malicious API requests on the user\'s behalf.',
    keyPointsToMention: [
      'Stored, Reflected, and DOM-based XSS definitions',
      'Automatic contextual escaping in Angular/React template engines',
      'Risks of DomSanitizer bypassSecurityTrust* and dangerouslySetInnerHTML',
      'Sanitizing rich text using DOMPurify before rendering',
      'Enforcing strict Content Security Policy (CSP)'
    ],
    whatInterviewersLookFor: [
      'Identification of DOM sinks (innerHTML, eval, document.write, location.href)',
      'Best practice recommendation of using DOMPurify'
    ],
    codeExample: `import { Component, SecurityContext, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-markdown-viewer',
  standalone: true,
  template: \`
    <!-- Safely sanitized and trusted HTML rendering -->
    <div [innerHTML]="trustedContent"></div>
  \`
})
export class MarkdownViewerComponent {
  private sanitizer = inject(DomSanitizer);
  trustedContent: SafeHtml = '';

  renderUserMarkdown(rawHtmlFromBackend: string) {
    // 1. Sanitize with DOMPurify first to strip dangerous tags/scripts
    const cleanHtml = DOMPurify.sanitize(rawHtmlFromBackend, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target']
    });

    // 2. Safely trust only AFTER purification
    this.trustedContent = this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}`,
    tags: ['security', 'xss', 'dom-sanitizer', 'dompurify', 'csp', 'innerhtml']
  },
  {
    id: 'sec_02',
    category: 'security',
    topic: 'JWT Storage & Authentication Security',
    difficulty: 'Senior',
    question: 'Where should you store JWT Access Tokens and Refresh Tokens in a Frontend Single Page Application? Why is `localStorage` dangerous, and how do `HttpOnly` Cookies prevent token theft?',
    shortAnswer: 'Storing tokens in `localStorage` or `sessionStorage` makes them vulnerable to total extraction via any XSS vulnerability (including third-party npm scripts). The most secure pattern is: 1) Store the short-lived Access Token in JavaScript in-memory variable/state, and 2) Store the Refresh Token in an `HttpOnly`, `Secure`, `SameSite=Strict/Lax` cookie inaccessible to client JavaScript.',
    seniorPoint: 'With `HttpOnly` cookies, JavaScript running on the page (even via a malicious XSS script) cannot read or export the cookie (`document.cookie` returns empty). Combining this with `SameSite=Strict` completely mitigates CSRF while protecting tokens from XSS theft.',
    spokenTip: 'Access token in memory, refresh token in an `HttpOnly` cookie with `SameSite=Strict`.',
    interviewAnswer: 'In SPAs, token storage is a critical security architecture decision:\n- **The `localStorage` Anti-Pattern**: Any JS running on the origin (or any compromised npm dependency in `node_modules`) can execute `localStorage.getItem("token")` and exfiltrate the JWT to an attacker\'s server.\n- **The Secure Architecture**:\n  1. **Short-Lived Access Token (e.g. 10 mins)**: Kept in memory (Angular service / React state). Destroyed on page refresh or tab close.\n  2. **Long-Lived Refresh Token (e.g. 7 days)**: Sent by the server in an `Set-Cookie` response with `HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh`.\n  3. **Silent Refresh**: On app bootstrap or when the in-memory access token expires, an HTTP interceptor calls `/api/auth/refresh`. The browser attaches the `HttpOnly` cookie automatically, receives a fresh in-memory access token, and continues without user interruption.',
    keyPointsToMention: [
      'Why localStorage is vulnerable to XSS token theft',
      'HttpOnly flag prevents JavaScript access via document.cookie',
      'SameSite=Strict/Lax flag prevents CSRF attacks',
      'In-memory access token + HttpOnly cookie refresh token pattern'
    ],
    whatInterviewersLookFor: [
      'Clear understanding of the silent refresh flow',
      'Distinction between XSS risks and CSRF mitigations'
    ],
    codeExample: `// Secure Cookie Header sent by Server:
// Set-Cookie: refreshToken=abc123xyz; HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh; Max-Age=604800

// In-Memory Frontend Token Manager (Never written to localStorage!)
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  // Stored purely in memory (cleared on tab close/refresh)
  private inMemoryAccessToken: string | null = null;

  setAccessToken(token: string) {
    this.inMemoryAccessToken = token;
  }

  getAccessToken(): string | null {
    return this.inMemoryAccessToken;
  }

  clear() {
    this.inMemoryAccessToken = null;
  }
}`,
    tags: ['security', 'jwt', 'auth', 'httponly-cookies', 'localstorage', 'tokens', 'csrf']
  },
  {
    id: 'sec_03',
    category: 'security',
    topic: 'Frontend Authorization vs Backend Security',
    difficulty: 'Senior',
    question: 'Why are Angular Route Guards (`canActivate`) and conditional UI rendering (`*ngIf="isAdmin"`) purely UX conveniences and NOT actual security mechanisms?',
    shortAnswer: 'Client-side code runs in an untrusted environment controlled entirely by the user. A user can open DevTools, modify JavaScript memory variables, bypass Route Guards, or edit DOM elements to view hidden admin buttons. Real security and authorization MUST strictly be enforced on backend API endpoints via server-side token validation and role checks.',
    seniorPoint: 'Frontend guards and button toggles exist to provide smooth UX (preventing users from accidentally clicking actions they cannot execute), not to protect sensitive data. Every backend endpoint must authorize the caller independently.',
    spokenTip: 'Frontend authorization is for user experience; backend authorization is for actual security.',
    interviewAnswer: 'All client-side code runs on hardware and a runtime controlled by the client. An attacker can:\n1. Inspect and edit frontend JS in DevTools Sources tab.\n2. Override the `AuthGuard` return value in memory.\n3. Make direct HTTP requests using cURL, Postman, or fetch, bypassing the UI entirely.\n\nTherefore, Angular Route Guards (`canActivate`, `canMatch`) and UI button disguises (`*ngIf="user.role === \\\'ADMIN\\\'"`) are merely UX helpers to guide authorized users. The true security boundary is the backend API, where every single request decrypts the session/JWT, validates permissions in database/scopes, and responds with `403 Forbidden` if unauthorized.',
    keyPointsToMention: [
      'Client environment is completely untrusted and inspectable via DevTools',
      'Route guards and *ngIf are for user experience and navigation routing',
      'Every backend API endpoint must enforce authorization independently',
      'Defense in depth: UI guidance + API enforcement'
    ],
    whatInterviewersLookFor: [
      'Immediate rejection of the idea that frontend guards protect data',
      'Understanding of Defense-in-Depth principles'
    ],
    codeExample: `// Frontend Guard (UX Only!)
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // User can easily bypass this in DevTools by modifying local memory!
  if (authService.hasRole('ADMIN')) {
    return true;
  }

  router.navigate(['/unauthorized']);
  return false;
};

// Real Security: Backend API Gateway / Controller (Node / .NET / Java)
// [Authorize(Roles = "Admin")]
// app.delete('/api/admin/users/:id', verifyAdminRole, deleteUserHandler);`,
    tags: ['security', 'authorization', 'guards', 'defense-in-depth', 'backend-security']
  }
];
