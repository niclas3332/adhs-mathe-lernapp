# ADHS-Mathe-Lernapp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Installierbare Offline-PWA, mit der eine Testleitung Kindern (Klasse 3–4, ADHS) 8 Gamification-Konzepte auf einem gemeinsamen Mathe-Aufgaben-Kern vorspielen lässt.

**Architecture:** Ein gemeinsamer Kern (Aufgaben ziehen, Runden-Ablauf, Profile in Local Storage) plus eine Basis-UI (`TaskCard`). Jedes der 8 Konzepte ist eine Komponente, die `useTaskRound` + `TaskCard` nutzt und nur Hülle und Belohnung ergänzt. Die Testleitung wählt Profil und Konzept in einem Erwachsenen-Bereich. Routing über `HashRouter`, Hosting auf GitHub Pages.

**Tech Stack:** React + TypeScript + Vite, `vite-plugin-pwa`, `react-router` (HashRouter), `canvas-confetti`, Web Audio API, Vitest + jsdom + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-07-adhs-mathe-lernapp-design.md`

## Global Constraints

- Kein Backend, keine Netzwerk-Requests zur Laufzeit; alle Daten in Local Storage unter Schlüssel `adhs-mathe:v1`.
- Aufgaben nur aus `src/data/tasks.json`.
- Alle UI-Texte Deutsch; Kinder-Texte in „du“-Form.
- Keine externen Bild-/Audio-Assets: Emojis, SVG/CSS, Web-Audio-Töne.
- Nie Bestrafung: kein Punkte-/Schlüssel-/Futter-Abzug, Haustier stirbt nicht, kein Zeitabzug.
- Fehler-Verhalten in allen Konzepten identisch: 1. Fehler → „Noch nicht ganz – versuch es nochmal.“, 2. Fehler → Lösung zeigen + „Weiter“-Button. Richtig im 2. Versuch zählt als richtig.
- Standard-Einstellungen: `soundOn: true`, `roundLength: 10` (5–20), `timeChallengeSeconds: 60` (30–180), `pauseSeconds: 20` (10–60).
- Basis-UI ruhig: Hintergrund `#F7F5F0`, Text `#1F2937`, Akzent `#2563EB`, Systemschrift, Aufgabentext ≥ 32 px, Touch-Flächen ≥ 56 px, `touch-action: manipulation`, Hochformat.
- Vite `base: '/adhs-mathe-lernapp/'` (GitHub Pages).
- Nie `npm run build` lokal (User-Regel). Dev-Server startet der User (`npm run dev`); falls er nicht läuft, User fragen. Erlaubt: `npx vitest run`, `npx tsc --noEmit -p tsconfig.app.json`.
- Commits auf `main`, nur wenn der User Commits freigegeben hat. Push erst nach expliziter Freigabe (Task 16).
- Tests liegen neben dem Code als `*.test.ts(x)`.

## Review Focus

1. **Doppel-Tippen auf „OK“ / Antwort-Button** während der Richtig-Animation → darf nicht doppelt belohnen. `submit` wird nur in Phase `answering`/`retry` angenommen (Test in Task 4).
2. **Kaputter oder fehlender Local Storage** (alte Version, manuell bearbeitet, iOS-Privatmodus wirft beim Zugriff) → App startet mit Standardwerten statt weißem Bildschirm (Test in Task 3).
3. **Aufgaben einer Stufe aufgebraucht, auch mitten in einer Runde** → Verlauf der Stufe wird zurückgesetzt, aber innerhalb der laufenden Runde kommt keine Aufgabe doppelt (Test in Task 2).
4. **Kurzes Tippen auf den Exit-Button** durch das Kind → kein Verlassen; nur 2 s Halten verlässt die Runde. Aufruf von `#/play/<id>` ohne aktives Profil oder mit unbekannter ID → Umleitung statt Absturz (Tests in Task 5 und 6).
5. **Leeres oder doppeltes Kürzel; aktives Profil löschen** → wird abgelehnt bzw. `activeProfileId` wird `null` (Test in Task 3).

---

## Datei-Übersicht

```
index.html                          # iOS-Meta-Tags
vite.config.ts                      # base, PWA-Plugin, Vitest-Config
public/icon.svg                     # Quelle für generierte Icons
src/main.tsx, src/App.tsx           # HashRouter + Routen
src/styles.css                      # Basis-Styles
src/test/setup.ts                   # jest-dom
src/data/tasks.json
src/core/types.ts                   # alle gemeinsamen Typen
src/core/tasks.ts                   # validateTasks, pickNextTask
src/core/storage.ts                 # loadState, saveState, Defaults, Profile-Reducer
src/core/AppStateContext.tsx        # Provider + Hooks
src/core/round.ts                   # reiner Runden-Reducer
src/core/useTaskRound.ts            # Hook: Reducer + Aufgaben ziehen + Persistenz
src/core/useSound.ts                # Web-Audio-Töne
src/components/                     # NumberPad, ChoiceButtons, TaskCard, HoldToExitButton, ConceptScreen, RoundEndScreen
src/admin/                          # ProfilesScreen, ConceptMenu, SettingsScreen, InstallHint
src/concepts/registry.ts
src/concepts/<id>/                  # pro Konzept: Komponente + ggf. *Logic.ts
.github/workflows/deploy.yml
```

