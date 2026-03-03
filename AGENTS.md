# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project

PCUI (`@playcanvas/pcui`) — TypeScript UI component library with optional React wrappers and Observer-based data binding.

## Commands

```bash
npm ci                              # install
npm run build                       # full build (core + styles + types)
npm run build:es6                   # build core ESM only (required before tests)
npm test                            # run all tests
node --test test/components/foo.mjs # run single test
npm run lint                        # eslint + stylelint
npm run lint:js:fix                 # auto-fix JS lint
npm run develop                     # watch + serve
npm run storybook                   # component playground on :9000
```

Tests import from `dist/module/` — always run `build:es6` before `npm test`.

## Architecture

**Dual API:** Core (vanilla DOM classes) at `@playcanvas/pcui`, React wrappers at `@playcanvas/pcui/react`.

**Component pattern** (`src/components/<Name>/`): `index.ts` (core class), `component.tsx` (React wrapper), `component.stories.tsx`, `style.scss`.

**Class hierarchy:** `Element` → `InputElement` (for inputs) / `Container` (for parents). All in `src/components/`.

**Binding** (`src/binding/`): `BindingElementToObservers`, `BindingObserversToElement`, `BindingTwoWay` — connects UI to `@playcanvas/observer`.

**Styling:** SCSS, `pcui-<component>` class naming, two themes (grey/green) in `src/scss/`.

**Build:** Rollup produces three targets — `es6` → `dist/module/`, `react:es6` → `react/dist/module/`, `styles` → `styles/dist/`.

**Tests:** Node.js built-in test runner (`node:test`), `global-jsdom` for DOM, tests in `test/` as `.mjs` files importing compiled output.
