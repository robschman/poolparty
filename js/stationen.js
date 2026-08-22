/* ==========================================================================
   VIP-SCHNITZELJAGD — DIE EINZIGE DATEI, DIE DU ANPASSEN MUSST
   ==========================================================================

   Hier drin steht ALLES: Titel, Teams, jede Station, jede Frage, jede Antwort.
   Du musst nichts programmieren können — du änderst nur den Text zwischen
   den " Anführungszeichen ".

   DREI REGELN
   1. Text steht immer zwischen "Anführungszeichen"
   2. Am Zeilenende steht ein Komma  ,   (nur bei der letzten nicht)
   3. Klammern { } [ ] und Anführungszeichen nicht löschen

   Alles, wo HIER ... EINTRAGEN steht, musst du noch ausfüllen.
   Such einfach nach dem Wort HIER, dann findest du alle Stellen.
   ========================================================================== */


/* ==========================================================================
   TEIL 1 — GRUNDEINSTELLUNGEN
   ========================================================================== */

const SPIEL = {

  titel:       "VIP CLUB",
  untertitel:  "Zoes Poolparty",
  datum:       "Freitag, 28. August 2026",

  farbe: "gold",            // "gold" oder "silber"

  /* ---- DER DAUER-SCHALTER -------------------------------------------------
     Hier stellst du am Partytag ein, wie lang die Jagd wird:

        "kurz"     rund 100 Minuten — wenn die Sonne scheint und der Pool ruft
        "lang"     rund 160 Minuten — alle Stationen, für einen Regennachmittag
        "drinnen"  rund 50 Minuten  — nur was ohne Weg geht

     Du kannst es auch OHNE Datei-Änderung umstellen: Es gibt drei QR-Codes,
     einen pro Einstellung. Der gescannte Code gewinnt immer.
     ----------------------------------------------------------------------- */
  modus: "lang",

  /* ---- DIE TEAMS ----------------------------------------------------------
     Eingestellt auf ZWEI Teams (passt für 5 bis 7 Kinder).
     Kommen mehr: bei den unteren Zeilen die zwei Schrägstriche wegnehmen.
     Wichtig: beim vorletzten Eintrag ein Komma, beim letzten keines.

     Die Reihenfolge zählt: Team 1 wird überall zuerst nach links geschickt,
     Team 2 zuerst nach rechts.
     ----------------------------------------------------------------------- */
  teams: [
    { name: "Team Diamant", geheimwort: "KAVIAR"     },
    { name: "Team Platin",  geheimwort: "LIMOUSINE"  }
 // ,{ name: "Team Onyx",    geheimwort: "SMOKING"    }
 // ,{ name: "Team Gold",    geheimwort: "CHAMPAGNER" }
  ],

  /* ---- DAS LOSUNGSWORT ----------------------------------------------------
     Die Buchstaben werden DURCHEINANDER auf die Stationen verteilt — die
     Kinder müssen am Schluss selbst die richtige Reihenfolge legen.

     "buchstabenReihenfolge" bestimmt, in welcher Reihenfolge sie vergeben
     werden. Die Zahlen sind die Stellen im Wort: 0 = erster Buchstabe.
     Nicht ändern, außer du willst eine andere Mischung.
     ----------------------------------------------------------------------- */
  loesungswort: "VIPPARTY",
  buchstabenReihenfolge: [3, 7, 1, 5, 0, 6, 2, 4],

  /* ---- DER ANRUF ---------------------------------------------------------- */
  telefonnummer:  "HIER DEINE NUMMER EINTRAGEN",
  kennwortTeil1:  "ROTER",        // findet Team 1
  kennwortTeil2:  "TEPPICH",      // findet Team 2
  anrufCode:      "SMOKING",      // den sagst du am Telefon, wenn das Kennwort stimmt

  /* ---- PUNKTE ------------------------------------------------------------- */
  punkteProStation: 100,
  abzugTipp:         30,
  abzugFehler:       10,

  /* ---- SPIELLEITER --------------------------------------------------------
     Im Spiel oben links die Krone 3x antippen, dann diesen Code eingeben.
     ----------------------------------------------------------------------- */
  leiterCode: "9999",

  /* ---- VERSION ------------------------------------------------------------
     Bei jeder Änderung um 1 hochzählen, sonst zeigen Handys die alte Fassung.
     ----------------------------------------------------------------------- */
  version: "3"
};