---

### Task 1: Projekt-Setup + PWA

**Files:**
- Create: Vite-Grundgerüst, `vite.config.ts`, `index.html`, `public/icon.svg`, `src/test/setup.ts`, `src/smoke.test.ts`
- Modify: `package.json` (Scripts `test`, `typecheck`, `generate-pwa-assets`)

**Interfaces:**
- Produces: lauffähiges Vite-Projekt, `npx vitest run` funktioniert, jsdom + `@testing-library/jest-dom` eingerichtet.

- [ ] **Step 1: Scaffold in Temp-Ordner** (das Repo ist nicht leer wegen `.git`/`docs`; `--overwrite` würde löschen)

```bash
cd /tmp && npm create vite@latest adhs-scaffold -- --template react-ts
rsync -a --exclude .git /tmp/adhs-scaffold/ /Users/niclaspapst/ao/projects/adhs-mathe-lernapp/
rm -rf /tmp/adhs-scaffold
cd /Users/niclaspapst/ao/projects/adhs-mathe-lernapp && npm install
```
Danach Vite-Demo-Inhalte entfernen (`src/App.css`, `src/assets/`, Demo-Code in `App.tsx`).

- [ ] **Step 2: Abhängigkeiten installieren**

```bash
npm i react-router canvas-confetti
npm i -D vite-plugin-pwa @vite-pwa/assets-generator vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom @types/canvas-confetti
```
Vor der Konfiguration per context7 prüfen, dass die installierte `vite-plugin-pwa`-Version die installierte Vite-Version unterstützt und wie `HashRouter` in der installierten `react-router`-Version importiert wird.

- [ ] **Step 3: `vite.config.ts`**
  - `base: '/adhs-mathe-lernapp/'`
  - `VitePWA({ registerType: 'autoUpdate', manifest: { name: 'Mathe-Abenteuer', short_name: 'Mathe', lang: 'de', display: 'standalone', orientation: 'portrait', background_color: '#F7F5F0', theme_color: '#2563EB', start_url: '/adhs-mathe-lernapp/', scope: '/adhs-mathe-lernapp/', icons: [...] }, workbox: { globPatterns: ['**/*.{js,css,html,svg,png,json}'] } })`
  - `test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', globals: true }`

- [ ] **Step 4: Icons** — `public/icon.svg` (einfaches Motiv, z. B. „1+2“ weiß auf `#2563EB`), dann `npx pwa-assets-generator --preset minimal-2023 public/icon.svg` → Manifest-Icons eintragen.

