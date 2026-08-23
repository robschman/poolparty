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

        "kurz"     15 Stationen, rund 130 Minuten — wenn der Pool ruft
        "mittel"   18 Stationen, rund 150 Minuten — der Mittelweg
        "lang"     22 Stationen, rund 195 Minuten — alles, was drin ist
        "drinnen"  11 Stationen, rund  95 Minuten — ohne Wege, alles unter Dach

     Normalerweise stellst du das gar nicht hier ein, sondern in der
     TÜRSTEHER-APP (leitung-a77661/tuersteher.html) — dort wählst du die
     Fassung aus und bekommst gleich die passenden QR-Codes je Team.
     Der gescannte Code gewinnt immer über diese Zeile.
     ----------------------------------------------------------------------- */
  modus: "lang",

  /* ---- DIE TEAMS ----------------------------------------------------------
     GENAU ZWEI Teams — mehr geht nicht, und zwar aus gutem Grund:
     Beim Türsteher und bei der Spiegelschrift laufen die Teams gegengleich,
     damit sie sich nicht über den Weg laufen. Das Kennwort hat genau zwei
     Hälften (ROTER + TEPPICH). Und beim Emoji-Duell rätselt jedes Team gegen
     das andere. Ein drittes Team hätte keinen eigenen Weg — es würde
     denselben gehen wie Team 1.

     Bei mehr Kindern werden die Teams größer, nicht mehr.

     Die Reihenfolge zählt: Team 1 wird überall zuerst nach links geschickt,
     Team 2 zuerst nach rechts.

     Die Geheimwörter brauchen die Kinder beim Emoji-Duell: jedes Team
     verrät seines dem anderen, wenn es das Lied erraten hat.
     ----------------------------------------------------------------------- */
  teams: [
    { name: "Team Diamant", geheimwort: "KAVIAR"     },
    { name: "Team Platin",  geheimwort: "LIMOUSINE"  }
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
  anrufCode:      "MILLIONÄR",    // den sagst du am Telefon, wenn das Kennwort stimmt

  /* Tippfehler, die trotzdem durchgehen sollen. Kinder tippen am Handy schnell
     und der Umlaut geht leicht verloren — das darf die Jagd nicht aufhalten.
     "Millionaer" muss nicht dabeistehen: Ä wird automatisch zu AE. */
  anrufCodeAuch: ["MILLIONAR", "MILIONÄR", "MILIONAR", "MILLIONAIR",
                  "MILLIONAIRE", "MILLIONER", "MILLIONÖR"],

  /* ---- PUNKTE ------------------------------------------------------------- */
  punkteProStation: 100,
  abzugTipp:         30,
  abzugFehler:       10,

  /* ---- SPIELLEITER --------------------------------------------------------
     Im Spiel oben links die Krone 3x antippen, dann diesen Code eingeben.
     ----------------------------------------------------------------------- */
  leiterCode: "9999",

  /* ---- VERSION ------------------------------------------------------------
     ACHTUNG — diese Zahl NICHT einfach hochzählen.

     Sie steckt im Speicherplatz des Spielstands. Zählt man sie hoch, fangen
     alle laufenden Spiele wieder bei null an: Punkte weg, Buchstaben weg,
     Teamwahl von vorne. Das ist nur gewollt, wenn sich die Stationen so stark
     geändert haben, dass ein alter Spielstand nicht mehr passt.

     Damit ein Handy neue Dateien lädt, ist etwas anderes zuständig:
     das ?v= hinter den Dateinamen in der index.html.
     ----------------------------------------------------------------------- */
  version: "10"
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
  merkkasten: "MERKT EUCH ZWEI ORTE — ihr kommt heute immer wieder dorthin zurück:\n\n📍 DAS GARTENTÜRL — hier fängt alles an und hier hört alles auf.\n📍 DER ORANGE CONTAINER — der große orange Container unten an der Straße. Er ist heute euer wichtigster Wegweiser.",
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
  weg: "Ihr geht beide Wege — nur in verschiedener Reihenfolge. So kommt ihr euch nicht in die Quere.",
  // Die Teams starten gegengleich, damit keiner abschreiben kann:
  teamText: [
    "Der Türsteher lässt nur rein, wer den Zahlencode kennt. Der Code sind ZWEI Hausnummern, zusammengezählt.\n\n▸ ZUERST WEG A — das grüne Haus:\n\n1. Vom Gartentürl raus und rechts am Gehsteig entlang.\n2. Immer am Zaun entlang, bis zum grünen Netz beim Garten.\n3. Links in die Straße, bis ihr die Schilder Grabengasse 15 und Gartengasse 17 seht.\n4. Weiter Richtung orangen Container, dann rechts in die Straße hinein.\n5. Am kleinen Spielplatz vorbei bis ganz zum Ende der Straße.\n6. Rechts in die lange Straße und immer weiter.\n7. Irgendwann seht ihr LINKS OBEN AM BERG DIE KIRCHE — dann seid ihr richtig.\n8. Geht weiter, bis wieder LINKS UND RECHTS HÄUSER stehen. Dann seid ihr weit genug.\n9. Dort stehen ein GRAUES und ein GRÜNES HAUS — direkt aneinander.\n10. Beim GRAUEN HAUS steht die Zahl AN DER WAND, hinter dem grünen Busch. Sie ist EINSTELLIG.\n\n▸ DANACH WEG B — das gelbe Haus:\n\n1. Zurück zum Gartentürl, dann links den schmalen Weg entlang.\n2. Die Stufen HINAUF, danach links, dann gleich wieder rechts.\n3. Die Straße entlang, an den Parkplätzen vorbei.\n4. Rechts VOR den Mülltonnen geht ein kleiner Weg hinein — dort steht Schwarzer Weg 22A und 22B.\n5. Hinein, dann links. Es kommt noch ein Parkplatz.\n6. Am Parkplatz entlang ganz nach vorne bis zur Straße.\n7. LINKS oben am Berg seht ihr wieder die Kirche. RECHTS steht ein GELBES HAUS — und zwar genau das, das DIREKT AN DER ECKE steht. Dort ist die Zahl.\n\nZählt beide Hausnummern zusammen. Wie lautet die Summe?",
    "Der Türsteher lässt nur rein, wer den Zahlencode kennt. Der Code sind ZWEI Hausnummern, zusammengezählt.\n\n▸ ZUERST WEG B — das gelbe Haus:\n\n1. Vom Gartentürl raus und links den schmalen Weg entlang.\n2. Die Stufen HINAUF, danach links, dann gleich wieder rechts.\n3. Die Straße entlang, an den Parkplätzen vorbei.\n4. Rechts VOR den Mülltonnen geht ein kleiner Weg hinein — dort steht Schwarzer Weg 22A und 22B.\n5. Hinein, dann links. Es kommt noch ein Parkplatz.\n6. Am Parkplatz entlang ganz nach vorne bis zur Straße.\n7. LINKS oben am Berg seht ihr die Kirche. RECHTS steht ein GELBES HAUS — und zwar genau das, das DIREKT AN DER ECKE steht. Dort ist die Zahl.\n\n▸ DANACH WEG A — das grüne Haus:\n\n1. Zurück zum Gartentürl, dann rechts am Gehsteig entlang.\n2. Immer am Zaun entlang, bis zum grünen Netz beim Garten.\n3. Links in die Straße, bis ihr die Schilder Grabengasse 15 und Gartengasse 17 seht.\n4. Weiter Richtung orangen Container, dann rechts in die Straße hinein.\n5. Am kleinen Spielplatz vorbei bis ganz zum Ende der Straße.\n6. Rechts in die lange Straße und immer weiter, bis ihr LINKS OBEN AM BERG DIE KIRCHE seht.\n7. Weiter, bis wieder LINKS UND RECHTS HÄUSER stehen — dann seid ihr weit genug.\n8. Dort stehen ein GRAUES und ein GRÜNES HAUS — direkt aneinander.\n9. Beim GRAUEN HAUS steht die Zahl AN DER WAND, hinter dem grünen Busch. Sie ist EINSTELLIG.\n\nZählt beide Hausnummern zusammen. Wie lautet die Summe?"
  ],
  antwort: "29",
  tipp: "Eine der beiden Zahlen ist einstellig, die andere zweistellig. Zusammen sind es weniger als dreißig.",
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
  ort: "Beim hinteren Spielplatz",
  weg: "Geht zum hinteren Spielplatz. Dort hängt eine Tafel — irgendwo daran ist dieser Ausschnitt.",
  text: "Auf dem Bild seht ihr nur einen kleinen Ausschnitt. Findet das Schild in echt und lest es ganz durch.\n\nWelches Wort steht GANZ AM SCHLUSS darauf?",
  foto: "fotos/suchbild.jpg",
  antwort: "VERBOTEN",
  tipp: "Das allerletzte Wort auf dem Schild. Es steht ein Rufzeichen dahinter."
},