/* ==========================================================================
   TEIL 2 — DIE STATIONEN
   ==========================================================================

   ARTEN VON STATIONEN ("typ"):
     "start"      Begrüßung und Regeln
     "code"       Antwort eintippen
     "quiz"       Fragen zum Antippen
     "foto"       Aufträge zum Abhaken
     "duell"      Aufgabe mit dem anderen Team
     "handyaus"   die Handy-abschalten-Aktion
     "spiegel"    Spiegelschrift — nur mit der Selfie-Kamera lesbar
     "stoppuhr"   30 Sekunden blind schätzen
     "sprint"     Countdown, in der Zeit ans Ziel
     "kennwort"   Kennwort-Hälfte am Versteck holen
     "anruf"      anrufen und den Code erfragen
     "finale"     Wort legen und zum Türsteher

   BEI JEDER STATION MÖGLICH:
     modi:       in welchen Einstellungen die Station läuft.
                 Fehlt die Zeile, läuft sie überall.
                 Beispiel:  modi: ["lang"],
     buchstabe:  true  = diese Station gibt einen Buchstaben fürs Losungswort
     ort, weg:   wohin es geht
     teamText:   zwei verschiedene Texte — einer je Team.
                 Damit gehen die Teams in verschiedene Richtungen los.
     foto:       "fotos/dateiname.jpg"
     video:      "fotos/botschaft.mp4" oder ein YouTube-Link
     tipp:       Hilfe gegen Punktabzug
   ========================================================================== */