- [ ] **Step 5: `index.html`** — `lang="de"`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`, `theme-color`, Titel „Mathe-Abenteuer“.

- [ ] **Step 6: Smoke-Test** — `src/smoke.test.ts`: `expect(1 + 1).toBe(2)`.

Run: `npx vitest run` → Expected: 1 passed. Run: `npx tsc --noEmit -p tsconfig.app.json` → keine Fehler.

- [ ] **Step 7: Commit** — `git add -A && git commit -m "chore: scaffold Vite React PWA"` (inkl. `docs/`)

---

### Task 2: Typen + Aufgaben-Logik

**Files:**
- Create: `src/core/types.ts`, `src/core/tasks.ts`, `src/core/tasks.test.ts`, `src/data/tasks.json` (vorläufig 6 Aufgaben pro Stufe, je 3 `input` + 3 `choice`)

**Interfaces:**
- Produces (`types.ts`):
```ts
export type Level = 1 | 2 | 3;
export type Topic = 'einmaleins' | 'plus' | 'minus' | 'geteilt' | 'text';
export interface Task { id: string; level: Level; topic: Topic; type: 'input' | 'choice'; question: string; answer: number; choices?: number[] }
export interface Settings { soundOn: boolean; roundLength: number; timeChallengeSeconds: number; pauseSeconds: number }
export interface PointsState { total: number; bestStreak: number; badges: string[] }
export interface PetState { name: string | null; fed: number }
export interface ChestState { keys: number; cards: string[] }   // Karten-IDs, Duplikate erlaubt
export interface MapState { position: number }
export interface TimeState { record: number }
export interface ConceptStates { points: PointsState; pet: PetState; chest: ChestState; map: MapState; time: TimeState }
export interface Profile { id: string; kuerzel: string; level: Level; createdAt: string; usedTaskIds: Record<Level, string[]>; concepts: ConceptStates }
export interface AppState { settings: Settings; activeProfileId: string | null; profiles: Profile[] }
```
- Produces (`tasks.ts`):
  - `validateTasks(raw: unknown): Task[]` — wirft `Error` mit Aufgaben-ID im Text bei: doppelter ID, Level nicht 1–3, `choice` ohne `choices`, `choices` enthält `answer` nicht, `choices` mit Duplikaten, `answer` keine ganze Zahl ≥ 0.
  - `allTasks: Task[]` — `validateTasks(tasksJson)`.
  - `pickNextTask(levelTasks: Task[], used: string[], roundIds: string[], rng?: () => number): { task: Task; used: string[] }`

- [ ] **Step 1: Failing Tests** (`tasks.test.ts`, mit kleinem Fixture-Array `t(id)` statt echter JSON):

```ts
it('picks only unused tasks', () => {
  const pool = [t('a'), t('b'), t('c')];
  const r = pickNextTask(pool, ['a', 'b'], [], () => 0);
  expect(r.task.id).toBe('c');
  expect(r.used).toEqual(['a', 'b', 'c']);
});
it('resets used list when level is exhausted', () => {
  const r = pickNextTask([t('a'), t('b')], ['a', 'b'], [], () => 0);
  expect(r.used).toEqual([r.task.id]);
});
it('never repeats a task of the current round after a reset', () => {
  const pool = [t('a'), t('b'), t('c')];
  const r = pickNextTask(pool, ['a', 'b', 'c'], ['a', 'b'], () => 0);
  expect(r.task.id).toBe('c');
});
it('falls back to whole pool if round already used every task', () => {
  const r = pickNextTask([t('a')], ['a'], ['a'], () => 0);
  expect(r.task.id).toBe('a');
});
it('rejects choice task whose choices miss the answer', () => {
  expect(() => validateTasks([{ id: 'x', level: 1, topic: 'plus', type: 'choice', question: '1+1', answer: 2, choices: [1, 3] }])).toThrow(/x/);
});
it('rejects duplicate ids', () => { /* zwei Aufgaben mit id 'x' */ expect(...).toThrow(/x/); });
it('accepts the real tasks.json', () => { expect(allTasks.length).toBeGreaterThan(0); });
```

- [ ] **Step 2:** `npx vitest run src/core/tasks.test.ts` → FAIL (Modul fehlt)
- [ ] **Step 3:** `types.ts`, `tasks.ts`, Start-`tasks.json` schreiben. Algorithmus `pickNextTask`: Kandidaten = nicht in `used`; wenn leer → `used = []`, Kandidaten = nicht in `roundIds`; wenn immer noch leer → ganzer Pool. Index = `Math.floor(rng() * candidates.length)`. Rückgabe-`used` = `[...used, task.id]`.
- [ ] **Step 4:** `npx vitest run src/core/tasks.test.ts` → PASS
- [ ] **Step 5: Commit** `feat: task types and drawing without repetition`

---

### Task 3: Speicher + Profile

**Files:**
- Create: `src/core/storage.ts`, `src/core/storage.test.ts`, `src/core/AppStateContext.tsx`, `src/core/AppStateContext.test.tsx`

**Interfaces:**
- Consumes: Typen aus Task 2.
- Produces (`storage.ts`):
  - `STORAGE_KEY = 'adhs-mathe:v1'`, `DEFAULT_SETTINGS: Settings`, `emptyConcepts(): ConceptStates` (alles 0 / leer / `name: null`)
  - `loadState(storage?: Storage): AppState` — nie werfen; fehlend/kaputt/Zugriff wirft → Default-State; fehlende Settings-Felder mit Defaults auffüllen; Settings per `clampSettings`.
  - `saveState(state: AppState, storage?: Storage): void` — Fehler beim Schreiben abfangen (`console.warn`).
  - `clampSettings(s: Settings): Settings` (Grenzen siehe Global Constraints, Zahlen gerundet)
  - `appReducer(state: AppState, action: AppAction): AppState` mit
    `AppAction = { type: 'addProfile'; kuerzel: string; level: Level; id: string; createdAt: string } | { type: 'deleteProfile'; id: string } | { type: 'setActive'; id: string | null } | { type: 'setLevel'; id: string; level: Level } | { type: 'updateProfile'; id: string; update: (p: Profile) => Profile } | { type: 'updateSettings'; patch: Partial<Settings> }`
  - `validateKuerzel(kuerzel: string, profiles: Profile[]): string | null` — Fehlertext oder `null`; trimmen, leer → „Bitte ein Kürzel eingeben.“, max. 12 Zeichen, doppelt (ohne Groß/Klein) → „Dieses Kürzel gibt es schon.“
- Produces (`AppStateContext.tsx`):
  - `<AppStateProvider storage?: Storage>` — lädt einmal, speichert bei jeder Änderung.
  - `useAppState(): { state: AppState; dispatch: (a: AppAction) => void }`
  - `useActiveProfile(): Profile | null`
  - `useConceptState<K extends keyof ConceptStates>(key: K): [ConceptStates[K], (next: ConceptStates[K]) => void]` — für das aktive Profil.

- [ ] **Step 1: Failing Tests** (`storage.test.ts`, mit In-Memory-`Storage`-Fake):

```ts
it('returns defaults for corrupt JSON', () => { mem.setItem(STORAGE_KEY, '{oops'); expect(loadState(mem).settings).toEqual(DEFAULT_SETTINGS); });
it('returns defaults when storage access throws', () => { expect(loadState(throwingStorage).profiles).toEqual([]); });
it('fills missing settings fields', () => { mem.setItem(STORAGE_KEY, JSON.stringify({ settings: { soundOn: false }, profiles: [], activeProfileId: null })); expect(loadState(mem).settings).toEqual({ ...DEFAULT_SETTINGS, soundOn: false }); });
it('clamps settings', () => { expect(clampSettings({ soundOn: true, roundLength: 99, timeChallengeSeconds: 5, pauseSeconds: 20 })).toMatchObject({ roundLength: 20, timeChallengeSeconds: 30 }); });
it('deleting the active profile clears activeProfileId', () => { /* add, setActive, delete */ expect(s.activeProfileId).toBeNull(); });
it('rejects empty and duplicate kuerzel', () => {
  expect(validateKuerzel('  ', [])).toBe('Bitte ein Kürzel eingeben.');
  expect(validateKuerzel('lk', [profile('LK')])).toBe('Dieses Kürzel gibt es schon.');
});
it('profiles keep separate concept state', () => { /* updateProfile auf A ändert B nicht */ });
```
`AppStateContext.test.tsx`: Provider mit Fake-Storage, `useConceptState('points')` setzen → Fake-Storage enthält neuen Wert; neu gerenderter Provider liest ihn wieder.

- [ ] **Step 2:** `npx vitest run src/core` → FAIL
- [ ] **Step 3:** Implementieren (Profil-IDs via `crypto.randomUUID()` im Provider, nicht im Reducer).
- [ ] **Step 4:** `npx vitest run src/core` → PASS
- [ ] **Step 5: Commit** `feat: local storage state and child profiles`

---

### Task 4: Runden-Ablauf

**Files:**
- Create: `src/core/round.ts`, `src/core/round.test.ts`, `src/core/useTaskRound.ts`, `src/core/useTaskRound.test.tsx`

**Interfaces:**
- Consumes: `pickNextTask`, `allTasks` (Task 2); `useActiveProfile`, `useAppState` (Task 3).
- Produces (`round.ts`):
```ts
export type Phase = 'answering' | 'retry' | 'correct' | 'solution' | 'break' | 'done';
export interface RoundState { task: Task | null; phase: Phase; attempts: number; wrongAnswers: number[]; correctCount: number; streak: number; roundIds: string[] }
export type RoundAction = { type: 'load'; task: Task } | { type: 'submit'; answer: number } | { type: 'break' } | { type: 'finish' };
export function initialRound(): RoundState;
export function roundReducer(s: RoundState, a: RoundAction): RoundState;
```
  Regeln: `submit` nur in `answering`/`retry`, sonst State unverändert. Richtig → `correct`, `correctCount+1`; `streak+1` nur wenn `attempts === 0`. Falsch im 1. Versuch → `retry`, `attempts=1`, `streak=0`, Antwort in `wrongAnswers`. Falsch im 2. Versuch → `solution`. `load` → `answering`, `attempts=0`, `wrongAnswers=[]`, `roundIds` + ID.
- Produces (`useTaskRound.ts`):
```ts
export interface UseTaskRoundOptions {
  maxTasks: number | null;                        // null = unbegrenzt (Zeit-Challenge)
  paused?: boolean;                               // hält Auto-Weiter an
  autoAdvanceMs?: number;                         // Default 1200
  pauseAfter?: (completed: number) => boolean;    // true → Phase 'break' statt nächster Aufgabe
  onCorrect?: (e: { firstTry: boolean; streak: number; correctCount: number }) => void;
  onWrong?: (e: { final: boolean }) => void;
}
export interface RoundApi {
  task: Task | null; phase: Phase; index: number /* 0-basiert */; total: number | null;
  correctCount: number; streak: number; wrongAnswers: number[];
  submit(answer: number): void; next(): void; resume(): void; finish(): void;
}
export function useTaskRound(opts: UseTaskRoundOptions): RoundApi;
```
  Verhalten: lädt beim Mount die 1. Aufgabe aus `allTasks` der Profil-Stufe; nach jedem Laden `usedTaskIds[level]` des Profils speichern. In `correct` nach `autoAdvanceMs` automatisch `next()` (nicht wenn `paused`). `next()`: wenn `roundIds.length >= maxTasks` → `done`; sonst wenn `pauseAfter?.(roundIds.length)` → `break`; sonst nächste Aufgabe. `resume()` aus `break` → nächste Aufgabe. Callbacks werden in `submit` aus dem aktuellen State berechnet und genau einmal aufgerufen.

- [ ] **Step 1: Failing Tests** — `round.test.ts`:

```ts
it('ignores submit while showing correct feedback (no double reward)', () => {
  let s = roundReducer(initialRound(), { type: 'load', task: task56 });
  s = roundReducer(s, { type: 'submit', answer: 56 });
  const again = roundReducer(s, { type: 'submit', answer: 56 });
  expect(again.correctCount).toBe(1);
});
it('first wrong → retry, second wrong → solution', () => { ... expect(s.phase).toBe('retry'); ... expect(s.phase).toBe('solution'); });
it('correct on second try counts but does not grow streak', () => { ... expect(s.correctCount).toBe(1); expect(s.streak).toBe(0); });
it('remembers wrong answers for disabling choice buttons', () => { ... expect(s.wrongAnswers).toEqual([54]); });
```
`useTaskRound.test.tsx` (renderHook + Provider mit Fake-Storage + aktivem Profil, Fake-Timer):

```ts
it('finishes after maxTasks', ...);                      // 3× richtig + Timer → phase 'done'
it('persists used task ids to the profile', ...);        // nach 1. Aufgabe: usedTaskIds[1] enthält task.id
it('enters break when pauseAfter returns true', ...);    // pauseAfter: n => n === 1 → 'break'; resume → 'answering'
it('does not auto-advance while paused', ...);           // paused: true, Timer laufen lassen → bleibt 'correct'
it('calls onCorrect once per correct answer', ...);      // doppeltes submit → 1 Aufruf
```

- [ ] **Step 2:** `npx vitest run src/core/round.test.ts src/core/useTaskRound.test.tsx` → FAIL
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** gleiche Tests → PASS
- [ ] **Step 5: Commit** `feat: shared task round flow`

---

### Task 5: Basis-UI-Komponenten + Sound

**Files:**
- Create: `src/styles.css`, `src/core/useSound.ts`, `src/components/NumberPad.tsx`, `ChoiceButtons.tsx`, `TaskCard.tsx`, `HoldToExitButton.tsx`, `ConceptScreen.tsx`, `RoundEndScreen.tsx` + Tests `NumberPad.test.tsx`, `ChoiceButtons.test.tsx`, `HoldToExitButton.test.tsx`, `TaskCard.test.tsx`

**Interfaces:**
- Consumes: `RoundApi` (Task 4), `useAppState` (Task 3).
- Produces:
  - `type SoundKind = 'correct' | 'wrong' | 'reward' | 'tick'`; `useSound(): (kind: SoundKind) => void` — nichts tun, wenn `settings.soundOn === false`; ein `AudioContext` lazy, `resume()` beim Abspielen (iOS); kurze Oszillator-Töne (correct: zwei steigende Töne, wrong: ein weicher tiefer Ton, reward: kurze Dreiklang-Folge, tick: sehr kurzer Klick).
  - `<NumberPad onSubmit={(n: number) => void} disabled?: boolean />` — Tasten 0–9, „⌫“, „OK“; max. 4 Ziffern; OK deaktiviert bei leerer Eingabe; Eingabe nach Submit leeren.
  - `<ChoiceButtons choices={number[]} onSelect={(n) => void} disabled?: boolean disabledValues?: number[] />`
  - `<TaskCard round={RoundApi} />` — zeigt `task.question`, je nach `task.type` NumberPad oder ChoiceButtons (mit `disabledValues={round.wrongAnswers}`), Eingabe deaktiviert außer in `answering`/`retry`. Texte: `correct` „Richtig!“, `retry` „Noch nicht ganz – versuch es nochmal.“, `solution` „Leider falsch, richtig ist {answer}.“ + Button „Weiter“ → `round.next()`.
  - `<HoldToExitButton onExit={() => void} holdMs?: number /* 2000 */ />` — Pointer-Events; Loslassen/Verlassen vor Ablauf bricht ab; zeigt Fortschrittsring; Label `aria-label="Gedrückt halten zum Beenden"`.
  - `<ConceptScreen top?: ReactNode>{children}</ConceptScreen>` — Vollbild-Layout, `HoldToExitButton` oben rechts → `navigate('/menu')`, `top` als Kopfzeile.
  - `<RoundEndScreen title: string>{children}</RoundEndScreen>` — Button „Fertig“ → `navigate('/menu')`.

- [ ] **Step 1: Failing Tests**

```ts
// NumberPad
it('submits 007 as 7', ...);                  // Tippen 0,0,7,OK → onSubmit(7)
it('OK is disabled when empty', ...);
it('accepts at most 4 digits', ...);          // 1,2,3,4,5,OK → onSubmit(1234)
// ChoiceButtons
it('disables values listed in disabledValues', ...);
// HoldToExitButton (fake timers)
it('does not exit on short press', ...);      // pointerDown, 500 ms, pointerUp → onExit nicht aufgerufen
it('exits after holding 2 s', ...);           // pointerDown, 2000 ms → onExit 1×
// TaskCard
it('shows solution text after two wrong answers', ...); // erwartet „Leider falsch, richtig ist 56.“
```

- [ ] **Step 2:** `npx vitest run src/components` → FAIL
- [ ] **Step 3:** Implementieren; Basis-Styles aus Global Constraints in `styles.css`.
- [ ] **Step 4:** `npx vitest run src/components` → PASS
- [ ] **Step 5: Commit** `feat: base task UI, hold-to-exit and sound`

---

### Task 6: Testleitungs-Bereich, Routing, Konzept „Ohne Gamification“

**Files:**
- Create: `src/App.tsx` (ersetzen), `src/admin/ProfilesScreen.tsx`, `ConceptMenu.tsx`, `SettingsScreen.tsx`, `InstallHint.tsx`, `src/concepts/registry.ts`, `src/concepts/plain/PlainConcept.tsx`, `src/App.test.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: Tasks 3–5.
- Produces (`registry.ts`):
```ts
export type ConceptId = 'points' | 'pet' | 'chest' | 'feedback' | 'map' | 'time' | 'stages' | 'plain';
export interface ConceptDef { id: ConceptId; name: string; emoji: string; description: string; Component: React.ComponentType }
export const concepts: ConceptDef[];
export function findConcept(id: string | undefined): ConceptDef | undefined;
```
  Spätere Tasks fügen nur einen Eintrag in `concepts` hinzu. Reihenfolge im Menü = Nummerierung der Spec (1 Punkte … 8 Ohne).