/* -------------------------------------------------------- 4 · Stoppuhr -- */
{
  typ: "stoppuhr",
  titel: "Die Ruhe-Probe",
  modi: ["mittel", "lang", "drinnen"],
  ort: "Bleibt stehen",
  sekunden: 30,
  text: "Ein VIP wird nie nervös. Beweist es.\n\nTippt auf START und stoppt nach genau 30 Sekunden — ohne auf eine Uhr zu schauen.\n\nMITZÄHLEN IST ERLAUBT, auch laut und alle zusammen.\nNUR MITSTOPPEN IST VERBOTEN: keine zweite Uhr, keine Stoppuhr am anderen Handy, kein Blick auf die Zeitanzeige.\n\nJe näher ihr dran seid, desto mehr Punkte."
},

/* -------------------------------------------------- 5 · Sicherheitsstufe -- */
{
  typ: "handyaus",
  titel: "Sicherheitsstufe Rot",
  buchstabe: true,
  ort: "Bleibt stehen",
  sekunden: 120,
  /* Sirene die ganzen zwei Minuten, die letzten 20 Sekunden doppelt so
     schnell. Auf false setzen, wenn es zu viel wird. */
  alarmTon: true,
  text: "ACHTUNG — SICHERHEITSWARNUNG DES VIP-SERVERS.\n\nEin fremdes Gerät versucht, sich in eure VIP-Verbindung einzuklinken.\n\nSCHALTET SOFORT ALLE HANDYS KOMPLETT AUS.\nNicht nur den Bildschirm — ganz aus.\n\nWartet zwei Minuten. Dann wieder einschalten und diese Seite neu öffnen.",
  dankeText: "Danke, dass ihr eure Handys neu gestartet habt.\n\nDie Verbindung ist wieder sicher. Wir machen weiter.\n\n(Unter uns: Es hätte auch ohne funktioniert. Aber ihr wart wirklich überzeugend.)"
},

