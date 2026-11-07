# ADHS-Mathe-Lernapp – Design & Plan

## Context

Uni-Prototyp. Ziel: Testen, welche Gamification-Konzepte Kinder mit ADHS (Klasse 3–4) beim Mathe-Lernen motiviert halten. Die Testleitung lässt ein Kind nacheinander mehrere Konzepte spielen und befragt es danach (Befragung auf Papier/mündlich, **nicht** in der App). Das Repo `adhs-mathe-lernapp` ist leer (Branch `main`, keine Commits).

Erfolg = Testleitung kann auf einem Handy pro Kind ein Profil anlegen, ein Konzept wählen, das Kind spielt eine Runde, zurück ins Menü, nächstes Konzept. Läuft offline, installierbar auf iPhone + Android ohne Store.

## Entscheidungen des Users

- Web-App, installierbar als PWA auf iPhone/Android, kein Store
- Kein Backend: Local Storage + Aufgaben in JSON
- Klasse 3–4 (Einmaleins, Plus/Minus bis 1000, kurze Textaufgaben)
- **Testleitung wählt** das Konzept in einem Erwachsenen-Menü
- Befragung außerhalb der App → App zeichnet **keine** Forschungsdaten auf
- Eingabe: **beides gemischt** – jede Aufgabe in der JSON legt fest: Zahleneingabe oder Multiple Choice
- **Kinder-Profile** (Kürzel), Fortschritt pro Kind bleibt über mehrere Termine
- Sound: ja, global abschaltbar
- **Keine Aufgaben-Wiederholung pro Kind:** Profil speichert benutzte Aufgaben-IDs; erst wenn eine Stufe aufgebraucht ist, wird der Verlauf dieser Stufe zurückgesetzt
- **Hosting: GitHub Pages** (Remote existiert: `github.com/niclas3332/adhs-mathe-lernapp`)
- **Immer ein Test-Gerät** → kein Export/Import
- Termin noch offen → alle 8 Konzepte in der geplanten Reihenfolge, jedes einzeln nutzbar
- 8 Konzepte:
  1. Punkte & Abzeichen
  2. Virtuelles Haustier
  3. Schlüssel & Schatztruhe (Loot Box: Schlüssel für richtige Aufgaben → Truhe öffnen → zufällige Sammelkarte)
  4. Sofort-Feedback & Animation
  5. Abenteuer-Karte
  6. Zeit-Challenge
  7. Mini-Etappen mit Pausen
  8. Ohne Gamification (Vergleich)

## Ziele / Nicht-Ziele / Anti-Ziele

- **Ziele:** 8 klar unterscheidbare Konzepte auf **demselben Aufgaben-Kern** (gleiche Aufgaben, gleiche Eingabe, gleiches Fehler-Verhalten) → faire Vergleichbarkeit.
- **Nicht-Ziele:** Backend, Login, Logging/Analytics, In-App-Fragebogen, Store-Release, Mehrsprachigkeit.
- **Anti-Ziele (wäre ein Fehlschlag, auch wenn es technisch läuft):**
  - Konzepte unterscheiden sich in Schwierigkeit oder Aufgaben → Vergleich verfälscht
  - Bestrafung/Beschämung bei Fehlern (z. B. Haustier stirbt, Punkte-Abzug)
  - Kind landet aus Versehen im Testleitungs-Menü oder in einem anderen Konzept
  - Basis-UI selbst ist schon überladen/bunt → „Ohne Gamification“ wäre kein neutraler Vergleich

## Meine Entscheidungen (Claude, vom User korrigierbar)