- Routen (HashRouter): `/` Profile · `/menu` Konzept-Menü · `/settings` · `/install` · `/play/:conceptId`. `/menu` und `/play/*` ohne aktives Profil → `/`. Unbekannte `conceptId` → `/menu`.
- Profile-Screen: Liste (Kürzel, Stufe), „Neues Kind“ (Kürzel + Stufe 1/2/3, Fehler aus `validateKuerzel` anzeigen), Antippen → aktiv + `/menu`, Stufe ändern, Löschen mit `window.confirm`.
- Konzept-Menü: Kopf mit aktivem Kürzel + „Kind wechseln“; 8 Kacheln (Emoji, Name, Beschreibung); Links zu Einstellungen und Install-Hinweis.
- Einstellungen: Sound-Schalter, 3 Zahlen-Felder mit Grenzen; Speichern über `updateSettings` (wird geclamped).
- Install-Hinweis: iPhone (Safari → Teilen → „Zum Home-Bildschirm“) und Android (Chrome → Menü → „App installieren“).
- `PlainConcept`: `ConceptScreen` + `TaskCard` mit `maxTasks: settings.roundLength`, Kopfzeile „Aufgabe {index+1} von {total}“, kein Sound, keine Animation; Ende: `RoundEndScreen title="Fertig"`.

