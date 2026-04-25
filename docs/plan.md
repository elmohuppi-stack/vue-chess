## Plan: Vue Chess MVP

Ein leeres Greenfield-Projekt wird als klar getrennte Vue-Architektur aufgebaut: UI, Spiellogik, Orchestrierung und Computergegner bleiben bewusst voneinander getrennt. So entsteht zuerst ein vollständiges, einfaches Human-vs-Computer-Schachspiel mit eleganter Vue- und Tailwind-Oberfläche, das später ohne Umbauten um stärkere Engine, bessere Animationen, Analysefunktionen und Performance-Optimierungen erweitert werden kann.

Zusaetzlich wird die Architektur von Anfang an so angelegt, dass die App spaeter sauber auf einem Hetzner-Server in einer Docker-basierten Multi-App-Umgebung deployt werden kann.

**Steps**

1. Phase 1: Projektgrundlage festlegen. Vite + Vue 3 + TypeScript + Tailwind + Pinia als Basis verwenden. Das initiale Layout bewusst klein halten: eine Spielseite, ein Board-Bereich, eine Seitenleiste für Status und Steuerung.
2. Phase 1: Domänenmodell definieren. Zentrale Typen für Piece, Color, Square, Move, BoardState, GameStatus und MoveResult festlegen. Das Datenmodell soll unabhängig von Vue bleiben, damit Regeln und Engine testbar bleiben.
3. Phase 1: Spiellogik in reine Funktionen kapseln. Brett initialisieren, Züge generieren, Züge validieren, Schach/Schachmatt/Pat erkennen, Rochade, En-passant und Bauernumwandlung korrekt behandeln. Diese Schicht darf keine UI-Abhängigkeiten haben.
4. Phase 1: Game-Orchestrierung aufbauen. Ein Store oder Game-Service hält den aktuellen Spielstand, die Zugliste, den aktiven Spieler, Selektion im UI und den Übergang Menschzug -> Enginezug. Diese Schicht verbindet UI und Domäne, enthält aber selbst keine eigentliche Regellogik.
5. Phase 1: Einfache Engine implementieren. Für das MVP reicht Minimax mit Alpha-Beta-Pruning, geringer Suchtiefe und einfacher Bewertungsfunktion auf Basis von Materialwerten plus wenigen Positionsboni. Die Engine erhält nur den BoardState und liefert einen Move zurück.
6. Phase 1: Vue-Komponenten schneiden. Board, Square, Piece, MoveList, GamePanel und ControlBar als klar lesbare Komponenten anlegen. Die Board-Komponente ist für Interaktion und Darstellung zuständig, nicht für die Spielregeln.
7. Phase 1: Elegante Tailwind-Oberfläche gestalten. Warme, ruhige Farbpalette, klare Typografie, dezente Schatten, Fokuszustände, Hervorhebung legaler Felder, letzter Zug, Schach-Hinweis und dezente Übergänge definieren. Mobile und Desktop von Anfang an mitdenken.
8. Phase 1: MVP vollständig machen. Neuer Zug, Reset, Seitenwahl Mensch gegen Engine, Anzeige von Spielstatus, Zughistorie und Bauernumwandlung sicherstellen. Danach ist das Spiel funktional vollständig.
9. Phase 2: UX und Architektur schärfen. Drag-and-drop ergänzen, Animationsschicht verbessern, Sound optional machen, FEN/PGN vorbereiten, Engine-Berechnung bei Bedarf in Web Worker verschieben und Konfigurationsoptionen für Schwierigkeit ergänzen.
10. Phase 3: Erweiterungen für stärkere Nutzbarkeit. Eröffnungsbuch light, Undo/Redo, Spiel laden/speichern, Brett drehen, Zeitmodus, Analysemodus und Hervorhebung schlechter Züge als optionale Features planen.
11. Phase 4: Qualitätsausbau. Unit-Tests für Regeln und Sonderzüge, Integrations-Tests für Store-Flows und UI-Smoketests für Kernaktionen ergänzen. Erst wenn die Regeln stabil sind, weitere Engine-Features hinzufügen.
12. Phase 5: Deployment-Vorbereitung. Dockerfile, Compose-Datei, Environment-Strategie und Verifikationsschritte für das spätere Hetzner-Deployment ergänzen. Die App soll hinter einem zentralen Host-Nginx laufen und keine eigenen öffentlichen Ports 80 oder 443 direkt belegen.

**Relevant files**

