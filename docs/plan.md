## Plan: Vue Chess MVP (überarbeitet)

Ein leeres Greenfield-Projekt wird als klar getrennte Vue-Architektur aufgebaut: UI, Spiellogik, Orchestrierung und Computergegner bleiben bewusst voneinander getrennt. So entsteht zuerst ein vollständiges, einfaches Human-vs-Computer-Schachspiel mit eleganter Vue- und Tailwind-Oberfläche, das später ohne Umbauten um stärkere Engine, bessere Animationen, Analysefunktionen und Performance-Optimierungen erweitert werden kann.

Zusätzlich wird die Architektur von Anfang an so angelegt, dass die App später sauber auf einem Hetzner-Server in einer Docker-basierten Multi-App-Umgebung deployt werden kann.

---

## Umsetzungsstatus

### ✅ Phase 1a – Core (Domain + Engine) – **abgeschlossen**

| Schritt | Status | Details |
|---------|--------|---------|
| **1. Projektgrundlage** | ✅ | Vite + Vue 3 + TypeScript + Tailwind + Pinia |
| **2. Domänenmodell** | ✅ | `src/domain/types.ts` – Piece, Color, Square, Move, BoardState, PositionState, GameMetaState, GameStatus, MoveResult, HistoricalMove, GameContext |
| **3. Spiellogik** | ✅ | `board.ts`, `gameState.ts`, `moveGenerator.ts`, `moveExecutor.ts`, `rules.ts` + `fen.ts` (FEN-Parsing/Serialisierung) + `notation.ts` (SAN-Notation) |
| **4. Perft-Tests** | ✅ | `tests/domain/perft.test.ts` – 9 Tests (1 skipped), alle grün |
| **5. Engine** | ✅ | `src/engine/evaluate.ts` – Minimax mit Alpha-Beta-Pruning, Piece-Square-Tables + Materialwerte |
| **6. Engine-Smoke-Tests** | ✅ | `tests/engine/evaluate.test.ts` – 7 Tests, alle grün |

### ✅ Phase 1b – UI (Vue + Integration) – **abgeschlossen**

| Schritt | Status | Details |
|---------|--------|---------|
| **7. Game-Orchestrierung** | ✅ | `src/stores/gameStore.ts` – Pinia Store, reine Orchestrierung ohne Regellogik |
| **8. Vue-Komponenten** | ✅ | `ChessBoard.vue`, `ChessPiece.vue`, `ChessSquare.vue`, `MoveList.vue`, `GamePanel.vue`, `ControlBar.vue` |
| **9. Tailwind-Oberfläche** | ✅ | Warme Farbpalette, Board-Farben, Check-Indikator, Computer-Thinking-Anzeige, Mobile-first Layout |
| **10. MVP vollständig** | ✅ | Neuer Zug, Reset, Seitenwahl, Statusanzeige, Zughistorie, Schwierigkeitsgrad |

### 🔧 Gefixte Bugs während der Umsetzung

1. `tailwind.css`: `user-select-none` entfernt (keine gültige Tailwind-Klasse)
2. `evaluate.ts`: Falsche Imports (`./types` → `../domain/types` etc.)
3. `gameStore.ts`: `createInitialPosition` aus falschem Modul importiert (war `types`, muss `gameState`)
4. `ChessPiece.vue`: `defineProps` ohne Variablenzuweisung (`const props = defineProps<...>()`)
5. `vite.config.ts`: `minify: "terser"` → `"esbuild"` (terser war nicht installiert)

### Build-Ergebnis

- Production Build: ✅ erfolgreich
- 84 KB JS (gzipped: 32 KB)
- 11 KB CSS (gzipped: 3 KB)
- `make test`: 15 Tests grün, 1 skipped

---

### Steps

**Phase 1a – Core (Domain + Engine)**

**1. Projektgrundlage festlegen**
Vite + Vue 3 + TypeScript + Tailwind + Pinia als Basis verwenden. Das initiale Layout bewusst klein halten: eine Spielseite, ein Board-Bereich, eine Seitenleiste für Status und Steuerung.

---

**2. Domänenmodell definieren**
Zentrale Typen für Piece, Color, Square, Move, BoardState, PositionState, GameMetaState, GameStatus und MoveResult festlegen.

Ergänzungen:

