/* ==========================================================================
   VIP-SCHNITZELJAGD — DIE EINZIGE DATEI, DIE DU ANPASSEN MUSST
   ==========================================================================

   Hier drin steht ALLES: Titel, Teams, jede Station, jede Frage, jede Antwort.
   Du musst nichts programmieren können — du änderst nur den Text zwischen
   den " Anführungszeichen ".

   DREI REGELN
   1. Text steht immer zwischen "Anführungszeichen"
   2. Am Ende jeder Zeile steht ein Komma  ,   (nur bei der letzten nicht)
   3. Anführungszeichen und geschweifte Klammern { } nicht löschen

   Wenn etwas kaputt geht: Sicherungskopie zurückkopieren (siehe ANLEITUNG).

   Alles, wo HIER ... EINTRAGEN steht, musst du noch ausfüllen.

   DIE ORTE FÜR TERNITZ
   Geh einmal die Runde mit dem Erkundungs-Blatt
   (Werkzeuge/Erkundungs-Blatt.html) — dort steht Schritt für Schritt, was du
   suchen und notieren musst. Danach trägst du es hier ein, oder du schickst
   mir die Antworten und ich mache es.
   ========================================================================== */


/* ==========================================================================
   TEIL 1 — GRUNDEINSTELLUNGEN
   ========================================================================== */

const SPIEL = {

  titel:       "VIP CLUB",
  untertitel:  "Zoes Poolparty",
  datum:       "Freitag, 28. August 2026",

  // Farbe: "gold" oder "silber" — einfach das Wort austauschen
  farbe: "gold",

  // Nur für den Text auf dem Startbildschirm. Läuft nicht ab, niemand
  // wird rausgeworfen.
  dauerMinuten: 90,

  // DIE TEAMS — eingestellt auf ZWEI Teams (passt für 5 bis 7 Kinder).
  //
  // Kommen mehr Kinder: bei den unteren zwei Zeilen die zwei Schrägstriche //
  // am Zeilenanfang wegnehmen — dann sind es drei bzw. vier Teams.
  // Wichtig: Beim vorletzten Eintrag muss ein Komma am Ende stehen,
  // beim letzten keines.
  //
  // Jedes Team braucht ein EIGENES Geheimwort. Das wird beim Emoji-Duell
  // gebraucht, wo die Teams sich gegenseitig etwas verraten müssen.
  teams: [
    { name: "Team Diamant", geheimwort: "KAVIAR"     },
    { name: "Team Platin",  geheimwort: "LIMOUSINE"  }
 // ,{ name: "Team Onyx",    geheimwort: "SMOKING"    }
 // ,{ name: "Team Gold",    geheimwort: "CHAMPAGNER" }
  ],

  // Was am Ende auf dem Schlussbildschirm steht
  finaleText: "Sagt das Losungswort dem Türsteher am Pool — dann bekommt ihr euren VIP-Ausweis und die Lounge ist offen.",

  // PUNKTE
  punkteProStation: 100,   // volle Punkte, wenn gleich richtig geantwortet
  abzugTipp:         30,   // Abzug, wenn ein Tipp geholt wird
  abzugFehler:       10,   // Abzug pro falscher Antwort
                           // (weniger als 20 Punkte gibt es nie)

  // Notfall-Code für dich als Spielleiter.
  // Im Spiel oben links die Krone 3x antippen, dann diesen Code eingeben:
  // damit kannst du eine Station überspringen, wenn ein Team feststeckt.
  leiterCode: "9999",

  // Nur zur Kontrolle für dich — das Losungswort entsteht automatisch aus
  // den Buchstaben der Stationen. Wenn du Stationen umstellst, ändert es sich mit.
  loesungswortKontrolle: "VIPPARTY",

  // Bei jeder Änderung um 1 hochzählen. Dann laden alle Handys die neue
  // Fassung — und ein bereits begonnenes Spiel fängt sauber von vorne an.
  version: "1"
};


