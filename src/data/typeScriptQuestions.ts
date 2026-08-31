import { Question } from '../types';

export const typeScriptQuestions: Question[] = [
  {
    id: 'ts_01',
    category: 'typescript',
    topic: 'Interfaces vs Types',
    difficulty: 'Senior',
    question: 'What are the exact differences between `type` and `interface` in TypeScript, and when should you choose one over the other?',
    shortAnswer: 'Interfaces support declaration merging (open for extension) and are optimized by the TS compiler for property lookups on object shapes. Types (type aliases) can represent primitives, unions (`|`), intersections (`&`), tuples, mapped types, and conditional types. Prefer `interface` for public library APIs and object/OOP models; prefer `type` for complex unions, utilities, and functional domain types.',
    seniorPoint: 'The TS compiler caches interface object shapes internally by name, giving slight performance gains on massive codebases. Declaration merging in interfaces allows external consumers to augment your types (e.g. adding properties to `Window` or Express `Request`).',
    spokenTip: 'I use `interface` when defining object blueprints and extensible contracts, and `type` when dealing with unions, primitives, and transformations.',
    interviewAnswer: 'Both can define object structures and be extended (via `extends` or `&`). The main differences are:\n1. **Declaration Merging**: Multiple `interface` declarations with the same name merge their properties; `type` aliases throw a duplicate identifier error.\n2. **Unions & Primitives**: `type` can represent unions, tuples, mapped types, and primitive aliases (`type ID = string | number`); `interface` can only describe object shapes and functions.\n3. **Extensibility**: `interface` extends via the `extends` keyword; `type` extends via intersection (`&`). In modern TypeScript, prefer `interface` for library APIs, and `type` for application domain modeling, state unions, and complex generics.',
    keyPointsToMention: [
      'Declaration merging in interfaces (useful for ambient augmentations)',
      'Type aliases support unions, mapped types, conditional types, and primitives',
      'Compiler performance difference with object lookup caching on interfaces'
    ],
    whatInterviewersLookFor: [
      'Concrete examples of when type cannot be replaced by interface (unions, tuples, mapped types)',
      'Understanding of declaration merging and how it powers `@types/*` packages'
    ],
    codeExample: `// 1. Declaration Merging (Interfaces only)
interface UserProfile {
  id: string;
  name: string;
}
interface UserProfile {
  roles: string[]; // Merged automatically
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
    tags: ['typescript', 'interfaces', 'types', 'declaration-merging', 'oop']
  },
  {
    id: 'ts_02',
    category: 'typescript',
    topic: 'Top & Bottom Types',
    difficulty: 'Senior',
    question: 'Explain `any`, `unknown`, `never`, and `void`. How do you use `never` for compile-time exhaustive checks?',
    shortAnswer: '`any` disables all type-checking (top & bottom type). `unknown` is the type-safe top type (must be narrowed/type-guarded before use). `void` denotes the absence of a return value. `never` is the bottom type representing a state that can never occur, used for exhaustive pattern matching and unreachable code.',
    seniorPoint: '`unknown` forces the developer to write runtime type assertions or guards, preventing runtime `TypeError: undefined is not a function`. `never` ensures that if a new variant is added to a union, the build fails at compile-time if a switch case is missing.',
    spokenTip: '`any` turns off TypeScript; `unknown` is type-safe "I do not know yet"; `never` is impossible state.',
    interviewAnswer: '`any` turns off the type checker completely. `unknown` represents any possible value, but prevents accessing any properties until you narrow it down using type guards (`typeof`, `instanceof`, or custom predicates). `void` indicates a function returns nothing useful (or `undefined`). `never` represents values that never occur—such as a function that always throws or has an infinite loop. We use `never` in default switch cases for exhaustive type checking: assigning an unhandled union member to type `never` causes a compile error if a developer forgets a variant.',
    keyPointsToMention: [
      'any vs unknown: unknown requires type narrowing before property access',
      'never as the bottom type with no members',
      'Exhaustiveness check pattern with assertNever(x: never)'
    ],
    whatInterviewersLookFor: [
      'Deep understanding of why any is dangerous in production',
      'Demonstration of the assertNever compile-time safety pattern'
    ],
    codeExample: `type Action = 
  | { type: 'LOGIN'; payload: { user: string } }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN' }; // If someone adds this without updating the reducer

function assertNever(x: never): never {
  throw new Error(\`Unexpected object: \${x}\`);
}

function handleAction(action: Action) {
  switch (action.type) {
    case 'LOGIN':
      return \`Logged in \${action.payload.user}\`;
    case 'LOGOUT':
      return 'Logged out';
    case 'REFRESH_TOKEN':
      return 'Refreshing';
    default:
      // If REFRESH_TOKEN is omitted above, TypeScript raises a compile-time error here!
      return assertNever(action);
  }
}`,
    tags: ['typescript', 'unknown', 'any', 'never', 'type-safety', 'exhaustiveness']
  },
  {
    id: 'ts_03',
    category: 'typescript',
    topic: 'Type Narrowing & Guards',
    difficulty: 'Senior',
    question: 'How do Custom Type Predicates (`is`), Assertion Functions (`asserts`), and Discriminated Unions work for type narrowing?',
    shortAnswer: 'Type predicates (`arg is Type`) return a boolean and instruct the compiler to narrow `arg` if the return value is true. `asserts condition` narrows types by throwing an exception if invalid. Discriminated unions use a common literal tag property (e.g. `type: "success"`) for automatic control-flow narrowing.',
    seniorPoint: 'Custom type guards provide runtime validation and compile-time narrowing simultaneously. For untrusted API responses or WebSocket payloads, combine Zod/Valibot schemas or type predicates to eliminate `any` casting.',
    spokenTip: 'Type narrowing converts broad types to specific types at runtime through control flow analysis.',
    interviewAnswer: 'TypeScript uses Control Flow Analysis to narrow types within if/switch blocks. Built-in mechanisms include `typeof`, `instanceof`, and the `in` operator. When built-ins are insufficient for complex objects, we write custom type guards with the signature `param is TargetType`. If the function returns `true`, TS narrows `param` in the truthy branch. Assertion signatures (`asserts val is TargetType`) are used in fail-fast validator functions that throw instead of returning boolean.',
    keyPointsToMention: [
      'Custom predicate syntax: fn(x: unknown): x is User',
      'Assertion functions: asserts condition or asserts x is User',
      'Discriminated unions with single-literal discriminants'
    ],
    whatInterviewersLookFor: [
      'Distinction between type assertion (`as User`) which bypasses safety, vs type predicate (`is User`) which verifies at runtime',
      'Integration with API payload parsing'
    ],
    codeExample: `interface ApiSuccess<T> {
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

function processResponse(res: ApiResponse<string[]>) {
  if (res.kind === 'success') {
    console.log(res.data.join(', ')); // Narrowed automatically to ApiSuccess
  } else {
    console.error(res.message); // Narrowed to ApiError
  }
}`,
    tags: ['typescript', 'type-guards', 'narrowing', 'discriminated-unions', 'assertions']
  },
  {
    id: 'ts_04',
    category: 'typescript',
    topic: 'Generics & Constraints',
    difficulty: 'Senior',
    question: 'How do Generic Constraints (`extends`), the `keyof` operator, and default generic types work in TypeScript?',
    shortAnswer: 'Generics allow writing reusable, type-safe functions and structures without losing specific type information. Constraints (`<T extends HasId>`) enforce that `T` satisfies a required shape. `keyof T` produces a union of property keys of `T`. Combining `<T, K extends keyof T>` guarantees type-safe property access.',
    seniorPoint: 'Using generic constraints avoids over-widening return types. For example, `function getProp<T, K extends keyof T>(obj: T, key: K): T[K]` ensures the return type matches the exact property type rather than `any` or a broad union.',
    spokenTip: 'Generics are type variables that capture and propagate concrete types through functions, classes, and interfaces.',
    interviewAnswer: 'Generics parameterize types. Instead of using `any` or broad parent types, generics preserve exact operand types. We constrain generic parameters using `extends` (e.g. `<T extends Record<string, any>>`). The `keyof` operator extracts an object\'s keys as a string/number union. By combining `T` and `K extends keyof T`, we can create strongly typed getters, event emitters, and state updater functions that validate keys and return exact property types.',
    keyPointsToMention: [
      'Syntax: <T extends BaseShape = DefaultType>',
      'Combining keyof with indexed access types: T[K]',
      'Using generics for type-safe repository and API client abstractions'
    ],
    whatInterviewersLookFor: [
      'Ability to write helper functions with generic constraints',
      'Knowledge of default generic arguments'
    ],
    codeExample: `// Type-safe property getter with constraints
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: 101, username: 'dev_alex', isActive: true };
const username = getProperty(user, 'username'); // type: string
const isActive = getProperty(user, 'isActive'); // type: boolean
// getProperty(user, 'invalid'); // Compile Error: Argument of type '"invalid"' is not assignable to keyof user

// Generic Repository Interface
interface Repository<T extends { id: string | number }> {
  getById(id: T['id']): Promise<T | null>;
  save(entity: T): Promise<T>;
}`,
    tags: ['typescript', 'generics', 'constraints', 'keyof', 'indexed-access']
  },
  {
    id: 'ts_05',
    category: 'typescript',
    topic: 'Utility Types & Transformations',
    difficulty: 'Senior',
    question: 'Explain the internal implementation of `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, T>`, and `ReturnType<T>`.',
    shortAnswer: 'Built-in utility types transform types using mapped and conditional types under the hood. `Partial<T>` makes all keys optional (`{ [P in keyof T]?: T[P] }`), `Pick` filters keys (`{ [P in K]: T[P] }`), `Omit` excludes keys using `Exclude<keyof T, K>`, `Record` maps a union of keys to a value type, and `ReturnType` uses conditional type `infer R`.',
    seniorPoint: 'Understanding how utilities are implemented allows you to write custom transformations, such as `DeepReadonly<T>`, `DeepPartial<T>`, or `Nullable<T>`.',
    spokenTip: 'All utility types are built from mapped types, indexed access, and conditional inference (`infer`).',
    interviewAnswer: 'Built-in utility types are built from basic TS building blocks:\n- `Partial<T>`: `{ [P in keyof T]?: T[P] }`\n- `Required<T>`: `{ [P in keyof T]-?: T[P] }` (removes optionality modifier)\n- `Readonly<T>`: `{ readonly [P in keyof T]: T[P] }`\n- `Record<K, T>`: `{ [P in K]: T }`\n- `Pick<T, K extends keyof T>`: `{ [P in K]: T[P] }`\n- `Omit<T, K>`: `Pick<T, Exclude<keyof T, K>>`\n- `ReturnType<T>`: `T extends (...args: any[]) => infer R ? R : any`',
    keyPointsToMention: [
      'Modifiers: ? for optional, -? to remove optionality, readonly, -readonly',
      'Difference between Exclude (union filter) and Omit (object key filter)',
      'The infer keyword inside conditional types'
    ],
    whatInterviewersLookFor: [
      'Ability to write conditional and mapped types from scratch',
      'Knowledge of the satisfies operator vs as type assertions'
    ],
    codeExample: `// Custom DeepReadonly implementation
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends Function 
    ? T[P] 
    : T[P] extends object 
    ? DeepReadonly<T[P]> 
    : T[P];
};

// The 'satisfies' operator (TS 4.9+)
// Validates structure against a type WITHOUT widening the inferred literal types
type ThemeConfig = Record<string, string | { r: number; g: number; b: number }>;

const theme = {
  primary: '#3B82F6',
  accent: { r: 59, g: 130, b: 246 }
} satisfies ThemeConfig;

// theme.primary is inferred as string '#3B82F6', and theme.accent has exact .r, .g, .b!
console.log(theme.accent.r); // Valid with full autocomplete and type safety`,
    tags: ['typescript', 'utility-types', 'mapped-types', 'conditional-types', 'infer', 'satisfies']
  }
];
