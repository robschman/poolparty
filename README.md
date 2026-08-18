# VIP-Schnitzeljagd

Browser-App für eine private Geburtstags-Schnitzeljagd.
Läuft unter **poolparty.robschman.at** über GitHub Pages.

Kein Baukasten, kein npm, keine Datenbank — reines HTML, CSS und JavaScript.

## Was wo liegt

| Datei | wofür |
|---|---|
| `js/stationen.js` | **alle Inhalte** — Stationen, Fragen, Antworten, Teams. Nur diese Datei wird angepasst. |
| `js/app.js` | die Spiel-Logik. Muss nicht angefasst werden. |
| `css/vip.css` | das Aussehen (Schwarz-Gold, umschaltbar auf Silber) |
| `fotos/` | Bilder für die Stationen und das App-Symbol |
| `fonts/` | Schriften, lokal eingebunden |
| `.nojekyll` | leer, aber nötig: sorgt dafür, dass GitHub die Dateien unverändert ausliefert |
| `CNAME` | die Adresse, unter der die Seite läuft |

## Nach jeder Änderung

In `js/stationen.js` ganz oben `version:` um eins hochzählen — sonst zeigen
Handys, die schon einmal da waren, noch die alte Fassung.

## Hinweise

Die Seite ist auf `noindex` gestellt und hat eine `robots.txt`, taucht also in
keiner Suchmaschine auf. Sie ist rein privat und kein Angebot — daher kein
Impressum.

Keine Telefonnummern und keine Adressen in die Dateien eintragen: Das
Repository ist öffentlich.