* BoardState und GameMetaState strikt trennen (Figuren vs. Metadaten wie Rochade, En-passant, Halbzugzähler, Zugnummer, aktiver Spieler).
* PositionState = Kombination aus BoardState + GameMetaState.
* Move-Struktur so definieren, dass sie vollständig ist (inkl. Promotion-Typ, Capture, Castling, En-passant-Flag).
* `hash?: number` als optionales Feld in PositionState vorsehen (Platzhalter für Phase 2 – Zobrist Hashing wird erst später implementiert).
* Datenmodell vollständig framework-unabhängig halten.

---

**3. Spiellogik in reine Funktionen kapseln**
Brett initialisieren, Züge generieren, Züge validieren, Schach/Schachmatt/Pat erkennen, Rochade, En-passant und Bauernumwandlung korrekt behandeln.

Ergänzungen:

* Klar zwischen *pseudo-legale Züge* und *legale Züge* unterscheiden (Filter: „führt zu eigenem Schach“).
* Alle Funktionen strikt **immutable** implementieren (kein Mutieren des States).
* `applyMove` gibt immer einen neuen PositionState zurück.
* `moveExecutor.ts` bleibt strikt getrennt von der Zuggenerierung.
* FEN-Serialisierung + Parsing als Utility.
* Move-History als Liste von gespielten Zügen modellieren (für PGN, Anzeige).
* Undo/Redo arbeitet auf einem separaten Stack von PositionStates – nicht in der History-Struktur.

---

**4. Perft-Tests schreiben**
Perft (Performance Test) ist der Standard im Schachbereich, um die Korrektheit der Move-Generierung zu prüfen.

Ergänzungen:

* Perft(1) = 20, Perft(2) = 400, Perft(3) = 8902 als schnelle Smoke-Tests (immer ausführbar).
* Perft(4) = 197.281 als optionaler Langläufer-Test (mit `it.skip` oder `--tag slow` markieren).
* Perft(5+) erst nach Optimierung der Move-Generierung.
* Sicherstellen, dass keine illegalen Züge erzeugt werden.

---

**5. Einfache Engine implementieren**
Minimax mit Alpha-Beta-Pruning, Suchtiefe 3–4 Halbzüge (initial 2–3 zum Entwickeln, 3–4 als MVP-Ziel).

Ergänzungen:

* Bewertungsfunktion: **Piece-Square-Tables + Materialwerte** (keine separate Königssicherheitsheuristik nötig – PST deckt Zentrumsbonus, Randabzug und Königsstellung implizit ab).
* Engine arbeitet auf PositionState (nicht nur BoardState).
* Iterative Deepening von Anfang an vorsehen (auch wenn initial kaum genutzt).
* Klare Trennung:
  * Domain = Regeln
  * Engine = Bewertung + Suche
* Engine strikt Worker-kompatibel designen (Kommunikation nur über serialisierbare Daten).

---

**6. Engine-Smoke-Tests schreiben**

Ergänzungen:

* Bewertungsfunktion an einfachen bekannten Stellungen prüfen (z. B. Materialvorteil = höherer Wert).
* Engine liefert immer einen legalen Zug zurück (auf mehreren bekannten Positionen testen).

---

**Phase 1b – UI (Vue + Integration)**

**7. Game-Orchestrierung aufbauen**
Ein Pinia-Store hält den reaktiven Spielzustand.

Ergänzungen:

* Store enthält **keine Regellogik**, nur Orchestrierung.
* Engine-Aufruf strikt über reine Daten (keine Funktionsreferenzen → Worker-kompatibel).
* Selektion (UI-State) klar trennen: entweder vollständig im Store oder vollständig lokal im Board (keine Mischung).
* Übergang Menschzug → Enginezug deterministisch und testbar gestalten.

---

**8. Vue-Komponenten schneiden**
Board, Square, Piece, MoveList, GamePanel und ControlBar.

Ergänzungen:

* Komponenten strikt „dumm“ halten (keine Regellogik).
* Highlight-Logik (legal moves, letzter Zug, Check) aus Domain-Daten ableiten.
* Keine Spielregeln im UI berechnen.

---

**9. Elegante Tailwind-Oberfläche gestalten**
Warme Farbpalette, klare Typografie, dezente Schatten, Fokuszustände etc.

Ergänzungen:

* Design-Tokens früh definieren (Farben, Radius, Spacing, Animationen).
* Mobile-first Layout berücksichtigen.
* Click-to-move statt Drag-and-drop im MVP (Komplexität reduzieren).

---

**10. MVP vollständig machen**
Neuer Zug, Reset, Seitenwahl, Statusanzeige, Zughistorie, Promotion.

