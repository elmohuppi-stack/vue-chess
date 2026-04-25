# Vue Chess

Vue Chess ist als elegantes, gut strukturiertes Schachprojekt mit Vue 3, TypeScript und Tailwind CSS geplant. Ziel ist zunächst ein einfaches, aber vollständiges Schachprogramm, bei dem ein menschlicher Spieler gegen das Schachprogramm antritt. Die erste Version soll klar verständlich, visuell hochwertig und technisch so aufgebaut sein, dass spätere Ausbaustufen ohne große Umbauten möglich sind.

## Ziel des Projekts

Die erste Ausbaustufe liefert ein spielbares Human-vs-Computer-Schachspiel mit vollständigen Regeln des klassischen Schachs:

- normale Züge aller Figuren
- Schach, Schachmatt und Patt
- Rochade
- En-passant
- Bauernumwandlung
- Zughistorie
- Neustart der Partie
- Anzeige des Spielstatus

Die grafische Darstellung soll elegant und modern sein, mit einer bewusst ruhigen Tailwind-Gestaltung statt rein technischer Standardoptik.

## Architekturprinzip

Das Projekt wird in klar getrennte Schichten aufgeteilt, damit Logik, Darstellung und Computergegner unabhängig voneinander weiterentwickelt werden können.

### 1. UI-Schicht

Die Vue-Komponenten kümmern sich ausschließlich um Darstellung und Interaktion.

Geplante Bausteine:

- ChessBoard
- ChessSquare
- ChessPiece
- MoveList
- GamePanel
- ControlBar

Diese Komponenten zeigen den Zustand an, markieren Felder, nehmen Eingaben entgegen und leiten Aktionen weiter. Sie enthalten keine eigentliche Schachlogik.

### 2. Orchestrierung

Ein zentraler Store oder Game-Service verwaltet den Ablauf einer Partie:

- aktueller Brettzustand
- aktiver Spieler
- ausgewählte Figur oder ausgewähltes Feld
- Zughistorie
- Partie-Status
- Übergang vom Spielerzug zum Computerzug

Diese Schicht verbindet UI, Regellogik und Engine.

### 3. Domänenlogik

Die Schachregeln werden in framework-unabhängigen TypeScript-Modulen gekapselt. Diese Schicht soll rein funktional und testbar bleiben.

Beispielhafte Zuständigkeiten:

- Brett initialisieren
- legale Züge erzeugen
- Züge anwenden
- Schach prüfen
- Matt und Patt erkennen
- Sonderregeln auswerten

### 4. Engine

Der Computergegner ist als eigene Schicht geplant. Für das MVP reicht eine einfache Engine mit:

- Minimax
- Alpha-Beta-Pruning
- niedriger Suchtiefe
- Bewertungsfunktion auf Basis von Material und kleinen Positionsboni

Später kann diese Schicht separat verbessert werden, ohne die UI oder Regellogik neu zu strukturieren.

## Geplante Projektstruktur

- src/main.ts
- src/App.vue
- src/stores/gameStore.ts
- src/domain/types.ts
- src/domain/board.ts
- src/domain/moveGenerator.ts
- src/domain/rules.ts
- src/engine/evaluate.ts
- src/engine/search.ts
- src/components/chess/ChessBoard.vue
- src/components/chess/ChessSquare.vue
- src/components/chess/ChessPiece.vue
- src/components/chess/MoveList.vue
- src/components/chess/GamePanel.vue
- src/components/chess/ControlBar.vue
- src/assets/styles/tailwind.css
- tests/domain/
- tests/ui/

## Roadmap

### Phase 1: MVP

- Vue- und Tailwind-Grundgerüst aufsetzen
- Domänentypen definieren
- Regellogik für alle Figuren und Sonderregeln implementieren
- Game-Store für den Spielfluss erstellen
- einfache Engine integrieren
- elegante Brett-UI mit Statusanzeige und Zughistorie aufbauen
- komplette Partie Mensch gegen Computer spielbar machen

### Phase 2: UX und Performance

- Drag-and-drop ergänzen
- Animationen verbessern
- optionale Soundeffekte hinzufügen
- Schwierigkeit einstellbar machen
- FEN und PGN vorbereiten
- Engine bei Bedarf in Web Worker auslagern