/* --------------------------------------------------- 6 · Spiegelschrift -- */
{
  typ: "spiegel",
  titel: "Die Spiegelschrift",
  modi: ["kurz", "mittel", "lang"],
  buchstabe: true,
  ort: "Ab dem orangen Container — jedes Team in eine andere Richtung",
  weg: "Zurück zum Spielplatz, dann zum orangen Container. Dort trennt ihr euch.",
  teamText: [
    "So kommt ihr hin:\n\n1. Zurück zum Spielplatz, zur SCHAUKEL.\n2. Genau zwischen den zwei Häusern LINKS von der Schaukel durchgehen.\n3. Ihr kommt auf eine Straße — die geht ihr nach LINKS entlang.\n4. Geht so weit, bis ihr den ORANGEN CONTAINER seht.\n5. Dort geht ihr NACH LINKS, bis zum Ende der Straße.\n6. Dort stehen Autos.\n\nDie Nachricht unten steht verkehrt herum. So bekommt ihr sie lesbar:\n\nHaltet das Handy vor eine AUTO-SEITENSCHEIBE — im Spiegelbild stimmt sie wieder.\n\nOder ihr nehmt die SELFIE-Kamera eines zweiten Handys und schaut die Schrift darin an. Die spiegelt nämlich.\n\n(Das andere Team ist in die Gegenrichtung unterwegs. Ihr trefft euch nicht.)",
    "So kommt ihr hin:\n\n1. Zurück zum Spielplatz, zur SCHAUKEL.\n2. Genau zwischen den zwei Häusern LINKS von der Schaukel durchgehen.\n3. Ihr kommt auf eine Straße — die geht ihr nach LINKS entlang.\n4. Geht so weit, bis ihr den ORANGEN CONTAINER seht.\n5. Dort geht ihr NACH RECHTS, bis zum Ende der Straße.\n6. Dort stehen Autos.\n\nDie Nachricht unten steht verkehrt herum. So bekommt ihr sie lesbar:\n\nHaltet das Handy vor eine AUTO-SEITENSCHEIBE — im Spiegelbild stimmt sie wieder.\n\nOder ihr nehmt die SELFIE-Kamera eines zweiten Handys und schaut die Schrift darin an. Die spiegelt nämlich.\n\n(Das andere Team ist in die Gegenrichtung unterwegs. Ihr trefft euch nicht.)"
  ],
  spiegelText: "DAS LOSUNGSWORT BEGINNT MIT EINEM V",
  frage: "Und jetzt tippt ein: Womit beginnt das Losungswort?",
  antwort: "V",
  tipp: "Notfalls: Blatt Papier draufhalten und die Buchstaben von hinten durchpausen. Oder das Handy einfach auf den Kopf stellen und schielen."
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
  video: "fotos/botschaft.mp4",

  /* videoStoerung: true = verfremdet, "stark" = kaum noch zu erkennen.

     ACHTUNG bei "stark": Auf dem Schild im Video steht das Codewort. Mit der
     starken Störung ist die Schrift kaum noch zu lesen — dann hängt alles am
     Ton. Darum steht hier absichtlich nur true. Wer unbedingt will, tauscht
     true gegen "stark" — aber dann vorher selbst anschauen, ob man das Wort
     noch erkennt.

     videoTempo:    kleiner als 1 macht das Bild langsamer UND die Stimme
                    tiefer. 0.85 klingt schon deutlich anders, man versteht
                    aber jedes Wort. Bei 0.75 wird es dumpf.
                    Auf 1 stellen, wenn du das Video selbst bearbeitet hast. */
  videoStoerung: true,
  videoTempo: 0.85,
  antwort: "GOLDFISCH",
  antwortAuch: ["GOLD FISCH"],
  tipp: "Er sagt es nicht nur — er hält es auch schriftlich in die Kamera. Nochmal anschauen."
},