Ergänzungen:

* Promotion als verpflichtenden Zustand modellieren: Der Zug ist erst abgeschlossen, wenn eine Figur gewählt wurde. Im UI erscheint ein Auswahldialog (Dame, Turm, Läufer, Springer). Die Engine wählt per Bewertungsfunktion (meist Dame).
* Sicherstellen, dass Move-History bereits PGN-kompatibel ist.

---

**Phase 2: UX und Architektur schärfen**

Ergänzungen:

* Engine in Web Worker auslagern:
  * Kommunikation nur über serialisierbare Daten (keine Klassen/Funktionen)
  * Performance messen: `performance.now()`-Vergleich vorher/nachher
* Suchtiefe moderat erhöhen (4–5 Halbzüge)
* Zobrist Hashing für schnelle Wiederholungserkennung implementieren
* Drag-and-drop ergänzen
* Animationen und Sound optional
* Remis-Erkennung:
  * 50-Züge-Regel
  * dreifache Stellungswiederholung (nutzt positionHash)
  * unzureichendes Material
* PGN-Export implementieren
* Schwierigkeit konfigurierbar machen

---

**Phase 3: Erweiterungen für stärkere Nutzbarkeit**
Eröffnungsbuch light, Undo/Redo, Laden/Speichern, Brett drehen, Zeitmodus, Analysemodus.

Ergänzungen:

* Undo/Redo basiert auf immutable States (Stack von PositionStates – kein Spezialfall notwendig).
* Zeitmodus vorbereiten:
  * Turn-Timestamps im Store einführen
* Analysemodus: Der initiale MVP verwendet eine lineare History. Für Varianten (Game Tree) kann später eine `parentId` pro Zug ergänzt werden.

---

**Phase 4: Qualitätsausbau**

Ergänzungen:

* Unit-Tests:
  * vollständige Regelabdeckung
  * Sonderzüge und Edge Cases
* Integrations-Tests:
  * Store-Flows
* UI-Smoketests
* Erst danach Engine erweitern

---

**Phase 5: Deployment-Vorbereitung**

Ergänzungen:

* Multi-Stage Docker Build:
  * Build mit Node
  * Runtime mit nginx:alpine (nur statische Assets)
* Keine Node-Runtime im Produktionscontainer
* Cache-Control Header für Assets konfigurieren
* Da Vite Environment-Variablen zur Build-Zeit einbettet, muss für Runtime-Konfiguration (z. B. API-URLs) entweder ein `config.json` im öffentlichen Verzeichnis liegen oder der Docker-Entrypoint die Config per `envsubst` injizieren. Siehe `docs/hetzner-multi-app-template.md` für das empfohlene Pattern.

---

### Relevant files (ergänzt)

* `src/domain/hash.ts` — optionale Zobrist-Hashing-Funktion (Implementierung in Phase 2)
* `src/engine/pieceSquareTables.ts` — Positionsbewertung
* `src/engine/search.ts` — Minimax + Iterative Deepening vorbereitet

---

### Verification (ergänzt)

* Perft(1)–Perft(3) als schnelle Smoke-Tests, Perft(4) als optionaler Langläufer
* Prüfen, dass keine illegalen Züge generiert werden
* Hash-basierte Wiederholungserkennung validieren (Phase 2)
* Worker-Performance messen (UI-Blockierung vermeiden)

---

### Decisions (ergänzt)

* Empfehlung: Pseudo-legale Züge + Filter statt direkter legaler Generierung
* Empfehlung: Immutable State als Standard
* Empfehlung: Engine strikt Worker-kompatibel designen
* Empfehlung: Piece-Square-Tables + Material für MVP-Bewertung (keine separate Königssicherheit)
* Empfehlung: Move-History (für PGN/Anzeige) und Undo/Redo-Stack (für Zurücksetzen) als getrennte Strukturen

---

### Further Considerations (ergänzt)

* Bitboards als mögliche spätere Optimierung (nicht MVP)
* Architektur früh „analysefähig“ denken: initial lineare History, später `parentId` für Varianten (Game Tree)
* Klare Trennung Domain vs. Engine vs. UI strikt einhalten
* Perft(5+) erst nach Optimierung der Move-Generierung aktivieren

---

Unterm Strich: Dein ursprünglicher Plan war schon tragfähig. Diese Version reduziert vor allem das Risiko, dass du bei Regeln, Engine oder Undo/Analyse später grundlegend umbauen musst.