- **Stack:** React + TypeScript + Vite + `vite-plugin-pwa` (Manifest + Service Worker, offline). Routing per `react-router` im Hash-Modus (funktioniert auf jedem statischen Hosting). Konfetti via `canvas-confetti`. Sounds per Web Audio API erzeugt (keine Audio-Dateien, keine Lizenzfragen). Tests mit Vitest.
- **Grafik:** Emojis + einfache SVG/CSS – keine externen Assets.
- **UI-Basis:** ruhig, hoher Kontrast, große Touch-Flächen, Hochformat, deutsche Texte. Gamification-Elemente nur in den jeweiligen Konzept-Hüllen.
- **Fehler-Verhalten (für alle gleich):** falsche Antwort → freundlicher Hinweis, 2. Versuch; danach Lösung zeigen, weiter. Nie Abzug.
- **Rundenlängen (Standard, in Einstellungen änderbar):**
  - Standard: 10 Aufgaben
  - Zeit-Challenge: 60 Sekunden, Ziel = eigenen Rekord schlagen, kein Zeitabzug bei Fehlern
  - Mini-Etappen: 3 Etappen à 3 Aufgaben, dazwischen 20 s Pause (Bewegungs- oder Atem-Übung, animiert)
- **Testleitung-Zugang aus einer Runde:** kleiner Button in der Ecke, **2 s gedrückt halten** → zurück ins Menü (Kind kommt nicht aus Versehen raus).
- **Schwierigkeit:** Stufe 1–3 pro Profil, von Testleitung einstellbar. Folgt dem einzelnen Kind, nicht der Klasse.
  - Stufe 1: Einmaleins 2/5/10, Plus/Minus bis 100 ohne Übertrag, Text mit 1 Rechenschritt
  - Stufe 2: ganzes Einmaleins, Plus/Minus bis 100 mit Übertrag, Text mit 1 Schritt
  - Stufe 3: Plus/Minus bis 1000, Einmaleins-Umkehr (Division), Text mit 2 Schritten
  - Ich schreibe die Aufgaben; der User prüft `tasks.json` danach.
- **iOS-Install-Hinweis:** Info-Screen „Teilen → Zum Home-Bildschirm“ im Testleitungs-Menü (iOS hat keinen Install-Prompt).

## Konzept-Details

| # | Konzept | Mechanik | Persistent im Profil |
|---|---|---|---|
| 1 | Punkte & Abzeichen | +10 pro richtig, Streak-Bonus, ~8 Abzeichen (z. B. „5 richtig in Folge“, „100 Punkte“), Abzeichen-Wand | Punkte, Abzeichen |
| 2 | Virtuelles Haustier | Ei → Baby → Groß; richtige Antwort = füttern (Animation), Wachstum über Termine. Kein Sterben, kein Hunger-Schuldgefühl | Stufe, Futter-Zähler, Name |
| 3 | Schlüssel & Schatztruhe | 1 Schlüssel pro richtig, 3 Schlüssel = Truhe öffnen (Animation) → zufällige Karte aus ~20 (Seltenheit: normal/selten/super-selten), Sammelalbum | Schlüssel, Kartensammlung |
| 4 | Sofort-Feedback | Konfetti, Sound, hüpfende Figur, wechselnde Lob-Sätze bei jeder richtigen Antwort. Keine Punkte | – |
| 5 | Abenteuer-Karte | Pfad mit Stationen, jede richtige Antwort = 1 Schritt, Station erreicht = kleines Ereignis | Position auf der Karte |
| 6 | Zeit-Challenge | 60 s Countdown-Balken, Zähler richtig, Rekord pro Profil | Rekord |
| 7 | Mini-Etappen | Fortschrittsbalken mit 3 Etappen, Pause-Screen mit Übung (z. B. „5× hüpfen“, „tief einatmen“) | – |
| 8 | Ohne Gamification | Nur Aufgabe + „Richtig“ / „Leider falsch, richtig ist X“ + „Fertig“-Screen | – |

## Datenmodell

**`src/data/tasks.json`** (Array):
```json
{ "id": "m-001", "level": 1, "topic": "einmaleins", "type": "input", "question": "7 × 8", "answer": 56 }
{ "id": "t-004", "level": 2, "topic": "text", "type": "choice", "question": "Lea hat 3 Tüten mit je 6 Äpfeln. Wie viele Äpfel?", "answer": 18, "choices": [9, 18, 24] }
```
Ca. 80 Aufgaben pro Stufe (Mix aus Einmaleins, Plus, Minus, Text) → reicht für 8 Konzepte à 10 Aufgaben ohne Wiederholung. Ziehung zufällig aus den Aufgaben, die das Profil noch nicht hatte (`usedTaskIds` pro Stufe).