### Phase 3: Erweiterungen

- Undo/Redo
- Brett drehen
- Spiel speichern und laden
- Zeitmodus
- Analysemodus
- einfache Eröffnungsbibliothek

### Phase 4: Qualität und Stabilität

- Unit-Tests für Regeln und Sonderfälle
- Integrations-Tests für den Store
- UI-Smoketests für Kerninteraktionen
- Performance-Messung der Engine

### Phase 5: Deployment und Betrieb

- Dockerfile fuer die Vue-App erstellen
- Compose-Setup fuer Hetzner vorbereiten
- Produktionskonfiguration ueber Environment-Variablen definieren
- Reverse-Proxy-Anbindung an den Host-Nginx dokumentieren
- Verifikationsschritte fuer Build, Container-Start und HTTPS-Zugriff festlegen

## Technische Leitlinien

- Die Regellogik bleibt vollständig unabhängig von Vue.
- Interne Koordinaten werden als Board-Indizes oder row/col geführt, Notationen erst bei der Ausgabe erzeugt.
- Für das MVP ist Click-to-move einfacher und robuster als sofortiges Drag-and-drop.
- Die Engine startet zunächst synchron und wird erst bei realem Bedarf asynchronisiert.
- Fokus zuerst auf saubere Architektur und vollständige Regeln, nicht auf maximale Spielstärke.

## Deployment-Zielbild

Die App soll spaeter auf einem Hetzner-Server in einer Docker-basierten Multi-App-Umgebung deploybar sein. Daraus folgen schon fuer die erste Version ein paar feste Leitplanken:

- Das Frontend soll als eigenstaendiger Container buildbar sein.
- Die App soll keine oeffentlichen Ports 80 oder 443 selbst belegen, sondern hinter einem zentralen Host-Nginx laufen.
- Domain, API-Basis-URL und spaetere Feature-Flags sollen ueber Environment-Konfiguration gesetzt werden koennen.
- Solange kein eigener Server noetig ist, soll das Projekt als statische Single-Page-App deploybar bleiben.
- Falls spaeter serverseitige Funktionen noetig werden, sollen sie als separater API-Container mit eigener Subdomain erweiterbar sein.

Empfohlene Produktionsform:

- `web`-Container fuer die Vue-App
- optional spaeter `api`-Container fuer serverseitige Funktionen
- TLS und Routing zentral ueber Host-Nginx und Certbot
- Deployment per `docker compose up -d --build`

## Infrastruktur-Vorbereitung im Projekt

Damit das spaetere Hetzner-Deployment ohne groesseren Umbau moeglich bleibt, sollte das Projekt frueh diese Bausteine einplanen:

- `Dockerfile` fuer den Frontend-Build und die Auslieferung
- `compose.yaml` oder `docker-compose.yml` fuer den Container-Start
- `.dockerignore` fuer schlanke Images
- `.env.example` fuer dokumentierte Produktionswerte
- optional eine Webserver-Konfiguration im Container, falls statische Assets ueber Nginx ausgeliefert werden
- eine einfache Verifikationsstrategie fuer Healthcheck oder Startseiten-Test

## Designrichtung

Die Oberfläche soll nicht wie ein Standard-Admin-UI wirken, sondern wie ein bewusst gestaltetes Spielinterface:

- warme, ruhige Farbpalette
- klare Typografie
- dezente Schatten und Hervorhebungen
- sichtbare Anzeige des letzten Zugs
- deutliche, aber elegante Markierung legaler Felder
- responsive Darstellung für Desktop und Tablet

## Abgrenzung des MVP

Im ersten Schritt nicht enthalten:

- Online-Multiplayer
- Cloud-Synchronisierung
- starke externe Engine auf Stockfish-Niveau
- komplexer Analysebereich

Spaeter moeglich, aber nicht Teil des MVP:

- separater API-Container fuer Persistenz oder Benutzerkonten
- serverseitige Spielspeicherung
- Multi-App-Deployment unter eigener Subdomain auf Hetzner

## Nächster Schritt

Auf Basis dieses Plans kann anschließend das eigentliche Projektgerüst erzeugt und das MVP iterativ implementiert werden.