- [ ] **Step 1: Failing Tests** (`App.test.tsx`, `MemoryRouter` bzw. Hash setzen, Fake-Storage):

```ts
it('redirects /play/plain to profiles when no profile is active', ...);
it('redirects unknown concept id to menu', ...);
it('creates profile, opens menu, shows 1 concept tile (plain)', ...);
it('shows kuerzel validation error for duplicates', ...);
```
- [ ] **Step 2:** `npx vitest run src/App.test.tsx` → FAIL
- [ ] **Step 3:** Implementieren.
- [ ] **Step 4:** `npx vitest run` → PASS; `npx tsc --noEmit -p tsconfig.app.json` → ok
- [ ] **Step 5: Manueller Check** — User bitten, `npm run dev` zu starten. Mit Playwright-MCP, Viewport 390×844, `http://localhost:5173/adhs-mathe-lernapp/`: Profil anlegen → „Ohne Gamification“ → 10 Aufgaben (eine absichtlich 2× falsch) → „Fertig“ → Menü. Exit-Button kurz tippen → bleibt; 2 s halten → Menü.
- [ ] **Step 6: Commit** `feat: test-leader area, routing and plain concept`

---

### Tasks 7–13: Die Gamification-Konzepte

Gemeinsames Muster für jeden Task:
- Ordner `src/concepts/<id>/`, Komponente `<Name>Concept.tsx`, reine Logik in `<id>Logic.ts` mit `<id>Logic.test.ts` (TDD: Test → FAIL → Implementierung → PASS).
- Komponente nutzt `ConceptScreen`, `TaskCard`, `useTaskRound`, `useSound` und (falls persistent) `useConceptState('<key>')`. Sound: `correct`/`wrong` in `onCorrect`/`onWrong`, `reward` bei Belohnungs-Ereignissen.
- Eintrag in `registry.ts` hinzufügen.
- Abschluss: `npx vitest run` → PASS, `npx tsc --noEmit -p tsconfig.app.json` → ok, Playwright-Durchlauf einer Runde im Handy-Viewport, Commit `feat: <name> concept`.