- /Users/elmarhepp/workspace/vue-chess/package.json — Projekt-Tooling, Scripts und Abhängigkeiten für Vue, Tailwind, Pinia, Tests.
- /Users/elmarhepp/workspace/vue-chess/src/main.ts — App-Bootstrap mit Tailwind und Store-Setup.
- /Users/elmarhepp/workspace/vue-chess/src/App.vue — Shell mit Seitenlayout und Game-Container.
- /Users/elmarhepp/workspace/vue-chess/src/stores/gameStore.ts — Orchestrierung von Spielzustand, Nutzerzug und Enginezug.
- /Users/elmarhepp/workspace/vue-chess/src/domain/types.ts — zentrale Typen für Brett, Figuren und Züge.
- /Users/elmarhepp/workspace/vue-chess/src/domain/board.ts — Brettinitialisierung und Zustandsübergänge.
- /Users/elmarhepp/workspace/vue-chess/src/domain/moveGenerator.ts — legale Zugerzeugung je Figur.
- /Users/elmarhepp/workspace/vue-chess/src/domain/rules.ts — Check, Mate, Pat, Sonderregeln und Statusermittlung.
- /Users/elmarhepp/workspace/vue-chess/src/engine/evaluate.ts — einfache Bewertungsfunktion.
- /Users/elmarhepp/workspace/vue-chess/src/engine/search.ts — Minimax/Alpha-Beta für den Computerzug.
- /Users/elmarhepp/workspace/vue-chess/src/components/chess/ChessBoard.vue — Brettdarstellung und Eingabe.
- /Users/elmarhepp/workspace/vue-chess/src/components/chess/ChessSquare.vue — einzelnes Feld mit Zuständen.
- /Users/elmarhepp/workspace/vue-chess/src/components/chess/ChessPiece.vue — Figurendarstellung.
- /Users/elmarhepp/workspace/vue-chess/src/components/chess/MoveList.vue — Zughistorie.
- /Users/elmarhepp/workspace/vue-chess/src/components/chess/GamePanel.vue — Status, Hinweise und Partieende.
- /Users/elmarhepp/workspace/vue-chess/src/components/chess/ControlBar.vue — Neustart, Seitenwahl, Schwierigkeit.
- /Users/elmarhepp/workspace/vue-chess/src/assets/styles/tailwind.css — Tokens und UI-Feinschliff.
- /Users/elmarhepp/workspace/vue-chess/tests/domain/\*.test.ts — Regeltests.
- /Users/elmarhepp/workspace/vue-chess/tests/ui/\*.test.ts — UI- und Flow-Tests.
- /Users/elmarhepp/workspace/vue-chess/Dockerfile — Produktions-Build und Containerisierung der Vue-App.
- /Users/elmarhepp/workspace/vue-chess/compose.yaml — Container-Start für lokale und servernahe Deploy-Tests ohne direkte 80/443-Bindings.
- /Users/elmarhepp/workspace/vue-chess/.dockerignore — kleinere, reproduzierbare Images.
- /Users/elmarhepp/workspace/vue-chess/.env.example — dokumentierte Produktionsvariablen für Domain, API-Basis-URL und optionale Features.

**Verification**

1. Nach Phase 1 prüfen, dass eine vollständige Partie Mensch gegen Computer inklusive Rochade, En-passant und Umwandlung spielbar ist.
2. Regeltests für jede Figur, Sonderzüge und Endzustände ausführen.
3. Manuell prüfen, dass UI-Highlights, Zughistorie, Reset und Seitenwechsel korrekt reagieren.
4. Bei Phase 2/3 Engine-Latenz beobachten und erst dann auf Web Worker umstellen, wenn die UI sichtbar blockiert.
5. Für das Deployment prüfen, dass der Frontend-Build reproduzierbar im Docker-Image läuft und der Container über einen internen Port erreichbar ist.
6. Für Hetzner dokumentieren, wie Host-Nginx und TLS vor den Container geschaltet werden und welche Umgebungsvariablen produktiv gesetzt werden müssen.

**Decisions**

- Enthalten: vollständiges klassisches Schach gegen Computer mit bewusst einfacher erster Engine.
- Nicht im MVP: Online-Multiplayer, Analyse-Cloud, starke Engine auf Stockfish-Niveau.
- Empfehlung: Koordinaten intern als 0-63 oder row/col speichern und Algebraic Notation erst auf einer Formatierungsschicht erzeugen.
- Empfehlung: Regel-Engine vollständig framework-unabhängig halten; Vue darf nur lesen, auslösen und visualisieren.
- Empfehlung: Engine zunächst synchron im Hauptthread; Web Worker erst als gezielte Phase-2-Optimierung.
- Empfehlung: Frontend so bauen, dass es als statische Single-Page-App in einem Docker-Container ausgeliefert werden kann.
- Empfehlung: Domains und Endpunkte ausschließlich über Environment-Konfiguration einspeisen, nicht hart im Frontend verankern.
- Empfehlung: Das erste Deployment-Ziel ist ein Frontend-Container hinter zentralem Hetzner-Nginx; ein mögliches späteres Backend bleibt davon getrennt.

**Further Considerations**

1. Für das MVP zuerst Click-to-move statt Drag-and-drop umsetzen; das reduziert Komplexität und hält die Regellogik im Fokus.
2. Falls schnelle Fertigstellung wichtiger ist als eigene Regel-Engine, wäre chess.js als Übergangslösung möglich; empfohlen ist hier trotzdem eine eigene kleine Domänenschicht, damit die Architektur klar erkennbar bleibt.
3. Für elegantes UI früh Design-Tokens für Farben, Radius, Schatten und Animationen definieren, damit spätere Erweiterungen konsistent bleiben.
4. Falls später Serverfunktionen dazukommen, sollten diese als separater API-Container mit eigener Subdomain geplant werden, passend zum vorhandenen Hetzner-Multi-App-Schema.