/* ==========================================================================
   TEIL 2 — DIE STATIONEN
   ==========================================================================

   Sieben Arten von Stationen ("typ"):

     "start"     Begrüßung, Teamfoto — nur bestätigen
     "code"      Eine Antwort eintippen (Zahl oder Wort)
     "quiz"      Mehrere Fragen zum Antippen
     "foto"      Foto-Aufträge zum Abhaken
     "duell"     Aufgabe MIT einem anderen Team
     "handyaus"  Die Aktion "alle Handys ausschalten"  ← der Gag
     "finale"    Schlussbildschirm

   Bei jeder Station möglich:
     ort:        wo es hingeht (steht oben im Kasten)
     weg:        Wegbeschreibung
     foto:       Bild dazu — Datei in den Ordner "fotos" legen, hier dann
                 foto: "fotos/dateiname.jpg"   ·   kein Bild? Zeile weglassen
     video:      YouTube-Link (wird direkt eingebettet) oder TikTok-Link (Knopf)
     tipp:       Hilfe gegen Punktabzug
     buchstabe:  der Buchstabe fürs Losungswort
     antwortAuch: weitere Schreibweisen, die auch gelten sollen

   Groß-/Kleinschreibung, Leerzeichen und Umlaute sind bei den Antworten egal.
   "GRÜNER BAUM", "gruener baum" und "GrünerBaum" gelten alle als richtig.
   ========================================================================== */