### Task 7: Sofort-Feedback & Animation (`feedback`)

- Keine persistente Logik, kein Logik-Test nötig; Komponententest: `onCorrect` löst `canvas-confetti` aus (Modul mocken).
- Bei richtig: Konfetti, Sound `correct`, Maskottchen-Emoji (🦊) hüpft (CSS-Keyframe), zufälliger Lob-Satz aus `PRAISE` (≥ 10 Sätze, z. B. „Stark!“, „Wow, super gerechnet!“). Keine Punkte, keine Zähler.
- `maxTasks: settings.roundLength`. Ende: `RoundEndScreen title="Super gemacht!"` mit Maskottchen.

### Task 8: Punkte & Abzeichen (`points`)

- `pointsLogic.ts`: `applyCorrect(state: PointsState, streak: number): { state: PointsState; gained: number; newBadges: Badge[] }`; `gained = 10 + (streak >= 3 ? 5 : 0)`; `bestStreak = max`. `BADGES: Badge[]` (`{ id; name; emoji; earned(s: PointsState): boolean }`):
  `first` „Erster Treffer“ (total ≥ 10), `p50` (≥ 50), `p100` (≥ 100), `p250` (≥ 250), `p500` (≥ 500), `s3` „3 in Folge“ (bestStreak ≥ 3), `s5` (≥ 5), `s10` (≥ 10).