/* ================== DIE PAUSE — drei Stationen an einem Ort ==============
   Hier stellst du Essen und Trinken hin. Beide Teams kommen her, bleiben
   eine Weile und haben in der Zeit drei Aufgaben. Ungefähr die Mitte der Jagd.
   ======================================================================== */

/* ------------------------------------------------ 9 · Ankunft Lounge ---- */
{
  typ: "foto",
  titel: "Die Lounge",
  modi: ["kurz", "mittel", "lang", "drinnen"],
  gemeinsam: true,
  gemeinsamText: "Ab hier geht es nur noch gemeinsam weiter. Wartet aufeinander — auch wenn es dauert.",
  ort: "Draußen beim Gartentürl",
  weg: "Geht zurück zum Gartentürl. Draußen davor ist für euch gedeckt.",
  text: "Willkommen in der Lounge. Der Club sorgt für seine Mitglieder.\n\nSetzt euch. Esst etwas, trinkt etwas, schnauft durch.\n\nDas war die erste Hälfte — und ab jetzt geht es nur noch zusammen weiter.",
  auftraege: [
    "Wir sitzen und haben etwas getrunken",
    "Das andere Team ist auch da",
    "Wir haben uns gegenseitig erzählt, was bisher passiert ist"
  ],
  mindestens: 3
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
    "🥇 ✨ 🎤 👑",          // Team 1 zeigt das — Lösung: Golden (KATSEYE)
    "🫃 🦵 🍑"              // Team 2 zeigt das — Lösung: Bauch Beine Po
  ],
  tipp: "Euer eigenes Geheimwort steht ganz unten auf dieser Seite — aber nur herausrücken, wenn die anderen wirklich richtig geraten haben."
},

/* ------------------------------------------------- 12 · QR-Zettel ------ */
{
  typ: "code",
  titel: "Die versteckten Zettel",
  modi: ["mittel", "lang"],
  gemeinsam: true,
  ort: "Rund um die Lounge",
  weg: "Bleibt in der Nähe. Alle drei Zettel sind in Sichtweite vom Tisch.",
  text: "Irgendwo hier sind drei kleine Zettel versteckt — an Schildern, unter Bänken, an Zäunen. Auf jedem klebt ein QR-Code.\n\nScannt alle drei mit der Kamera. Jeder zeigt euch einen Buchstaben.\n\nSetzt die drei Buchstaben zusammen und tippt sie ein.",
  antwort: "BAR",
  tipp: "Einer hängt tiefer, als ihr denkt. Und einer ist dort, wo ihr gerade sitzt.",
  gemeinsamText: "Sucht ZUSAMMEN mit dem anderen Team. Es gibt nur drei Zettel — wer sie zuerst findet, nimmt sie nicht weg, sondern zeigt sie her."
},