const STATIONEN = [

/* ------------------------------------------------------------------ 0 */
{
  typ: "start",
  titel: "Akkreditierung",
  ort: "Bei Zoe am Pool",
  text: "Willkommen im VIP CLUB.\n\nAb jetzt seid ihr keine normalen Gäste mehr — ihr seid Anwärter. Wer in die Lounge will, muss sich den Zutritt verdienen.\n\nAcht Stationen liegen vor euch. Bei jeder bekommt ihr einen Buchstaben. Alle acht zusammen ergeben das Losungswort für den Türsteher.\n\nEure erste Aufgabe:",
  auftraege: [
    "Stellt euch in eure beste VIP-Pose und macht ein Teamfoto",
    "Einigt euch, wer das Handy trägt",
    "Ruft euren Teamnamen so laut, dass man es bis zum Pool hört"
  ],
  // DIE REGELN — erscheinen auf der Startseite in einem eigenen Kasten.
  //
  // ⚠️ KEINE TELEFONNUMMER HIER EINTRAGEN.
  // Diese Datei liegt auf einer öffentlichen Seite (und im öffentlichen
  // GitHub-Repo) — Telefonnummern werden dort automatisch abgegriffen.
  // Schreib die Nummer stattdessen auf den ausgedruckten QR-Zettel,
  // den die Kinder ohnehin mitbekommen.
  regeln: [
    "Bleibt im Umkreis von 500 Metern rund um die Grabengasse",
    "HIER GRENZE EINTRAGEN — z. B. „Die Hauptstraße wird nicht überquert“",
    "Ihr bleibt immer als Team zusammen — niemand geht allein",
    "Wenn etwas ist: sofort anrufen — die Nummer steht auf eurem Zettel"
  ],
  weg: "Wenn das erledigt ist: auf LOS GEHT'S tippen."
},

/* ------------------------------------------------------------------ 1 */
{
  typ: "code",
  titel: "Der Türsteher",
  ort: "Grabengasse",                       // ← Station 1 vom Erkundungs-Blatt
  weg: "HIER WEG BESCHREIBEN — z. B. „Geht die Grabengasse hinunter bis zur Kreuzung.“",
  buchstabe: "V",
  text: "Der Türsteher lässt nur rein, wer den Zahlencode kennt. Und der steht an den Häusern.\n\nRECHNET ZUSAMMEN:\ndie Hausnummer von HAUS A EINTRAGEN\n+ die Hausnummer von HAUS B EINTRAGEN\n\nWie lautet die Summe?",
  antwort: "HIER SUMME EINTRAGEN",
  tipp: "HIER TIPP EINTRAGEN — z. B. „Eine der beiden ist zweistellig.“",
  eingabeArt: "zahl"
},

/* ------------------------------------------------------------------ 2 */
{
  typ: "code",
  titel: "Die geheime Botschaft",
  ort: "Unterwegs",
  weg: "Diese Station könnt ihr überall lösen.",
  buchstabe: "I",
  text: "Der VIP-Club hat eine Videobotschaft für euch hinterlassen. Schaut sie GENAU an — irgendwo darin fällt ein Codewort.\n\nWie lautet es?",
  // Zwei Möglichkeiten — nimm eine davon:
  //   a) eigene Datei auf dem Server:  video: "fotos/botschaft.mp4",
  //   b) YouTube (nicht gelistet):     video: "https://youtu.be/XXXXXXXXXXX",
  video: "HIER VIDEO-LINK EINTRAGEN",
  antwort: "GOLDFISCH",
  antwortAuch: ["GOLD FISCH"],
  tipp: "Er sagt es nicht nur — er hält es auch schriftlich in die Kamera. Nochmal anschauen."
},

/* ------------------------------------------------------------------ 3 */
{
  typ: "code",
  titel: "Das Suchbild",
  ort: "In Gehweite",                       // ← Station 2 vom Erkundungs-Blatt
  weg: "Sucht diesen Ort. Er ist keine fünf Minuten entfernt.",
  buchstabe: "P",
  text: "Auf dem Bild seht ihr nur einen Ausschnitt. Findet die Stelle in echt.\n\nWas steht dort drauf?",
  foto: "fotos/station3.jpg",              // ← dein eigenes Foto hier eintragen
  antwort: "HIER ANTWORT EINTRAGEN",
  tipp: "HIER TIPP EINTRAGEN — z. B. „Schaut nach oben, nicht nach unten.“"
},

/* ------------------------------------------------------------------ 4 */
/*  ★ DAS IST DER GAG: Die Kids schalten wirklich ihre Handys aus.
    Schalten sie sie wieder ein und öffnen die Seite, kommt der Dank.
    Machen sie es nicht, läuft der Countdown ab und es geht auch weiter.
    Beides funktioniert — es kann nichts schiefgehen.                    */
{
  typ: "handyaus",
  titel: "Sicherheitsstufe Rot",
  ort: "Bleibt stehen",
  buchstabe: "P",
  sekunden: 60,
  text: "ACHTUNG — SICHERHEITSWARNUNG DES VIP-SERVERS.\n\nEin fremdes Gerät versucht, sich in eure VIP-Verbindung einzuklinken.\n\nSCHALTET SOFORT ALLE HANDYS KOMPLETT AUS.\nNicht nur den Bildschirm — ganz aus.\n\nWartet 60 Sekunden. Dann wieder einschalten und diese Seite neu öffnen.",
  dankeText: "Danke, dass ihr eure Handys neu gestartet habt.\n\nDie Verbindung ist wieder sicher. Wir machen weiter.\n\n(Unter uns: Es hätte auch ohne funktioniert. Aber ihr wart wirklich überzeugend.)"
},

/* ------------------------------------------------------------------ 5 */
{
  typ: "duell",
  titel: "Das Emoji-Duell",
  ort: "Sucht ein anderes Team",
  weg: "Ohne ein anderes Team geht diese Station nicht. Findet es — oder ruft es an.",
  buchstabe: "A",
  text: "Jetzt wird es persönlich.\n\n1. Denkt euch einen Song oder einen Film aus.\n2. Beschreibt ihn mit GENAU 4 Emojis und schickt sie einem anderen Team.\n3. Das andere Team rät. Danach ratet ihr, was sie euch geschickt haben.\n4. Wer richtig rät, bekommt vom anderen Team dessen GEHEIMWORT.\n\nTragt das Geheimwort des anderen Teams unten ein.",
  tipp: "Euer eigenes Geheimwort steht ganz unten auf dieser Seite — aber nur herausrücken, wenn die anderen wirklich richtig geraten haben."
},

/* ------------------------------------------------------------------ 6 */
{
  typ: "quiz",
  titel: "Der VIP-Test",
  ort: "Unterwegs",
  weg: "Überall lösbar — am besten im Gehen.",
  buchstabe: "R",
  text: "Fünf Fragen. Für jede richtige gibt es Punkte.",
  fragen: [
    {
      frage: "Wie heißt der rote Teppich bei Filmpremieren auf Englisch?",
      optionen: ["Golden Carpet", "Red Carpet", "Star Walk"],
      richtig: 1
    },
    {
      frage: "Was ist ein Backstage-Pass?",
      optionen: ["Ein Ticket für die letzte Reihe", "Der Zugang hinter die Bühne", "Ein Autogramm"],
      richtig: 1
    },
    {
      frage: "In welcher Stadt findet die Oscar-Verleihung statt?",
      optionen: ["Los Angeles", "New York", "London"],
      richtig: 0
    },
    {
      frage: "Wie nennt man Fotografen, die Stars überallhin verfolgen?",
      optionen: ["Reporter", "Paparazzi", "Influencer"],
      richtig: 1
    },
    {
      frage: "Wofür steht VIP?",
      optionen: ["Very Important Person", "Very Interesting Party", "Victory In Progress"],
      richtig: 0
    }
  ]
},

/* ------------------------------------------------------------------ 7 */
{
  typ: "code",
  titel: "Die Zählaufgabe",
  ort: "HIER ORT EINTRAGEN",                // ← Station 3 vom Erkundungs-Blatt
  weg: "HIER WEG BESCHREIBEN.",
  buchstabe: "T",
  text: "Kein Rateglück, nur genaues Schauen.\n\nZÄHLT: HIER EINTRAGEN, WAS GEZÄHLT WERDEN SOLL\n(zum Beispiel: die Stufen der Treppe, die Fenster an der Vorderseite, die Latten im Zaun)\n\nWie viele sind es?",
  antwort: "HIER ZAHL EINTRAGEN",
  tipp: "Zählt zu zweit und vergleicht — einer verzählt sich immer.",
  eingabeArt: "zahl"
},

/* ------------------------------------------------------------------ 8 */
{
  typ: "foto",
  titel: "Die Paparazzi-Mission",
  ort: "Überall",
  weg: "Ihr habt zehn Minuten.",
  buchstabe: "Y",
  text: "Ihr seid jetzt die Fotografen. Mindestens VIER der sechs Aufträge müssen erledigt sein — wer alle sechs schafft, bekommt Bonuspunkte.\n\nGeschummelt wird nicht: Die Fotos werden am Pool angeschaut.",
  auftraege: [
    "Ein Foto, auf dem euer ganzes Team gleichzeitig in der Luft ist",
    "Ein Foto mit einem Tier (Schnecke zählt auch)",
    "Ein Foto, das aussieht wie ein Plattencover",
    "Ein Foto mit einer fremden erwachsenen Person, die mitmacht",
    "Ein Foto von etwas Goldenem",
    "Ein 5-Sekunden-Video, in dem alle gleichzeitig dieselbe Pose machen"
  ],
  mindestens: 4
},

/* ------------------------------------------------------------------ 9 */
{
  typ: "finale",
  titel: "Die VIP-Lounge",
  ort: "Zurück zu Zoe",
  weg: "Lauft zurück. Ihr habt es geschafft.",
  text: "Alle acht Buchstaben sind eingesammelt. Zusammengesetzt ergeben sie euer Losungswort."
}

];