**Local Storage** (Schlüssel `adhs-mathe:v1`):
```ts
{ settings: { soundOn, roundLength, timeChallengeSeconds, pauseSeconds },
  activeProfileId,
  profiles: [{ id, kuerzel, level, createdAt,
    usedTaskIds: { "1": [...], "2": [...], "3": [...] },
    concepts: { points: {...}, pet: {...}, chest: {...}, map: {...}, time: {...} } }] }
```

## Struktur

```
src/
  main.tsx, App.tsx            # Router (HashRouter)
  data/tasks.json
  core/
    tasks.ts                   # laden, filtern nach Level, zufällig ziehen
    useTaskRound.ts            # gemeinsamer Runden-Ablauf (aktuelle Aufgabe, prüfen, 2. Versuch, Ende)
    storage.ts                 # Local Storage lesen/schreiben, Profile
    sound.ts                   # Web-Audio-Töne (richtig/falsch/Belohnung), respektiert soundOn
  components/
    TaskCard.tsx               # Aufgabe + NumberPad oder ChoiceButtons
    NumberPad.tsx, ChoiceButtons.tsx
    HoldToExitButton.tsx
  admin/                       # Testleitung
    ProfilesScreen.tsx, ConceptMenu.tsx, SettingsScreen.tsx, InstallHint.tsx
  concepts/
    registry.ts                # Liste {id, name, beschreibung, Component}
    points/, pet/, chest/, feedback/, map/, timeChallenge/, stages/, plain/
```
Jedes Konzept = eine Komponente, die `useTaskRound` + `TaskCard` nutzt und nur Hülle/Belohnung ergänzt.

## Umsetzungsschritte

1. Design-Doku nach `docs/superpowers/specs/2026-11-07-adhs-mathe-lernapp-design.md` kopieren
2. Projekt aufsetzen: `npm create vite@latest` (react-ts), `vite-plugin-pwa`, `react-router-dom`, `canvas-confetti`, Vitest; Manifest + Icons (einfach generiert)
3. Kern (TDD): `tasks.ts`, `storage.ts`, `useTaskRound.ts` mit Vitest-Tests
4. Basis-UI: `TaskCard`, `NumberPad`, `ChoiceButtons`, `HoldToExitButton`, `sound.ts`
5. Testleitung: Profile, Konzept-Menü, Einstellungen, Install-Hinweis
6. Konzept 8 „Ohne“ zuerst (Referenz), dann 4, 1, 3, 2, 5, 6, 7
7. `tasks.json` mit ~240 Aufgaben (3 Stufen à ~80) → User prüft
8. GitHub Pages: Vite `base: '/adhs-mathe-lernapp/'`, Manifest `start_url`/`scope` passend, GitHub-Actions-Workflow `.github/workflows/deploy.yml` (Build + Pages-Deploy bei Push auf `main`). **Vor dem ersten Push frage ich nach** (Commit/Push nur mit Freigabe, Repo-Sichtbarkeit klären – Pages bei privatem Repo braucht GitHub Pro)
9. Test auf echtem iPhone (Safari) und Android (Chrome)

## Verifikation

- `npx vitest run` – Kern-Logik (keine Wiederholung pro Profil über mehrere Runden, Reset wenn Stufe aufgebraucht, 2. Versuch, Profil-Persistenz getrennt pro Kind, Truhen-Zufall)
- `npm run dev` (vom User gestartet) + Playwright-MCP im Handy-Viewport: jedes Konzept einmal durchspielen, Hold-to-Exit testen, Profilwechsel → Fortschritt getrennt
- Lighthouse/DevTools: Manifest + Service Worker aktiv, Offline-Reload funktioniert
- Auf echtem iPhone (Safari) und Android (Chrome): installieren, offline starten