const STATIONEN = [

/* ------------------------------------------------------------ START ---- */
{
  typ: "start",
  titel: "Akkreditierung",
  ort: "Bei Zoe am Pool",
  text: "Willkommen im VIP CLUB.\n\nAb jetzt seid ihr keine normalen Gäste mehr — ihr seid Anwärter. Wer in die Lounge will, muss sich den Zutritt verdienen.\n\nUnterwegs sammelt ihr Buchstaben. Sie kommen durcheinander — am Ende müsst ihr selbst die richtige Reihenfolge finden. Und dann steht da noch jemand am Tor.\n\nEure erste Aufgabe:",
  auftraege: [
    "Stellt euch in eure beste VIP-Pose und macht ein Teamfoto",
    "Einigt euch, wer das Handy trägt",
    "Ruft euren Teamnamen so laut, dass man es bis zum Pool hört"
  ],
  regeln: [
    "Bleibt im Umkreis von 500 Metern rund um die Grabengasse",
    "Ihr bleibt immer als Team zusammen — niemand geht allein",
    "Wenn etwas ist: sofort anrufen — die Nummer steht auf eurem Zettel"
  ],
  weg: "Wenn das erledigt ist: auf LOS GEHT'S tippen."
},

/* ------------------------------------------------------- 1 · Türsteher -- */
{
  typ: "code",
  titel: "Der Türsteher",
  modi: ["kurz", "mittel", "lang"],
  buchstabe: true,
  ort: "Zwei Häuser, zwei Richtungen",
  // Die Teams starten gegengleich, damit keiner abschreiben kann:
  teamText: [
    "Der Türsteher lässt nur rein, wer den Zahlencode kennt.\n\nGeht ZUERST HIER WEG A EINTRAGEN und merkt euch die Hausnummer.\nDANACH HIER WEG B EINTRAGEN und merkt euch auch die.\n\nZählt beide Hausnummern zusammen. Wie lautet die Summe?",
    "Der Türsteher lässt nur rein, wer den Zahlencode kennt.\n\nGeht ZUERST HIER WEG B EINTRAGEN und merkt euch die Hausnummer.\nDANACH HIER WEG A EINTRAGEN und merkt euch auch die.\n\nZählt beide Hausnummern zusammen. Wie lautet die Summe?"
  ],
  antwort: "HIER SUMME EINTRAGEN",
  tipp: "HIER TIPP EINTRAGEN — z. B. „Eine der beiden Nummern ist zweistellig.“",
  eingabeArt: "zahl"
},

/* ---------------------------------------------------- 2 · Geheimschrift -- */
{
  typ: "code",
  titel: "Die Geheimschrift",
  buchstabe: true,
  ort: "Unterwegs",
  weg: "Überall lösbar — am besten im Gehen.",
  text: "Der VIP-Club schreibt nichts im Klartext. Diese Nachricht ist verschlüsselt:\n\n22 — 9 — 16\n\nJede Zahl steht für einen Buchstaben. Findet heraus, welches Wort das ergibt.",
  antwort: "VIP",
  tipp: "A ist die 1, B die 2, C die 3 — und so weiter durchs ganze Alphabet."
},

/* -------------------------------------------------------- 3 · Suchbild -- */
{
  typ: "code",
  titel: "Das Suchbild",
  modi: ["kurz", "mittel", "lang"],
  buchstabe: true,
  ort: "In Gehweite",
  weg: "Sucht diesen Ort. Er ist keine fünf Minuten entfernt.",
  text: "Auf dem Bild seht ihr nur einen Ausschnitt. Findet die Stelle in echt.\n\nWas steht dort drauf?",
  foto: "fotos/station3.jpg",
  antwort: "HIER ANTWORT EINTRAGEN",
  tipp: "HIER TIPP EINTRAGEN — z. B. „Schaut nach oben, nicht nach unten.“"
},

/* -------------------------------------------------------- 4 · Stoppuhr -- */
{
  typ: "stoppuhr",
  titel: "Die Ruhe-Probe",
  modi: ["mittel", "lang", "drinnen"],
  ort: "Bleibt stehen",
  sekunden: 30,
  text: "Ein VIP wird nie nervös. Beweist es.\n\nTippt auf START und stoppt nach genau 30 Sekunden — ohne auf eine Uhr zu schauen. Zählen im Kopf ist erlaubt, aber niemand darf mitzählen helfen.\n\nJe näher ihr dran seid, desto mehr Punkte."
},

/* -------------------------------------------------- 5 · Sicherheitsstufe -- */
{
  typ: "handyaus",
  titel: "Sicherheitsstufe Rot",
  buchstabe: true,
  ort: "Bleibt stehen",
  sekunden: 120,
  text: "ACHTUNG — SICHERHEITSWARNUNG DES VIP-SERVERS.\n\nEin fremdes Gerät versucht, sich in eure VIP-Verbindung einzuklinken.\n\nSCHALTET SOFORT ALLE HANDYS KOMPLETT AUS.\nNicht nur den Bildschirm — ganz aus.\n\nWartet zwei Minuten. Dann wieder einschalten und diese Seite neu öffnen.",
  dankeText: "Danke, dass ihr eure Handys neu gestartet habt.\n\nDie Verbindung ist wieder sicher. Wir machen weiter.\n\n(Unter uns: Es hätte auch ohne funktioniert. Aber ihr wart wirklich überzeugend.)"
},

/* --------------------------------------------------- 6 · Spiegelschrift -- */
{
  typ: "spiegel",
  titel: "Die Spiegelschrift",
  modi: ["kurz", "mittel", "lang"],
  buchstabe: true,
  ort: "Zwei Orte, zwei Richtungen",
  teamText: [
    "HIER WEG C EINTRAGEN — dort gibt es etwas Spiegelndes.\n\nDie Nachricht unten steht verkehrt herum. So bekommt ihr sie lesbar:\n\nHaltet das Handy vor eine Fensterscheibe, ein Schaufenster oder eine Autoscheibe — im Spiegelbild stimmt sie wieder.\n\nOder ihr nehmt die SELFIE-Kamera eines zweiten Handys und schaut die Schrift darin an. Die spiegelt nämlich.",
    "HIER WEG D EINTRAGEN — dort gibt es etwas Spiegelndes.\n\nDie Nachricht unten steht verkehrt herum. So bekommt ihr sie lesbar:\n\nHaltet das Handy vor eine Fensterscheibe, ein Schaufenster oder eine Autoscheibe — im Spiegelbild stimmt sie wieder.\n\nOder ihr nehmt die SELFIE-Kamera eines zweiten Handys und schaut die Schrift darin an. Die spiegelt nämlich."
  ],
  spiegelText: "DAS LOSUNGSWORT BEGINNT MIT EINEM V",
  frage: "Und jetzt tippt ein: Womit beginnt das Losungswort?",
  antwort: "V",
  tipp: "Notfalls: Blatt Papier draufhalten und die Buchstaben von hinten durchpausen."
},

/* -------------------------------------------------- 7 · geheime Botschaft */
{
  typ: "code",
  titel: "Die geheime Botschaft",
  buchstabe: true,
  ort: "Unterwegs",
  weg: "Überall lösbar.",
  text: "Der VIP-Club hat eine Videobotschaft hinterlassen. Die Übertragung ist gestört — schaut trotzdem genau hin und hört genau zu.\n\nIrgendwo darin fällt ein Codewort. Wie lautet es?",
  // Entweder eine Datei auf dem Server:   video: "fotos/botschaft.mp4",
  // oder ein YouTube-Link:                video: "https://youtu.be/XXXXXXXXXXX",
  video: "HIER VIDEO-LINK EINTRAGEN",
  videoStoerung: true,          // legt den Störbild-Filter darüber
  antwort: "GOLDFISCH",
  antwortAuch: ["GOLD FISCH"],
  tipp: "Er sagt es nicht nur — er hält es auch schriftlich in die Kamera. Nochmal anschauen."
},

/* ================== DIE PAUSE — drei Stationen an einem Ort ==============
   Hier stellst du Essen und Trinken hin. Beide Teams kommen her, bleiben
   eine Weile und haben in der Zeit drei Aufgaben. Ungefähr die Mitte der Jagd.
   ======================================================================== */

/* ------------------------------------------------ 9 · Buffet-Rätsel ----- */
{
  typ: "code",
  titel: "Die Lounge",
  modi: ["kurz", "mittel", "lang", "drinnen"],
  gemeinsam: true,
  ort: "HIER PAUSENORT EINTRAGEN",
  weg: "Hier ist für euch gedeckt. Setzt euch, esst, trinkt — und schaut genau hin.",
  text: "Willkommen in der Lounge. Der Club sorgt für seine Mitglieder.\n\nAber nichts ist umsonst: An den Bechern und Tellern kleben kleine Zettel. Auf jedem steht ein Buchstabe und eine Zahl.\n\nDie Zahl sagt euch, an welche Stelle der Buchstabe gehört. Sammelt alle ein und setzt das Wort zusammen.\n\n(Ja, ihr müsst dafür alles anfassen. Genau das ist der Plan.)",
  antwort: "HIER BUFFET-WORT EINTRAGEN",
  tipp: "Zettel kleben auch dort, wo man nicht sofort hinschaut — unter dem Becher zum Beispiel."
},

/* -------------------------------------------------- 10 · Becherturm ----- */
{
  typ: "foto",
  titel: "Der Turm von Ternitz",
  modi: ["lang"],
  ort: "In der Lounge",
  weg: "Bleibt sitzen, das geht am Tisch.",
  text: "Solange ihr esst, könnt ihr auch bauen.\n\nBaut aus dem, was hier steht — Becher, Flaschen, Strohhalme — den höchsten Turm, den ihr hinbekommt. Er muss zehn Sekunden allein stehen.\n\nMacht ein Foto davon. Der höhere Turm bekommt am Ende Bonuspunkte.",
  auftraege: [
    "Unser Turm steht zehn Sekunden ohne Hilfe",
    "Wir haben ein Foto von ihm gemacht",
    "Auf dem Foto ist zu sehen, wie hoch er wirklich ist"
  ],
  mindestens: 3
},

/* --------------------------------------------------- 10 · Das Eisfach --- */
{
  typ: "code",
  titel: "Das Eisfach",
  modi: ["kurz", "mittel", "lang", "drinnen"],
  gemeinsam: true,
  ort: "In der Lounge",
  weg: "Bleibt hier. Das dauert.",
  text: "Der Club bewahrt seine Geheimnisse kalt.\n\nIhr bekommt zwölf Eiswürfel. In manchen steckt ein Buchstabe — in anderen nichts als ein ✗. Die zählen nicht.\n\nHolt die Buchstaben raus. Wie, ist eure Sache: in die Sonne legen, in den Händen halten, drauftrampeln, in warmes Wasser werfen. Nur nicht in den Mund nehmen.\n\nAus den echten Buchstaben ergibt sich ein Wort. Welches?",
  antwort: "EISKALT",
  tipp: "Sieben Buchstaben sind echt, fünf sind Nieten. Und ja — das Wort passt zu dem, was ihr gerade in den Händen habt.",
  gemeinsamText: "Diese Station macht ihr ZUSAMMEN mit dem anderen Team. Wartet aufeinander, teilt euch die Eiswürfel auf — jedes Team tippt die Antwort dann in sein eigenes Handy."
},

/* ------------------------------------------------------ 11 · Emoji-Duell -- */
{
  typ: "duell",
  titel: "Das Emoji-Duell",
  buchstabe: true,
  gemeinsam: true,
  ort: "In der Lounge",
  weg: "Beide Teams sind ohnehin hier. Wartet aufeinander.",
  text: "Jetzt wird es persönlich. Jedes Team hat ein Rätsel — und ein Geheimwort, das nur ihm gehört.",
  /* Der Ablauf steht als Schritte auf dem Bildschirm, damit ihn niemand erklären muss */
  ablauf: [
    "Zeigt dem anderen Team eure vier Emojis (stehen unten).",
    "Sie raten <b>laut</b>, welches Lied gemeint ist.",
    "<b>Ihr entscheidet</b>, ob es stimmt.",
    "Stimmt es, sagt ihr ihnen euer Geheimwort — sonst darf weitergeraten werden.",
    "Dasselbe umgekehrt: sie zeigen ihr Rätsel, ihr ratet.",
    "Tragt zum Schluss das Geheimwort des <b>anderen</b> Teams unten ein."
  ],
  ablaufHinweis: "Falsch raten kostet nichts. Es gibt so oft einen neuen Versuch, wie ihr wollt.",
  streitText: "Wenn ihr euch nicht einig seid, ob geraten wurde oder nicht: <b>Der Türsteher entscheidet.</b> Er ist in der Nähe — ruft ihn laut. Sein Wort gilt.",
  teamRaetsel: [
    "🦁 👑 🌍 🎵",          // Team 1 zeigt das — Lösung: Der König der Löwen
    "❄️ 👸 ⛄ 🎤"           // Team 2 zeigt das — Lösung: Die Eiskönigin
  ],
  tipp: "Euer eigenes Geheimwort steht ganz unten auf dieser Seite — aber nur herausrücken, wenn die anderen wirklich richtig geraten haben."
},

/* ------------------------------------------------- 12 · QR-Zettel ------ */
{
  typ: "code",
  titel: "Die verstecken Zettel",
  modi: ["mittel", "lang"],
  gemeinsam: true,
  ort: "HIER SUCHGEBIET EINTRAGEN",
  weg: "HIER WEG EINTRAGEN.",
  text: "Irgendwo hier sind drei kleine Zettel versteckt — an Schildern, unter Bänken, an Zäunen. Auf jedem klebt ein QR-Code.\n\nScannt alle drei mit der Kamera. Jeder zeigt euch einen Buchstaben.\n\nSetzt die drei Buchstaben zusammen und tippt sie ein.",
  antwort: "HIER ANTWORT EINTRAGEN",
  tipp: "HIER TIPP EINTRAGEN — z. B. „Einer hängt tiefer, als ihr denkt.“",
  gemeinsamText: "Sucht ZUSAMMEN mit dem anderen Team. Es gibt nur drei Zettel — wer sie zuerst findet, nimmt sie nicht weg, sondern zeigt sie her."
},

/* ---------------------------------------------------- 10 · Zählaufgabe --- */
{
  typ: "code",
  titel: "Die Zählaufgabe",
  modi: ["lang"],
  ort: "HIER ORT EINTRAGEN",
  weg: "HIER WEG EINTRAGEN.",
  text: "Kein Rateglück, nur genaues Schauen.\n\nZÄHLT: HIER EINTRAGEN, WAS GEZÄHLT WERDEN SOLL\n(zum Beispiel: die Stufen der Treppe, die Fenster an der Vorderseite, die Latten im Zaun)\n\nWie viele sind es?",
  antwort: "HIER ZAHL EINTRAGEN",
  tipp: "Zählt zu zweit und vergleicht — einer verzählt sich immer.",
  eingabeArt: "zahl"
},

/* -------------------------------------------------- 11 · Taschenrechner -- */
{
  typ: "code",
  titel: "Die Rechnung des Concierge",
  buchstabe: true,
  ort: "Unterwegs",
  weg: "Überall lösbar.",
  text: "Der Concierge hinterlässt seine Nachrichten in Zahlen. Nehmt den Taschenrechner am Handy und rechnet:\n\n1000 − 698\n\nJetzt kommt der Trick: Dreht das Handy um, sodass das Ergebnis auf dem Kopf steht.\n\nHALTET DAS HANDY NAH ANS GESICHT und schaut genau hin — auf Anhieb erkennt man es nicht. Aus den Ziffern wird ein Name.\n\nWelcher Name steht da?",
  antwort: "ZOE",
  tipp: "Aus der 3 wird ein E, aus der 0 ein O, aus der 2 ein Z. Und gelesen wird von rechts nach links."
},

/* ---------------------------------------------------- 12 · Zeitreise-Foto */
{
  typ: "foto",
  titel: "Das Zeitreise-Foto",
  modi: ["lang"],
  ort: "HIER ORT EINTRAGEN",
  weg: "HIER WEG EINTRAGEN.",
  text: "Dieses Bild wurde vor eurer Ankunft aufgenommen. Findet die Stelle — und stellt das Foto exakt nach, mit euch darauf.\n\nGleicher Winkel, gleicher Ausschnitt. Wenn ihr fertig seid, hakt ab.",
  foto: "fotos/zeitreise.jpg",
  auftraege: [
    "Wir haben die Stelle gefunden",
    "Wir haben das Foto im gleichen Winkel nachgestellt",
    "Alle aus dem Team sind mit drauf"
  ],
  mindestens: 3
},

/* ------------------------------------------------------- 13 · Paparazzi -- */
{
  typ: "foto",
  titel: "Die Paparazzi-Mission",
  modi: ["lang", "drinnen"],
  ort: "Überall",
  weg: "Ihr habt zehn Minuten.",
  text: "Ihr seid jetzt die Fotografen. Mindestens VIER der sechs Aufträge müssen erledigt sein — wer alle sechs schafft, bekommt Bonuspunkte.\n\nGeschummelt wird nicht: Die Fotos werden am Pool angeschaut.",
  auftraege: [
    "Ein Foto, auf dem euer ganzes Team gleichzeitig in der Luft ist",
    "Ein Foto mit einem Tier (Schnecke zählt auch)",
    "Ein Foto, auf dem einer von euch etwas Riesiges zu halten scheint",
    "Etwas, das aussieht wie ein Gesicht, aber keines ist",
    "Ein Foto von etwas Goldenem",
    "Ein 5-Sekunden-Video, in dem alle gleichzeitig dieselbe Pose machen"
  ],
  mindestens: 4
},

/* ---------------------------------------------------------- 14 · Sprint -- */
{
  typ: "sprint",
  titel: "Der Sprint",
  modi: ["mittel", "lang"],
  ort: "HIER ZIELPUNKT EINTRAGEN",
  sekunden: 180,
  text: "Jetzt zählt Tempo.\n\nIhr habt DREI MINUTEN, um HIER ZIELPUNKT EINTRAGEN zu erreichen und dort ein Foto von euch zu machen.\n\nSchafft ihr es, gibt es Bonuspunkte. Schafft ihr es nicht, geht es trotzdem weiter — aber ohne Bonus.\n\nBereit?",
  auftraege: [
    "Wir waren rechtzeitig dort und haben das Foto gemacht"
  ]
},

/* --------------------------------------------------- 15 · Kennwort-Suche -- */
{
  typ: "kennwort",
  titel: "Die halbe Wahrheit",
  modi: ["kurz", "mittel", "lang"],
  ort: "Zwei Verstecke",
  teamText: [
    "Um in den VIP-Club zu kommen, braucht ihr ein Kennwort. Aber ihr bekommt nur die HÄLFTE.\n\nHIER VERSTECK 1 BESCHREIBEN\n\nDort liegt EUER Zettel — das andere Team hat ein eigenes Versteck woanders, ihr kommt euch also nicht in die Quere.\n\nMerkt euch, was darauf steht, und sucht dann das andere Team. Ohne dessen Hälfte geht gar nichts.",
    "Um in den VIP-Club zu kommen, braucht ihr ein Kennwort. Aber ihr bekommt nur die HÄLFTE.\n\nHIER VERSTECK 2 BESCHREIBEN\n\nDort liegt EUER Zettel — das andere Team hat ein eigenes Versteck woanders, ihr kommt euch also nicht in die Quere.\n\nMerkt euch, was darauf steht, und sucht dann das andere Team. Ohne dessen Hälfte geht gar nichts."
  ],
  frage: "Habt ihr beide Hälften? Dann tippt das ganze Kennwort ein.",
  tipp: "Beide Wörter hintereinander, in der richtigen Reihenfolge. Ihr merkt selbst, was zuerst kommt."
},

/* ----------------------------------------------------------- 16 · Anruf -- */
{
  typ: "anruf",
  titel: "Der Anruf",
  modi: ["kurz", "mittel", "lang"],
  ort: "HIER ORT EINTRAGEN — weit weg vom Garten",
  weg: "Von hier ist es ein ordentliches Stück zurück. Das ist Absicht.",
  text: "Letzte Hürde vor dem Club.\n\nRuft den Empfang an. Wer sich meldet, will nur eines hören: euer Kennwort.\n\nStimmt es, bekommt ihr den Zutrittscode. Stimmt es nicht, wird aufgelegt.",
  frage: "Wie lautet der Zutrittscode?",
  tipp: "Deutlich sprechen und beide Wörter sagen. Wer nuschelt, fliegt raus."
},

/* ---------------------------------------------------------- FINALE ------ */
{
  typ: "finale",
  titel: "Die VIP-Lounge",
  ort: "Zurück zum Garten",
  weg: "Lauft zurück. Am Tor wartet jemand.",
  text: "Ihr habt alle Buchstaben. Jetzt legt sie in die richtige Reihenfolge.\n\nTippt die Buchstaben der Reihe nach an — dann auf CODE PRÜFEN.",
  danachText: "Zutritt gewährt.\n\nJetzt aber schnell zurück zum Garten. Am Tor steht der Türsteher — sagt ihm das Losungswort ins Gesicht, laut und deutlich.\n\nErst dann geht das Tor auf."
}

];