- Tests: `gained` 10 bei streak 2, 15 bei streak 3; Badge wird genau einmal vergeben (zweiter Aufruf → `newBadges` leer); falsche Antwort ändert nichts (kein Aufruf → kein Abzug).
- UI: Punktestand oben mit „+10“-Animation, Streak-Flamme ab 3; neues Abzeichen → Overlay 2 s (`paused` währenddessen). Ende: Punkte dieser Runde + Abzeichen-Wand (verdiente farbig, andere grau).

### Task 9: Schlüssel & Schatztruhe (`chest`)

- `chestLogic.ts`: `KEYS_PER_CHEST = 3`; `CARDS: Card[]` (20 Stück, `{ id; name; emoji; rarity: 'normal' | 'selten' | 'super-selten' }`: 12 / 6 / 2); Gewichte 70 / 25 / 5 %.
  `addKey(s: ChestState): { state: ChestState; chestReady: boolean }`; `openChest(s: ChestState, rng?: () => number): { state: ChestState; card: Card }` (wirft bei `keys < 3`; zieht 3 ab; Karte an `cards` anhängen). Seltenheit zuerst über Gewicht, dann gleichverteilt innerhalb der Seltenheit.
- Tests: 3. Schlüssel → `chestReady`; `openChest` mit `rng = () => 0.99` → `super-selten`, mit `() => 0` → `normal`; `keys` nach Öffnen −3; bei < 3 → wirft.
- UI: Schlüssel-Leiste (🔑 × keys); bei `chestReady` Overlay mit Truhe 🧰 „Antippen zum Öffnen“ → Wackel-Animation → Karte mit Seltenheits-Rahmen, Sound `reward`; Runde währenddessen `paused`. Überzählige Schlüssel bleiben im Profil. Ende: Sammelalbum (20 Plätze, fehlende als „?“, Anzahl bei Duplikaten).

### Task 10: Virtuelles Haustier (`pet`)

- `petLogic.ts`: `petStage(fed: number): 'egg' | 'baby' | 'big'` (`egg` < 5, `baby` 5–29, `big` ≥ 30); `PET_EMOJI = { egg: '🥚', baby: '🐣', big: '🐲' }`; `feed(s: PetState): { state: PetState; grewTo: Stage | null }`; `petName(s): string` → `s.name ?? 'Flocke'`.
- Tests: Grenzen 4/5/29/30; `grewTo` nur beim Übergang gesetzt.
- UI: Beim ersten Start (`name === null`) Namens-Screen (max. 12 Zeichen, leer → „Flocke“). Großes Haustier in der Mitte, richtige Antwort → 🍎 fliegt zum Tier, Tier freut sich (Animation), Sound `correct`; Wachstum → Overlay „{Name} ist gewachsen!“ (`paused`). Falsch → Tier schaut aufmunternd, keine negativen Zustände. Ende: Tier + „{Name} hat heute {n}× gefuttert“.

### Task 11: Abenteuer-Karte (`map`)

- `mapLogic.ts`: `MAP_LENGTH = 50`; `STATIONS` (10 Stück, alle 5 Felder: `{ at: 5 | 10 | … | 50; emoji; text }`, z. B. „Du hast den Zauberwald erreicht!“); `stepForward(s: MapState): { state: MapState; reachedStation: Station | null; lap: number }` — `lap = Math.floor(position / MAP_LENGTH) + 1`, Anzeige-Position `position % MAP_LENGTH`.
- Tests: Schritt 4→5 liefert Station 5; 49→50 liefert Station 50 und danach Anzeige-Position 0, `lap` 2.
- UI: SVG/CSS-Pfad mit Feldern und Stations-Emojis, Spielfigur 🧒 bewegt sich animiert; Station erreicht → Overlay mit Text (`paused`), Sound `reward`. Ende: Karte mit aktueller Position.

### Task 12: Zeit-Challenge (`time`)

- `timeLogic.ts`: `updateRecord(s: TimeState, score: number): { state: TimeState; isNewRecord: boolean }` (nur bei `score > record`).
- Tests: 5 vs. Rekord 4 → neu; 4 vs. 4 → nicht neu.
- UI: Start-Screen „Wie viele schaffst du in {n} Sekunden? Dein Rekord: {record}“ + „Los!“; dann `useTaskRound({ maxTasks: null, autoAdvanceMs: 500 })`, Countdown-Balken (schrumpft, letzte 10 s Sound `tick` pro Sekunde), Zähler richtig; bei 0 → `finish()` (auch mitten in Feedback). Timer läuft weiter, auch in `solution`. Ende: Ergebnis + „Neuer Rekord!“ (Sound `reward`) oder „Dein Rekord: {record}“.