/* ---------------------------------------------------- 10 · Zählaufgabe --- */
{
  typ: "code",
  titel: "Die Zählaufgabe",
  modi: ["lang"],
  ort: "Auf der kleinen Brücke",
  weg: "Von der Lounge Richtung grüner Zaun und weiter zum orangen Container.",
  text: "Kein Rateglück, nur genaues Schauen.\n\nSo kommt ihr hin:\n\n1. Von der Lounge Richtung GRÜNER ZAUN und weiter zum ORANGEN CONTAINER.\n2. Beim Container die Straße NACH RECHTS entlang.\n3. Geht sie ganz aus, bis sie ENDET.\n4. Dort schaut ihr NACH LINKS HINAUF — da ist die BRÜCKE.\n5. Geht hinauf. Sie hat ein grünes Geländer.\n\nZÄHLT: die DICKEN Steher am Geländer — auf BEIDEN Seiten der Brücke.\nDie dünnen Sprossen dazwischen zählen NICHT.\n\nWie viele sind es zusammen?",
  antwort: "52",
  tipp: "Zählt eine Seite in Ruhe und verdoppelt. Beide Seiten sind gleich.",
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
  ort: "Der Baum im kleinen Kreisverkehr",
  weg: "Von der Brücke wieder HERUNTER — nicht drüber. Dann die lange Straße immer geradeaus.",
  text: "So kommt ihr hin:\n\n1. Geht von der Brücke WIEDER HERUNTER — nicht über die Brücke drüber.\n2. Dann die lange Straße IMMER GERADEAUS.\n3. Bis zum GELBEN HAUS, gegenüber ist ein Parkplatz.\n4. Dort ist ein kleiner KREISVERKEHR unter den Bäumen.\n\nDieses Bild wurde vor eurer Ankunft aufgenommen. Findet die Stelle — und stellt das Foto exakt nach, mit euch darauf.\n\nGleicher Winkel, gleicher Ausschnitt. Schaut euch an, wie tief die Kamera war — das ist der Trick.\n\nWenn ihr fertig seid, hakt ab.",
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
  ort: "Die Bank gegenüber dem Feuerwehrtor",
  weg: "Vom Kreisverkehr zur Straße — nicht Richtung Brücke und nicht Richtung orangen Container, sondern in die dritte Richtung hinauf.",
  sekunden: 180,
  text: "Jetzt zählt Tempo.\n\nIhr habt DREI MINUTEN, um zum ELEFANTEN-SPIELPLATZ zu laufen.\n\nHinter dem Elefanten steht eine schwarze Tonne. Dahinter ist eine kleine Bank — genau gegenüber dem Feuerwehrtor.\n\nSetzt euch auf die Bank und macht ein Foto von der Feuerwehr. Oder stellt euch davor und macht ein Selfie. Beides zählt.\n\nSchafft ihr es, gibt es Bonuspunkte. Schafft ihr es nicht, geht es trotzdem weiter — aber ohne Bonus.\n\nBereit?",
  auftraege: [
    "Wir waren rechtzeitig dort und haben das Foto gemacht"
  ]
},

/* --------------------------------------------------- 15 · Kennwort-Suche -- */
{
  typ: "kennwort",
  titel: "Die halbe Wahrheit",
  modi: ["kurz", "mittel", "lang"],
  ort: "Die roten Stecken oberhalb vom orangen Container",
  weg: "Zurück zum orangen Container, dort links den kleinen Weg hinauf bis ganz oben.",
  teamText: [
    "Um in den VIP-Club zu kommen, braucht ihr ein Kennwort. Aber ihr bekommt nur die HÄLFTE.\n\nSo kommt ihr hin:\n\n1. Zurück zum ORANGEN CONTAINER.\n2. Dort links den kleinen Weg hinauf, bis ihr ganz oben seid.\n3. Oben geht ihr NACH LINKS.\n4. Geht so lange, bis ihr in der Wiese neben der Straße einen HOLZSTECKEN MIT ROTER MARKIERUNG seht.\n5. Auf dem Stecken steht ein Wort. Das ist EURE Hälfte — merkt es euch gut, es steht NIRGENDS SONST.\n\nDas andere Team sucht in die Gegenrichtung. Wartet oben aufeinander — ohne dessen Hälfte geht gar nichts.",
    "Um in den VIP-Club zu kommen, braucht ihr ein Kennwort. Aber ihr bekommt nur die HÄLFTE.\n\nSo kommt ihr hin:\n\n1. Zurück zum ORANGEN CONTAINER.\n2. Dort links den kleinen Weg hinauf, bis ihr ganz oben seid.\n3. Oben geht ihr NACH RECHTS.\n4. Geht so lange, bis ihr in der Wiese neben der Straße einen HOLZSTECKEN MIT ROTER MARKIERUNG seht.\n5. Auf dem Stecken steht ein Wort. Das ist EURE Hälfte — merkt es euch gut, es steht NIRGENDS SONST.\n\nDas andere Team sucht in die Gegenrichtung. Wartet oben aufeinander — ohne dessen Hälfte geht gar nichts."
  ],
  frage: "Habt ihr beide Hälften? Dann tippt das ganze Kennwort ein.",
  tipp: "Beide Wörter hintereinander, in der richtigen Reihenfolge. Eines davon ist eine Farbe — und Farben stehen meistens vorne."
},

