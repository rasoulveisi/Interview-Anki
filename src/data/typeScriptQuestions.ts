import { Question } from '../types';

export const typeScriptQuestions: Question[] = [
  {
    id: 'ts_01',
    category: 'typescript',
    topic: 'Interfaces vs Types',
    difficulty: 'Senior',
    question: 'What are the exact differences between type and interface in TypeScript, and when should you choose one over the other?',
    shortAnswer: 'Interfaces support declaration merging (open for extension) and are optimized by the TS compiler for object shape lookups. Type aliases can represent primitives, unions (`|`), intersections (`&`), tuples, mapped types, and conditional types. Prefer `interface` for public library APIs and extensible OOP models; prefer `type` for complex unions, state representations, and functional utility transformations.',
    interviewAnswer: 'Both `interface` and `type` define object contracts, but they have key differences:\n1. **Declaration Merging**: If you declare multiple `interface` blocks with the same name, TypeScript automatically merges their properties. `type` aliases throw a duplicate identifier error. This makes `interface` great for library definitions (like augmenting `Window` or Express `Request`).\n2. **Unions & Primitives**: `type` can represent unions (`string | number`), tuples, mapped types, and primitive aliases. An `interface` can only describe object and function shapes.\n3. **Extensibility Syntax**: `interface` extends via the `extends` keyword; `type` extends via intersection (`&`). In modern application code, we use `type` for domain models, discriminated state unions, and generics, and `interface` for public contracts.',
    spokenTip: 'I use `interface` when defining extensible public contracts, and `type` when dealing with unions, primitives, and transformations.',
    example: {
      language: 'typescript',
      code: `// 1. Declaration Merging (Interfaces only)
interface UserProfile {
  id: string;
  name: string;
}
interface UserProfile {
  roles: string[]; // Merged automatically into UserProfile!
}

// 2. Type Aliases for Unions & Discriminated States
type FetchState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// 3. Extending
interface Admin extends UserProfile {
  permissions: string[];
}
type AdminType = UserProfile & { permissions: string[] };`,
      explanation: 'Demonstrates declaration merging on interfaces versus discriminated state unions on type aliases.'
    },
    seniorPoint: 'The TypeScript compiler caches interface object shapes internally by name, giving slight compilation speedups on massive codebases. However, for 99% of app development, developer ergonomics and union safety matter much more.',
    followUps: [
      {
        question: 'Can an interface implement or extend a union type?',
        answer: 'An interface cannot `extend` a union type directly (e.g. `interface A extends (B | C)` fails) because interfaces must define static, determinate object structures at compile time.'
      },
      {
        question: 'How does declaration merging power `@types/*` packages?',
        answer: 'It allows ambient definition packages to add properties to global objects (like adding `user` to Express `Request` or `ethereum` to `Window`) without modifying the original source code.'
      }
    ],
    keyPointsToMention: [
      'Declaration merging in interfaces (useful for global augmentations)',
      'Type aliases support unions, mapped types, conditional types, and primitives',
      'Compiler performance difference with object lookup caching on interfaces',
      'Extending with extends (interface) vs intersection & (type)'
    ],
    tags: ['typescript', 'interfaces', 'types', 'declaration-merging', 'oop']
  },
  {
    id: 'ts_02',
    category: 'typescript',
    topic: 'Top & Bottom Types',
    difficulty: 'Senior',
    question: 'Explain any, unknown, never, and void. How do you use never for compile-time exhaustive checks?',
    shortAnswer: '`any` disables all type checking. `unknown` is the type-safe top type (you must narrow/guard it before property access). `void` indicates a function returns no meaningful value. `never` is the bottom type representing impossible states, used for exhaustive switch/case checking.',
    interviewAnswer: '`any` completely turns off TypeScript checking and allows anything, which can hide runtime errors. `unknown` is the type-safe alternative: it can accept any value, but TypeScript blocks you from calling methods or accessing properties on it until you narrow it with a type guard (like `typeof` or `isType`). `void` means a function returns undefined.\n\n`never` represents a value that can never occur—such as a function that always throws or enters an infinite loop. In senior TypeScript code, we use `never` in default switch cases for **Exhaustive Type Checking**: if someone adds a new variant to a union and forgets to update the switch statement, assigning the unhandled case to `never` triggers a compile error.',
    spokenTip: '`any` turns off TypeScript; `unknown` is "I don\'t know yet, check first"; `never` is impossible state used for exhaustive pattern matching.',
    example: {
      language: 'typescript',
      code: `type Action = 
  | { type: 'LOGIN'; payload: { user: string } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' };

function assertNever(x: never): never {
  throw new Error(\`Unexpected object: \${JSON.stringify(x)}\`);
}

function handleAction(action: Action) {
  switch (action.type) {
    case 'LOGIN':
      return \`Logged in \${action.payload.user}\`;
    case 'LOGOUT':
      return 'Logged out';
    case 'REFRESH_TOKEN':
      return 'Refreshing session';
    default:
      // If someone adds a new Action without adding a case, TypeScript fails the build here!
      return assertNever(action);
  }
}`,
      explanation: 'Using assertNever(x: never) in default switch case guarantees compile-time exhaustiveness.'
    },
    seniorPoint: '`unknown` forces the developer to write runtime type assertions or guards, preventing `TypeError: Cannot read properties of undefined` on untrusted API payloads.',
    followUps: [
      {
        question: 'Why is `any` both a top type and a bottom type in TypeScript?',
        answer: 'Because every type is assignable to `any` (top type), and `any` is assignable to almost every type (bottom type), completely breaking the type system hierarchy.'
      },
      {
        question: 'What is the return type of a function that throws an error: `void` or `never`?',
        answer: '`never`, because the function never returns normally and control never reaches the caller.'
      }
    ],
    keyPointsToMention: [
      'any vs unknown: unknown requires type narrowing before property access',
      'never as the bottom type with no assignable values',
      'Exhaustiveness check pattern with assertNever(x: never)',
      'Why unknown is the gold standard for untrusted API and WebSocket payloads'
    ],
    tags: ['typescript', 'unknown', 'any', 'never', 'type-safety', 'exhaustiveness']
  },
  {
    id: 'ts_03',
    category: 'typescript',
    topic: 'Type Narrowing & Guards',
    difficulty: 'Senior',
    question: 'How do Custom Type Predicates (is), Assertion Functions (asserts), and Discriminated Unions work for type narrowing?',
    shortAnswer: 'Type predicates (`arg is Type`) return a boolean and narrow the type in truthy branches. Assertion functions (`asserts condition`) narrow types by throwing an exception if invalid. Discriminated unions use a common literal tag property (e.g. `status: "success"`) for automatic compiler narrowing.',
    interviewAnswer: 'TypeScript uses Control Flow Analysis to narrow types inside code branches. While `typeof` and `instanceof` handle primitives and classes, complex domain objects need custom solutions:\n1. **Type Predicates (`param is TargetType`)**: Functions returning a boolean. When true, TypeScript narrows the parameter in that block.\n2. **Assertion Functions (`asserts val is TargetType`)**: Functions that throw an error if the value is invalid. After the call, TypeScript assumes the value is valid on subsequent lines without needing an `if` block.\n3. **Discriminated Unions**: A union of object types sharing a common discriminant literal property (like `kind: "success"` vs `kind: "error"`). Checking that property in an `if` or `switch` automatically narrows the entire object shape.',
    spokenTip: 'Type narrowing transforms broad types into specific types through control flow analysis and runtime checks.',
    example: {
      language: 'typescript',
      code: `interface ApiSuccess<T> {
  kind: 'success';
  data: T;
}
interface ApiError {
  kind: 'error';
  message: string;
  code: number;
}
type ApiResponse<T> = ApiSuccess<T> | ApiError;

// 1. Custom Type Predicate
function isApiError(res: ApiResponse<any>): res is ApiError {
  return res.kind === 'error' && typeof (res as ApiError).code === 'number';
}

// 2. Assertion Function
function assertIsString(val: unknown): asserts val is string {
  if (typeof val !== 'string') {
    throw new TypeError(\`Expected string, received \${typeof val}\`);
  }
}

// 3. Control Flow Narrowing
function processResponse(res: ApiResponse<string[]>) {
  if (res.kind === 'success') {
    console.log(res.data.join(', ')); // Automatically narrowed to ApiSuccess<string[]>
  } else {
    console.error(res.message, res.code); // Automatically narrowed to ApiError
  }
}`,
      explanation: 'Combines type predicates, assertion signatures, and discriminated unions.'
    },
    seniorPoint: 'A type assertion (`res as User`) only tells the compiler to trust you without doing runtime verification. A type predicate (`isUser(res)`) actually verifies properties at runtime before narrowing.',
    followUps: [
      {
        question: 'How does the `in` operator narrow types in TypeScript?',
        answer: "If you check 'email' in user, TypeScript narrows the union to only those object variants that contain an `email` property."
      },
      {
        question: 'Why are Discriminated Unions preferred over multiple optional properties on a single interface?',
        answer: 'Optional properties (`{ isError?: boolean; error?: string; data?: T }`) allow invalid states (like `isError: true` with `data: [...]`). Discriminated unions make impossible states unrepresentable.'
      }
    ],
    keyPointsToMention: [
      'Custom predicate syntax: fn(x: unknown): x is User',
      'Assertion functions: asserts condition or asserts x is User',
      'Discriminated unions with single-literal discriminants',
      'Type assertion (as T) vs runtime type validation'
    ],
    tags: ['typescript', 'type-guards', 'narrowing', 'discriminated-unions', 'assertions']
  },
  {
    id: 'ts_04',
    category: 'typescript',
    topic: 'Generics & Constraints',
    difficulty: 'Senior',
    question: 'How do Generic Constraints (extends), the keyof operator, and indexed access types work in TypeScript?',
    shortAnswer: 'Generics parameterize types to enable reusable code without losing specific type details. Constraints (`<T extends HasId>`) enforce that `T` satisfies a required shape. `keyof T` produces a union of property keys. Combining `<T, K extends keyof T>` guarantees type-safe property access with return type `T[K]`.',
    interviewAnswer: 'Generics capture and preserve concrete types. Instead of accepting `any` or broad types, generics maintain type fidelity through function calls.\n\nWe constrain generic types using `extends` (e.g. `<T extends { id: string }>` ensures `T` always has an `id`). The `keyof` operator extracts all keys of an object type as a union of strings/numbers. Combining `T` and `K extends keyof T` lets us write helper functions where the key is validated at compile time and the return type is automatically inferred as `T[K]` (Indexed Access Type).',
    spokenTip: 'Generics are type parameters that propagate concrete types through functions, classes, and interfaces.',
    example: {
      language: 'typescript',
      code: `// Type-safe property getter with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 101, username: 'alex_dev', isActive: true };
const username = getProperty(user, 'username'); // Inferred type: string
const isActive = getProperty(user, 'isActive'); // Inferred type: boolean
// getProperty(user, 'unknownKey'); // Compile Error: 'unknownKey' is not assignable to keyof user

// Generic Repository Interface with ID constraint
interface Repository<T extends { id: string | number }> {
  getById(id: T['id']): Promise<T | null>;
  save(entity: T): Promise<T>;
}`,
      explanation: 'Shows generic property access with keyof and indexed access type T[K].'
    },
    seniorPoint: 'Using generic constraints prevents type widening. If you return `T[K]`, TypeScript knows the exact return type rather than widening it to a broad union of all values in `T`.',
    followUps: [
      {
        question: 'What is the difference between `<T extends string>` and just using `string` as a parameter type?',
        answer: '`<T extends string>` captures the exact string literal type (e.g. `"active"`), whereas `param: string` widens the value to general `string`.'
      },
      {
        question: 'How can you set default generic types?',
        answer: 'Using `= DefaultType`, for example: `<T = HTMLElement>(el: T) => ...`.'
      }
    ],
    keyPointsToMention: [
      'Syntax: <T extends BaseShape = DefaultType>',
      'Combining keyof with indexed access types: T[K]',
      'Preserving literal types vs widening to general primitives',
      'Generic repositories and type-safe API clients'
    ],
    tags: ['typescript', 'generics', 'constraints', 'keyof', 'indexed-access']
  },
  {
    id: 'ts_05',
    category: 'typescript',
    topic: 'Utility Types & Transformations',
    difficulty: 'Senior',
    question: 'Explain the internal implementation of Partial<T>, Pick<T, K>, Omit<T, K>, Record<K, T>, and ReturnType<T>. What is the satisfies operator?',
    shortAnswer: 'Utility types transform types using mapped and conditional types under the hood. `Partial<T>` makes keys optional (`{ [P in keyof T]?: T[P] }`), `Pick` filters keys (`{ [P in K]: T[P] }`), `Omit` uses `Exclude<keyof T, K>`, `Record` maps keys to a type, and `ReturnType` uses conditional `infer R`. The `satisfies` operator validates a value against a type without widening its inferred literal types.',
    interviewAnswer: 'Built-in utility types are built from basic TypeScript primitives:\n- `Partial<T>`: `{ [P in keyof T]?: T[P] }` (maps over keys and adds `?`)\n- `Required<T>`: `{ [P in keyof T]-?: T[P] }` (removes optionality)\n- `Readonly<T>`: `{ readonly [P in keyof T]: T[P] }`\n- `Record<K, T>`: `{ [P in K]: T }`\n- `Pick<T, K extends keyof T>`: `{ [P in K]: T[P] }`\n- `Omit<T, K>`: `Pick<T, Exclude<keyof T, K>>`\n- `ReturnType<T>`: `T extends (...args: any[]) => infer R ? R : any`\n\nThe `satisfies` operator (TS 4.9+) validates that an object conforms to an interface while preserving the narrowest inferred literal types for properties, unlike `as` or standard variable type annotations.',
    spokenTip: 'Utility types are built using mapped types, indexed access, and conditional type inference with infer.',
    example: {
      language: 'typescript',
      code: `// 1. Custom DeepReadonly implementation
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Function 
    ? T[P] 
    : T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};

// 2. The 'satisfies' operator vs Type Annotation:
type ThemeConfig = Record<string, string | { r: number; g: number; b: number }>;

// With 'satisfies': Validates shape, but keeps exact literal types!
const theme = {
  primary: '#3B82F6',
  accent: { r: 59, g: 130, b: 246 }
} satisfies ThemeConfig;

// theme.primary is known to be a string, and theme.accent has .r, .g, .b!
console.log(theme.accent.r); // Fully typed autocomplete!`,
      explanation: 'Shows custom recursive mapped types and modern satisfies operator.'
    },
    seniorPoint: '`satisfies` prevents type widening. If you write `const theme: ThemeConfig = ...`, `theme.primary` is widened to `string | { r, g, b }`, losing member autocomplete. `satisfies` validates the structure while preserving the exact inferred type.',
    followUps: [
      {
        question: 'What is the difference between `Exclude<T, U>` and `Omit<T, K>`?',
        answer: '`Exclude` works on union types to remove members (`Exclude<"a"|"b"|"c", "a">` -> `"b"|"c"`). `Omit` works on object types to remove keys (`Omit<User, "password">`).'
      },
      {
        question: 'How does the `infer` keyword work in conditional types?',
        answer: '`infer` introduces a type variable inside a conditional type that TypeScript deduces dynamically (e.g. extracting Promise inner type: `type Awaited<T> = T extends Promise<infer U> ? U : T`).'
      }
    ],
    keyPointsToMention: [
      'Modifiers: ? for optional, -? to remove optionality, readonly, -readonly',
      'Difference between Exclude (union filter) and Omit (object key filter)',
      'The infer keyword inside conditional types',
      'The satisfies operator vs type assertion vs variable type annotation'
    ],
    tags: ['typescript', 'utility-types', 'mapped-types', 'conditional-types', 'infer', 'satisfies']
  },
  {
    id: 'ts_06',
    category: 'typescript',
    topic: 'Enums vs Const Objects & Union Types',
    difficulty: 'Senior',
    question: 'Why do modern TypeScript codebases avoid numeric and string enums in favor of const objects with as const and union types?',
    shortAnswer: 'TypeScript `enum` generates runtime IIFE JavaScript code, does not tree-shake cleanly, allows unsafe numeric assignments, and creates nominal rather than structural typing friction. Modern TypeScript prefers `const ROLES = { ... } as const` paired with `type Role = typeof ROLES[keyof typeof ROLES]`, which is 100% type-safe, structural, and tree-shakeable.',
    interviewAnswer: 'Enums are one of the few TypeScript features that emit runtime JavaScript code rather than vanishing during compilation. They have several well-known issues:\n1. **Runtime Overhead**: TypeScript enums generate complex reverse-mapping IIFE objects in JS, which bundlers struggle to tree-shake.\n2. **Numeric Enum Unsoundness**: With numeric enums, TypeScript historically allowed assigning arbitrary numbers (`const role: UserRole = 999`) without a compiler error.\n3. **Nominal vs Structural Mismatch**: String enums require importing the enum object everywhere; you cannot simply pass an identical string literal.\n\nModern best practice is using a `const` object with `as const` and extracting a union type: `export const ROLES = { ADMIN: "admin", USER: "user" } as const; export type Role = (typeof ROLES)[keyof typeof ROLES];`. This gives autocomplete, runtime iteration via `Object.values(ROLES)`, and zero runtime boilerplate.',
    spokenTip: 'Modern TypeScript avoids enums because they generate runtime IIFE code and have type safety quirks. We prefer `as const` objects with union types.',
    example: {
      language: 'typescript',
      code: `// ❌ Legacy TS Enum: Emits runtime IIFE boilerplate
export enum UserRoleEnum {
  Admin = 'ADMIN',
  User = 'USER'
}

// ✅ Modern Best Practice: const object + as const + union type
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  GUEST: 'GUEST'
} as const;

// Extract union type: 'ADMIN' | 'USER' | 'GUEST'
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

function setRole(role: UserRole) {
  console.log(\`Assigned role: \${role}\`);
}

// Clean usage: accept direct string literal or object reference!
setRole('ADMIN');
setRole(USER_ROLES.ADMIN);`,
      explanation: 'Compares TS enum with const object union pattern using as const.'
    },
    seniorPoint: 'Using `as const` creates readonly literal types for all object properties. Bundlers can easily inline strings and tree-shake unused object references completely.',
    followUps: [
      {
        question: 'What is `const enum` and why is it also discouraged in some setups?',
        answer: '`const enum` inlines values at compile-time with zero JS output, but causes issues with isolated module transpilers (like Babel, Vite/esbuild, or ts-loader in `transpileOnly` mode) because they cannot look across file boundaries to inline the value.'
      },
      {
        question: 'How do you get an array of all values from an `as const` object?',
        answer: "Use `Object.values(USER_ROLES)` which gives ['ADMIN', 'USER', 'GUEST'] at runtime for form select options and dropdowns."
      }
    ],
    keyPointsToMention: [
      'Enums emit runtime JavaScript IIFE objects that hinder tree-shaking',
      'Numeric enums permit unsafe number assignments',
      'as const objects + union types provide structural typing and zero runtime bloat',
      'Compatibility with Babel/Vite/esbuild isolated module compilation'
    ],
    tags: ['typescript', 'enums', 'as-const', 'union-types', 'best-practices', 'tree-shaking']
  },
  {
    id: 'ts_07',
    category: 'typescript',
    topic: 'Generics Constraints & Indexed Access Types',
    difficulty: 'Senior',
    question: 'How do Generic Constraints (`T extends U`), `keyof`, and Indexed Access Types (`T[K]`) work together to create end-to-end type-safe API helpers and event emitters?',
    shortAnswer: 'Generic constraints restrict what types can be passed to a generic parameter. `keyof T` extracts a union of keys. `T[K]` accesses the type of property `K` on `T`. Combining them ensures that function calls only accept valid keys and automatically infer the exact property return types.',
    interviewAnswer: 'In senior TypeScript code, generic constraints prevent runtime property access errors. By writing `<T, K extends keyof T>(obj: T, key: K): T[K]`, we enforce that `key` must be a valid key of `obj`, and TypeScript accurately infers the exact return type `T[K]` without manual casting.\n\nWe use this pattern for type-safe Event Emitters (where event names map to specific payload interfaces), form field getters, patch operations (`Partial<T>`), and state reducers.',
    spokenTip: 'Generic constraints + keyof + indexed access give us dynamic type inference without any type assertions or any.',
    example: {
      language: 'typescript',
      code: `// Type-safe Typed Event Emitter Map
interface AppEvents {
  'user:login': { userId: string; timestamp: number };
  'cart:update': { itemCount: number; total: number };
  'app:error': { code: number; message: string };
}

class TypedEventEmitter<TEvents extends Record<string, any>> {
  private listeners: { [K in keyof TEvents]?: Array<(payload: TEvents[K]) => void> } = {};

  on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event]!.push(handler);
  }

  emit<K extends keyof TEvents>(event: K, payload: TEvents[K]) {
    this.listeners[event]?.forEach(fn => fn(payload));
  }
}

// Usage:
const bus = new TypedEventEmitter<AppEvents>();

// Autocompletes event names, payload is typed as { userId: string, timestamp: number }!
bus.on('user:login', (data) => {
  console.log(\`User \${data.userId} logged in at \${data.timestamp}\`);
});

bus.emit('user:login', { userId: 'usr_101', timestamp: Date.now() });`,
      explanation: 'Typed event bus using keyof constraint and indexed access for automatic payload inference.'
    },
    seniorPoint: 'Combining `keyof` with distributive conditional types allows building recursive deep key lookups (e.g. `type DeepKey<T> = ...`), allowing safe property paths like `"user.address.city"`.',
    followUps: [
      {
        question: 'What happens if you pass an unconstrained generic `<T>(key: keyof T)` when `T` could be a primitive?',
        answer: 'TypeScript allows `keyof string` or `keyof number` (which returns method names like "concat" or "toFixed"), so constraining `T extends object` is recommended when working with objects.'
      },
      {
        question: 'What is the difference between `T[keyof T]` and `keyof T`?',
        answer: '`keyof T` is a union of all property keys. `T[keyof T]` is a union of all property value types in `T`.'
      }
    ],
    keyPointsToMention: [
      'Generic constraints using extends',
      'keyof operator for extracting property key unions',
      'Indexed access types T[K] for dynamic return value inference',
      'Building type-safe event buses, reducers, and entity stores'
    ],
    tags: ['typescript', 'generics', 'keyof', 'indexed-access', 'type-safety', 'event-emitter']
  },
  {
    id: 'ts_08',
    category: 'typescript',
    topic: 'Template Literal Types & String Manipulation',
    difficulty: 'Senior',
    question: 'What are Template Literal Types in TypeScript, and how do you use them to parse URL path parameters (e.g. `/api/users/:id/posts/:postId`) into strongly typed objects?',
    shortAnswer: 'Template literal types build string types via template literal syntax (e.g. `\`on\${Capitalize<Event>}\``). Using recursive conditional types with template literals and `infer`, we can parse dynamic URL path tokens like `:id` into typed object parameters `{ id: string; postId: string }`.',
    interviewAnswer: 'Introduced in TypeScript 4.1, Template Literal Types allow string manipulation directly inside the type system. They support built-in utilities like `Uppercase<S>`, `Lowercase<S>`, `Capitalize<S>`, and `Uncapitalize<S>`.\n\nAt a senior level, we use template literal types with recursive pattern matching (`infer`) to parse router path strings into parameter objects. If an API route is defined as `"/users/:userId/posts/:postId"`, TypeScript can automatically infer that the request params parameter must match `{ userId: string; postId: string }`, making routing libraries 100% type-safe without code generation.',
    spokenTip: 'Template literal types bring regex-like string extraction to the type system, enabling compile-time URL path parsing and CSS utility typing.',
    example: {
      language: 'typescript',
      code: `// Recursive URL Path Param Extractor
type ExtractRouteParams<TPath extends string> =
  TPath extends \`\${string}/:\${infer Param}/\${infer Rest}\`
    ? { [K in Param | keyof ExtractRouteParams<\`/\${Rest}\`>]: string }
    : TPath extends \`\${string}/:\${infer Param}\`
    ? { [K in Param]: string }
    : Record<string, never>;

// Test the type extraction:
type UserPostParams = ExtractRouteParams<'/api/users/:userId/posts/:postId'>;
// Result is strictly inferred as: { userId: string; postId: string }

function navigateTo<TPath extends string>(
  path: TPath, 
  params: ExtractRouteParams<TPath>
) {
  let url: string = path;
  for (const [key, value] of Object.entries(params)) {
    url = url.replace(\`:\${key}\`, encodeURIComponent(value as string));
  }
  return url;
}

// ✅ Type checks required params!
navigateTo('/api/users/:userId/posts/:postId', {
  userId: '123',
  postId: '456'
});`,
      explanation: 'Uses recursive template literal types and infer to parse URL parameters into a type-safe object contract.'
    },
    seniorPoint: 'Template literal types with union types produce Cartesian products. For example, `\`\${"top" | "bottom"}-\${"left" | "right"}\`` produces `"top-left" | "top-right" | "bottom-left" | "bottom-right"`. Beware of combinatorial explosion if unions are too large.',
    followUps: [
      {
        question: 'How do CSS frameworks like Tailwind type utilities like `bg-${Color}-${Shade}` in TypeScript?',
        answer: 'By combining unions of colors and numbers with template literal types: `type Color = "slate" | "indigo"; type Shade = 100 | 500 | 900; type Class = \`bg-\${Color}-\${Shade}\`;`.'
      },
      {
        question: 'What is the limit on recursion depth for template literal types in TypeScript?',
        answer: 'TypeScript limits type recursion depth to around 50-100 levels to prevent infinite loops and compiler crashes during type resolution.'
      }
    ],
    keyPointsToMention: [
      'Template literal types for string union composition and validation',
      'Built-in intrinsic string types (Capitalize, Uppercase, Lowercase)',
      'Pattern matching with infer for URL and query string parsing',
      'Cartesian product generation across union combinations'
    ],
    tags: ['typescript', 'template-literal-types', 'infer', 'advanced-types', 'routing']
  }
];
