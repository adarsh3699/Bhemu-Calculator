# React Hooks & Project Architecture — Professional Reference

> A living cheatsheet for making clean, non-over-engineered decisions on hooks, components, and project structure in a Next.js / React codebase.

---

## Table of Contents

1. [The Core Philosophy](#1-the-core-philosophy)
2. [What Actually Qualifies as a Hook](#2-what-actually-qualifies-as-a-hook)
3. [The Decision Tree](#3-the-decision-tree)
4. [Hook vs Plain Function vs Inline](#4-hook-vs-plain-function-vs-inline)
5. [Co-location vs Centralization](#5-co-location-vs-centralization)
6. [The 4 Rules of a Good Hook](#6-the-4-rules-of-a-good-hook)
7. [Low Coupling, High Cohesion Applied to React](#7-low-coupling-high-cohesion-applied-to-react)
8. [Professional Folder Structure](#8-professional-folder-structure)
9. [Layer Responsibilities (What Goes Where)](#9-layer-responsibilities-what-goes-where)
10. [Component Taxonomy](#10-component-taxonomy)
11. [Common Over-Engineering Mistakes](#11-common-over-engineering-mistakes)
12. [Quick Reference Card](#12-quick-reference-card)

---

## 1. The Core Philosophy

> **Every abstraction must justify its existence. Complexity is not sophistication.**

The goal is not to write clever code — it is to write code that a developer who has never seen the project can understand in under 60 seconds per file. Every hook, every utility function, every folder exists because it makes something *clearer*, not because it *could* exist.

Three questions to ask before creating any abstraction:

```
1. Does this remove real complexity, or just move it?
2. Will this be needed in more than one place?
3. If I deleted this and inlined it, would anything actually get harder to understand?
```

If the answer to all three is "no" — don't create it.

---

## 2. What Actually Qualifies as a Hook

A custom hook **must** use at least one React primitive internally. If it doesn't, it is a plain function.

### React Primitives That Make Something a Hook

| Primitive | What it signals |
|---|---|
| `useState` | Owns local reactive state |
| `useEffect` | Owns a side effect with setup/cleanup |
| `useRef` | Needs a mutable ref across renders |
| `useMemo` | Caches an expensive derived value |
| `useCallback` | Stabilizes a function reference |
| `useContext` | Reads from a React context |
| Another custom hook | Composes hook behaviour |

### The Simplest Test

```ts
// Ask: if I rename this from useXxx to getXxx and call it outside a component, does it break?

// ❌ If it still works — it is NOT a hook, it is a plain function
function useAccuracy(result: TestResult) {
  return (result.correct / result.totalQuestions) * 100;
}

// ✅ If it breaks because of React rules — it IS a hook
function useTimer(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id);
  }, []);
  return secondsLeft;
}
```

---

## 3. The Decision Tree

Use this before creating **any** hook or deciding where logic lives.

```
Does this logic use useState / useEffect / useRef / useMemo or another hook internally?
│
├── NO
│   └── It is a plain function.
│       ├── Does it compute a derived value from data?  → lib/analytics.ts or lib/utils.ts
│       ├── Does it transform or filter data?           → lib/<domain>.ts
│       └── Is it a one-liner used only once?           → Inline it in the component
│
└── YES — it is a hook. Now ask:
    │
    ├── Is it used in 2 or more components?
    │   └── YES → Extract to src/hooks/<hookName>.ts (shared hooks)
    │
    └── NO — used in only one component. Ask:
        │
        ├── Does it own a side effect (interval, fetch, event listener, localStorage)?
        │   └── YES → Extract as a hook, co-locate next to the component file
        │
        ├── Does it manage 3+ interdependent state values?
        │   └── YES → Extract as a hook, co-locate next to the component file
        │
        └── NO to both
            └── Keep the logic INLINE inside the component. Do not extract.
```

---

## 4. Hook vs Plain Function vs Inline

This is the most important distinction in daily React development.

### Plain Function (no React inside)

```ts
// src/lib/analytics.ts
export function computeAccuracy(result: TestResult): number {
  return (result.correct / result.totalQuestions) * 100;
}

export function computeWeakChapter(result: TestResult): string {
  // pure logic, no useState, no useEffect
}
```

**Rule:** No `use` prefix. Lives in `lib/`. Can be called anywhere — components, hooks, server functions, tests.

---

### Custom Hook (React primitives inside)

```ts
// components/test/useTimer.ts  ← co-located, single use
export function useTimer(initialSeconds: number, paused: boolean) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    if (paused || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(id); // ← cleanup = justifies being a hook
  }, [paused, secondsLeft]);

  return {
    secondsLeft,
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60,
    isExpired: secondsLeft <= 0,
  };
}
```

---

### Inline Logic (simple, single-use)

```tsx
// components/setup/SetupForm.tsx
// ✅ 5 fields, one submit handler — just keep it here
export function SetupForm() {
  const [subject, setSubject] = useState<Subject>("CA Inter Accounts");
  const [chapter, setChapter] = useState("all");
  const router = useRouter();

  function handleSubmit() {
    router.push(`/test?subject=${subject}&chapter=${chapter}`);
  }

  return ( /* JSX */ );
}
```

There is no reason to extract a `useSetupForm` hook here. One component, no side effects, three state values. Inline is correct.

---

## 5. Co-location vs Centralization

### `src/hooks/` — Shared, cross-feature hooks only

```
src/hooks/
├── useDebounce.ts        ← used in search AND setup AND performance
├── useLocalStorage.ts    ← used in results AND performance
└── useMediaQuery.ts      ← used in layout AND test header
```

**Promotion rule:** A hook starts co-located. When a second unrelated component needs it, promote it to `src/hooks/`. Never promote preemptively.

---

### Co-located — Single-feature hooks

Hooks live in a `hooks/` subfolder inside the feature folder — not mixed in with `.tsx` component files. This makes it instantly obvious at a glance which files are components and which are logic.

```
src/components/test/
├── hooks/                ← feature-scoped hooks (internal, not exported from index.ts)
│   ├── useTestSession.ts ← only TestClient uses this
│   └── useTimer.ts       ← only TestHeader uses this (for now)
├── index.ts              ← barrel export — only exports components, not hooks
├── TestClient.tsx
├── TestHeader.tsx
├── TestControls.tsx
├── QuestionView.tsx
└── PausedOverlay.tsx
```

**Why a subfolder instead of flat co-location:**
- `.tsx` files are components, `hooks/` folder is logic — no ambiguity when scanning the folder
- The `hooks/` folder not appearing in `index.ts` makes the internal-only contract explicit
- Deleting the test feature still means deleting one folder — nothing in `src/hooks/` becomes orphaned

**Apply this pattern to every feature folder:**

```
components/setup/
├── hooks/
│   └── useSetupForm.ts   ← only if extracted; see Rule: inline first
└── SetupForm.tsx

components/results/
├── hooks/                ← add only when a hook is actually needed
├── ResultSummary.tsx
├── AnswerReviewList.tsx
└── WeakChapterCard.tsx
```

**Rule:** `ui/` never gets a `hooks/` subfolder — primitives must be stateless by definition.

---

## 6. The 4 Rules of a Good Hook

### Rule 1 — One Responsibility

A hook name should complete this sentence without the word "and":

```
"This hook is responsible for ___."
```

```ts
// ❌ Too many responsibilities
function useTestSession() {
  // manages session state AND runs the timer AND handles routing
}

// ✅ Single responsibility
function useTestSession() { /* session state machine only */ }
function useTimer()       { /* countdown only */ }
```

---

### Rule 2 — Name Describes What It Owns, Not What It Does

```ts
// ❌ Describes an action
useHandleSubmit()
useManageForm()

// ✅ Describes ownership
useTestSession()   // owns the session state
useTimer()         // owns the countdown
useAuth()          // owns the auth state
```

---

### Rule 3 — Event Handlers Are Not Hooks

```ts
// ❌ Never do this
function useHandleNext(setIndex: Dispatch<SetStateAction<number>>) {
  return () => setIndex(i => i + 1);
}

// ✅ Just write the handler where the state lives
function useTestSession() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const handleNext = () => setCurrentIndex(i => i + 1); // ← plain function, lives here
  return { currentIndex, handleNext };
}
```

---

### Rule 4 — Return an Object, Not an Array (unless it's a pair)

```ts
// ✅ Object — readable at call site, order-independent
const { secondsLeft, minutes, seconds, isExpired } = useTimer(300, paused);

// ✅ Array — acceptable for simple value + setter pairs (like useState itself)
const [value, setValue] = useLocalStorage("key", defaultValue);

// ❌ Array with 3+ items — caller must remember order
const [a, b, c, d] = useTestSession(params);
```

---

## 7. Low Coupling, High Cohesion Applied to React

### High Cohesion — Things that belong together stay together

| Layer | What belongs together |
|---|---|
| `lib/question-bank.ts` | Question data and case study data only |
| `lib/test-session.ts` | Session building, scoring, localStorage |
| `lib/analytics.ts` | All derived computation from a result |
| `components/test/` | Everything that renders or manages a test |
| `components/ui/` | Stateless display primitives only |

### Low Coupling — Layers only know what they need to

```
ui/ components
    ↓ props only
feature components
    ↓ calls hooks
custom hooks
    ↓ calls functions
lib/ utilities
    ↓ imports
types/
```

**Violations to avoid:**

```ts
// ❌ A ui/ primitive importing from lib/
import { loadResult } from "@/lib/test-session"; // inside Button.tsx — wrong

// ❌ A lib/ function importing a React hook
import { useState } from "react"; // inside analytics.ts — wrong

// ❌ A page importing directly from question-bank to compute something
import { questions } from "@/lib/question-bank";
const weak = questions.filter(...)  // belongs in lib/analytics.ts
```

---

## 8. Professional Folder Structure

```
src/
├── types/
│   └── index.ts                    ← All shared TypeScript interfaces, one source of truth
│
├── config/
│   └── curriculum.ts               ← Static configuration data (subjects, chapters, etc.)
│
├── lib/                            ← Pure functions, no React, no JSX
│   ├── question-bank.ts            ← Data only
│   ├── test-session.ts             ← Session lifecycle (build, score, save, load)
│   └── analytics.ts                ← Derived computations from result data
│
├── hooks/                          ← Shared hooks used by 2+ features
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
│
├── components/
│   ├── ui/                         ← Atomic, domain-agnostic primitives
│   │   ├── index.ts                ← Barrel export
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Select.tsx
│   │   ├── StatCard.tsx
│   │   ├── Timer.tsx
│   │   └── PageShell.tsx
│   │
│   ├── setup/                      ← Setup flow
│   │   └── SetupForm.tsx
│   │
│   ├── test/                       ← Test session feature
│   │   ├── hooks/                  ← Feature-scoped hooks (internal only)
│   │   │   ├── useTestSession.ts   ← Co-located: single-use hook
│   │   │   └── useTimer.ts         ← Co-located: single-use hook
│   │   ├── index.ts                ← Exports components only, not hooks
│   │   ├── TestClient.tsx          ← Composition shell (~60 LOC)
│   │   ├── TestHeader.tsx
│   │   ├── TestControls.tsx
│   │   ├── QuestionView.tsx
│   │   ├── CaseStudyPanel.tsx
│   │   └── PausedOverlay.tsx
│   │
│   └── results/                    ← Results + performance feature
│       ├── hooks/                  ← Add only when a hook is actually needed
│       ├── index.ts
│       ├── ResultSummary.tsx
│       ├── AnswerReviewList.tsx
│       └── WeakChapterCard.tsx
│
├── app/                            ← Next.js route files ONLY
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/page.tsx
│   ├── setup/page.tsx
│   ├── demo-setup/page.tsx
│   ├── test/
│   │   ├── page.tsx                ← Suspense wrapper only
│   │   └── error.tsx
│   ├── results/
│   │   ├── page.tsx
│   │   └── not-found.tsx
│   └── performance/
│       └── page.tsx
│
└── styles/
    └── globals.css
```

---

## 9. Layer Responsibilities (What Goes Where)

| Layer | Allowed to import | Must never import |
|---|---|---|
| `types/` | Nothing | Anything |
| `config/` | `types/` | `lib/`, `hooks/`, `components/` |
| `lib/` | `types/`, `config/` | React, hooks, components |
| `hooks/` | `types/`, `lib/`, other hooks | components, app/ |
| `components/ui/` | `types/` only | `lib/`, `hooks/`, feature components |
| `components/<feature>/hooks/` | `types/`, `lib/`, `hooks/`, other co-located hooks | Other feature components, `app/`, `ui/` state |
| `components/<feature>/` | `types/`, `lib/`, `hooks/`, `ui/`, co-located hooks | Other feature components, `app/` |
| `app/` | Everything above | Nothing — pages are the top of the tree |

---

## 10. Component Taxonomy

### 1. UI Primitives (`components/ui/`)
- Accept only props
- No `lib/` imports
- No `localStorage`, no routing
- Renderable in Storybook with zero setup

### 2. Feature Components (`components/<feature>/`)
- Compose from ui/ primitives
- May use co-located hooks from their own `hooks/` subfolder
- May call `lib/` functions directly if no hook is needed
- `hooks/` subfolder is internal — never exported from the feature's `index.ts`

### 3. Page Components (`app/**/page.tsx`)
- Thin composition layer only
- Import from `components/` and call `lib/` for data fetching
- Zero business logic inline
- Target: under 50 LOC per page

---

## 11. Common Over-Engineering Mistakes

| Mistake | What it looks like | Fix |
|---|---|---|
| Hook with no React inside | `useComputeScore()` wrapping a pure function | Move to `lib/`, remove `use` prefix |
| Hook per event handler | `useHandleNext()`, `useHandleSelect()` | Inline the handlers in the component |
| Premature promotion | Single-use hook placed in `src/hooks/` | Co-locate next to its component |
| Context for non-global state | Using React Context for one page's state | Plain `useState` in the component |
| Over-splitting a component | `<ButtonLabel>` as its own component | Inline it — not everything needs extracting |
| Hook as a namespace | Hook that returns 15 things | Split by responsibility |
| `useMemo` everywhere | Memoizing a string concatenation | Only memoize genuinely expensive computations |

---

## 12. Quick Reference Card

```
New logic to write — ask in order:

1. Does it use a React primitive?
   No  → lib/ function, no `use` prefix
   Yes → it's a hook, continue

2. Is it used in 2+ components?
   Yes → src/hooks/ (shared)
   No  → co-locate next to the component

3. Does it justify extraction?
   Owns a side effect?              → extract
   3+ interdependent state values?  → extract
   Neither?                         → keep inline

4. Is it an event handler?
   Yes → always inline, never a hook

5. Does the name complete "responsible for ___ " without "and"?
   No → split it

Folder rule:
  ui/                → no domain knowledge, never a hooks/ subfolder
  lib/               → no React
  hooks/             → shared only, promoted when second consumer appears
  components/        → feature subfolders, not flat
  components/<feat>/ → hooks/ subfolder for feature-scoped hooks (keeps components and logic visually separate)
  app/               → route files only, zero business logic
```

---

> **Last updated for:** `apps/web` — CA Inter MCQ Practice Platform
> **Stack:** Next.js App Router · TypeScript · Tailwind CSS