### Task 13: Mini-Etappen mit Pausen (`stages`)

- `stagesLogic.ts`: `STAGE_COUNT = 3`, `TASKS_PER_STAGE = 3`; `isStageEnd(completed: number): boolean` → `completed % 3 === 0 && completed < 9`; `EXERCISES` (≥ 6, z. B. „Hüpfe 5× auf der Stelle“, „Atme tief ein … und aus“ ×3, „Strecke dich ganz hoch“).
- Tests: `isStageEnd` 3 → true, 6 → true, 9 → false, 4 → false.
- UI: `useTaskRound({ maxTasks: 9, pauseAfter: isStageEnd })`; Fortschrittsbalken mit 3 Segmenten à 3 Punkten. In Phase `break`: Pause-Screen mit zufälliger Übung, animierter Kreis (Atem) und Countdown `settings.pauseSeconds`, danach automatisch `resume()`; Button „Weiter“ erlaubt früheres Fortsetzen. Ende: „Alle 3 Etappen geschafft!“.

---

### Task 14: Vollständige `tasks.json`

**Files:**
- Modify: `src/data/tasks.json`
- Test: `src/core/tasks.test.ts` (ergänzen)

- [ ] **Step 1: Failing Tests ergänzen**

```ts
it.each([1, 2, 3])('level %i has at least 80 tasks', (lvl) => { expect(allTasks.filter(t => t.level === lvl).length).toBeGreaterThanOrEqual(80); });
it('every level mixes input and choice tasks and all topics of its level', ...);
it('arithmetic questions compute to their answer', () => {
  // für topic einmaleins/plus/minus/geteilt: question im Format "a op b" mit op ∈ {+, −, ×, :} parsen und answer prüfen
});
```
- [ ] **Step 2:** `npx vitest run src/core/tasks.test.ts` → FAIL
- [ ] **Step 3:** Aufgaben schreiben nach Stufen-Definition der Spec:
  - Stufe 1: Einmaleins 2/5/10, Plus/Minus bis 100 ohne Übertrag, Text mit 1 Rechenschritt
  - Stufe 2: ganzes Einmaleins, Plus/Minus bis 100 mit Übertrag, Text mit 1 Schritt
  - Stufe 3: Plus/Minus bis 1000, Geteilt (Einmaleins-Umkehr), Text mit 2 Schritten
  - pro Stufe ~50 % `input`, ~50 % `choice` (3 Antworten, Distraktoren plausibel: ±1, ±10, Nachbar-Einmaleins); Operatoren `+`, `−`, `×`, `:`; Textaufgaben max. 2 kurze Sätze.
- [ ] **Step 4:** Tests → PASS
- [ ] **Step 5: Commit** `feat: full task set for levels 1-3`
- [ ] **Step 6:** User bitten, `src/data/tasks.json` fachlich zu prüfen.

---

### Task 15: Abschluss-Check aller Konzepte

- [ ] `npx vitest run` → alles PASS; `npx tsc --noEmit -p tsconfig.app.json` → ok
- [ ] Playwright-MCP, Viewport 390×844: zwei Profile anlegen; mit Profil A Punkte + Truhe + Haustier + Karte spielen; zu Profil B wechseln → dort alles auf Anfang; zurück zu A → Stand erhalten. Einstellungen: Sound aus, `roundLength` 5 → „Ohne“ hat 5 Aufgaben.
- [ ] Alle 8 Konzepte einmal bis zum End-Screen durchspielen.

---

### Task 16: Deployment GitHub Pages

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1:** Workflow: Trigger `push` auf `main` + `workflow_dispatch`; Job `build`: `actions/checkout`, `actions/setup-node` (Node 22, Cache npm), `npm ci`, `npx vitest run`, `npm run build`, `actions/upload-pages-artifact` mit `dist`; Job `deploy`: `actions/deploy-pages`; Permissions `pages: write`, `id-token: write`. Aktuelle Major-Versionen der Actions vorher prüfen.
- [ ] **Step 2: Commit** `ci: deploy to GitHub Pages`
- [ ] **Step 3: User fragen** (Stopp): Repo-Sichtbarkeit (Pages bei privatem Repo braucht GitHub Pro), Freigabe für `git push origin main`, und User aktiviert in GitHub unter Settings → Pages → Source „GitHub Actions“.
- [ ] **Step 4:** Nach Freigabe pushen, `gh run watch` → Erfolg; `https://niclas3332.github.io/adhs-mathe-lernapp/` aufrufen → App lädt; DevTools/Playwright: Manifest erkannt, Service Worker aktiv, Reload offline funktioniert.
- [ ] **Step 5:** User testet Installation auf echtem iPhone (Safari) und Android (Chrome), Start offline.