/* ----------------------------------------------------------- 16 · Anruf -- */
{
  typ: "anruf",
  titel: "Der Anruf",
  modi: ["kurz", "mittel", "lang"],
  ort: "Beim orangen Container",
  weg: "Geht gemeinsam von den Stecken hinunter zum orangen Container. Von dort wird telefoniert.",
  gemeinsam: true,
  gemeinsamText: "EIN Team ruft an — aber auf LAUTSPRECHER. Alle müssen mithören, auch das andere Team.",
  text: "Letzte Hürde vor dem Club.\n\n☎️ EIN TEAM RUFT AN. HANDY AUF LAUTSPRECHER.\nAlle stehen zusammen und hören mit — auch das andere Team.\n\nWas der Empfang von euch will, sagt er euch selbst. Also: anrufen, MUND HALTEN, ZUHÖREN.\n\nSagt ihr das Falsche, wird aufgelegt. Dann ruft ihr eben nochmal an.\n\nAm Ende bekommt ihr den ZUTRITTSCODE und einen letzten Auftrag. Der wird nur EINMAL gesagt.\n\nDanach tragt ihr den Code hier ein — beide Teams, jedes auf seinem eigenen Handy.",
  frage: "Wie lautet der Zutrittscode?",
  tipp: "Ihr habt heute schon etwas zusammengesetzt, das er hören will. Sagt es deutlich — wer nuschelt, fliegt raus."
},

/* ------------------------------------------------------- 17 · Abholung -- */
{
  typ: "foto",
  titel: "Die Abholung",
  modi: ["kurz", "mittel", "lang"],
  gemeinsam: true,
  gemeinsamText: "Beide Teams gehen zusammen. Jeder braucht ein Band — auch die aus dem anderen Team.",
  ort: "Elefanten-Spielplatz",
  weg: "Ihr wart heute schon dort. Ihr kennt den Weg.",
  text: "Der Club schickt euch noch einmal los.\n\nGeht zum ELEFANTEN-SPIELPLATZ. Hinter dem Elefanten wartet etwas auf euch.\n\nJEDER nimmt sich ein EINLASSBAND und zieht es an. Ohne Band kommt niemand in den VIP-Garten — das ist die Regel des Clubs.\n\nWas sonst noch dabeiliegt, gehört auch euch.\n\nDann so schnell ihr könnt zurück zum Gartentürl. Er wartet schon.",
  auftraege: [
    "Jeder von uns trägt ein Band am Handgelenk",
    "Auch das andere Team hat Bänder",
    "Wir haben ein Foto von uns allen mit Band gemacht"
  ],
  mindestens: 2
},

/* ---------------------------------------------------------- FINALE ------ */
{
  typ: "finale",
  titel: "Die VIP-Lounge",
  ort: "Zurück zum Garten",
  weg: "Lauft zurück zum Gartentürl. Am Tor wartet jemand — und der will das Band sehen.",
  text: "Ihr habt alle Buchstaben. Jetzt legt sie in die richtige Reihenfolge.\n\nTippt die Buchstaben der Reihe nach an — dann auf CODE PRÜFEN.",
  danachText: "Zutritt gewährt.\n\nJetzt aber schnell zurück zum Gartentürl. Am Tor steht der Türsteher.\n\n1. Sagt ihm das Losungswort ins Gesicht — laut und deutlich.\n2. Haltet ihm euer EINLASSBAND hin. Er schaut sich jedes Handgelenk einzeln an.\n\nErst dann geht das Tor auf."
}

];
