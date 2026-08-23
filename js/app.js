/* ==========================================================================
   VIP-SCHNITZELJAGD — die Spiel-Logik
   Hier musst du normalerweise NICHTS ändern.
   Alles Inhaltliche steht in  stationen.js .
   ========================================================================== */
(function(){
"use strict";

/* --- Kurzbefehle --------------------------------------------------------- */
const $   = (s)=>document.querySelector(s);
const app = ()=>$("#app");

/* --- Wo war ich stehengeblieben? -----------------------------------------
   Sobald ein Team losspielt, merkt sich das Handy Fassung und Team in einem
   eigenen kleinen Zeiger. Wer die Seite später ohne den QR-Code aufmacht —
   über das Lesezeichen, das Symbol am Startbildschirm oder die blanke
   Adresse — landet damit trotzdem wieder in seinem laufenden Spiel.
   Ohne diesen Zeiger wäre der Spielstand nach so einem Aufruf scheinbar weg.
   ------------------------------------------------------------------------ */
const ZEIGER = "vip_letztes_spiel";
function zeigerLesen(){
  try{ return JSON.parse(localStorage.getItem(ZEIGER) || "null"); }catch(e){ return null; }
}
function zeigerSchreiben(modus, team){
  try{ localStorage.setItem(ZEIGER, JSON.stringify({ modus: modus, team: team })); }catch(e){}
}

const FASSUNGEN = ["kurz","mittel","lang","drinnen"];
const ZULETZT = zeigerLesen();

/* --- Fassung bestimmen: QR-Code schlägt Zeiger schlägt Datei ------------- */
const MODUS = (function(){
  try{
    const ausUrl = new URLSearchParams(location.search).get("modus");
    if(ausUrl && FASSUNGEN.indexOf(ausUrl) > -1) return ausUrl;
  }catch(e){}
  if(ZULETZT && FASSUNGEN.indexOf(ZULETZT.modus) > -1) return ZULETZT.modus;
  return (SPIEL.modus && FASSUNGEN.indexOf(SPIEL.modus) > -1)
         ? SPIEL.modus : "lang";
})();

/* --- Team bestimmen ------------------------------------------------------
   Steht  ?team=0  oder  ?team=1  in der Adresse, gilt das — jedes Team
   scannt seinen eigenen Code. Sonst gilt, was zuletzt gespielt wurde.
   ------------------------------------------------------------------------ */
function teamAusUrl(){
  try{
    const t = new URLSearchParams(location.search).get("team");
    if(t !== null && /^\d+$/.test(t)){
      const n = +t;
      if(n >= 0 && n < (SPIEL.teams||[]).length) return n;
    }
  }catch(e){}
  return null;
}
const TEAM_VORGABE = (function(){
  const ausUrl = teamAusUrl();
  if(ausUrl !== null) return ausUrl;
  if(ZULETZT && typeof ZULETZT.team === "number"
     && ZULETZT.team >= 0 && ZULETZT.team < (SPIEL.teams||[]).length) return ZULETZT.team;
  return null;
})();

/* Nur die Stationen, die in diesem Modus laufen */
const AKTIV = STATIONEN.filter(s => !s.modi || s.modi.indexOf(MODUS) > -1);

/* Jedes Team bekommt seinen eigenen Speicherplatz. So kann dasselbe Handy
   beide Teams testen, ohne dass sich die Spielstände in die Quere kommen.

   ACHTUNG bei SPIEL.version: Die Zahl steckt im Speicherplatz. Wird sie
   hochgezählt, fangen ALLE laufenden Spiele wieder von vorne an. Das ist
   nur gewollt, wenn sich die Stationen so stark geändert haben, dass ein
   alter Spielstand nicht mehr passt. Für „das Handy soll die neuen Dateien
   laden" ist die Zahl NICHT zuständig — dafür ist das ?v= in der
   index.html da. */
const SPEICHER = "vip_jagd_v" + (SPIEL.version || "1") + "_" + MODUS
               + (TEAM_VORGABE !== null ? "_t" + TEAM_VORGABE : "");

/* --- Buchstaben auf die aktiven Stationen verteilen ----------------------
   Das Losungswort wird durcheinandergewürfelt vergeben. Sind weniger
   Stationen aktiv als Buchstaben, gibt eine Station eben zwei.
   ------------------------------------------------------------------------ */
const BUCHSTABEN_JE_STATION = (function(){
  const wort = (SPIEL.loesungswort || "").toUpperCase();
  const misch = SPIEL.buchstabenReihenfolge && SPIEL.buchstabenReihenfolge.length === wort.length
              ? SPIEL.buchstabenReihenfolge
              : wort.split("").map((_,i)=>i);
  const folge = misch.map(i => wort[i]).filter(Boolean);
  const stationen = AKTIV.map((s,i)=>({s,i})).filter(o=>o.s.buchstabe);
  const karte = {};
  if(!stationen.length) return karte;
  stationen.forEach(o => karte[o.i] = []);
  folge.forEach((b,n) => karte[stationen[n % stationen.length].i].push(b));
  return karte;
})();
const BUCHSTABEN_STATIONEN = AKTIV.map((s,i)=>({s,i})).filter(o=>o.s.buchstabe);

/* --- Spielstand ---------------------------------------------------------- */
let Z = {
  team:null, station:0, punkte:0, start:null,
  gesammelt:[], tipps:[], fehler:{}, haken:{}, quiz:{},
  handyausAb:null, fertig:false, gelegt:[],
  /* zuletzt = was die eben abgeschlossene Station gebracht hat.
     Nur damit kann der Zurück-Knopf sauber rückgängig machen. */
  zuletzt:null
};
function laden(){
  try{ const d = localStorage.getItem(SPEICHER); if(d) Z = Object.assign(Z, JSON.parse(d)); }catch(e){}
}
function sichern(){
  try{ localStorage.setItem(SPEICHER, JSON.stringify(Z)); }catch(e){}
  /* Bei JEDEM Speichern mitschreiben, wo dieses Handy gerade spielt.
     Damit findet auch ein Spiel zurück, das schon lief, bevor es diesen
     Zeiger gab — und nicht erst, wenn jemand neu ein Team wählt. */
  if(Z.team !== null && Z.team !== undefined) zeigerSchreiben(MODUS, Z.team);
}
function neuStarten(){
  try{ localStorage.removeItem(SPEICHER); }catch(e){}
  try{ localStorage.removeItem(ZEIGER); }catch(e){}
  /* Ohne die Adresse zurückzusetzen käme man über ?team= sofort wieder rein */
  try{ location.replace(location.pathname); }catch(e){ location.reload(); }
}

/* --- Töne (ohne Datei) ---------------------------------------------------- */
let AC=null;
function ton(art){
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    const noten = art==="gut" ? [660,880,1170] : art==="schlecht" ? [220,175] : [520];
    noten.forEach((f,i)=>{
      const o=AC.createOscillator(), g=AC.createGain();
      o.type="sine"; o.frequency.value=f;
      o.connect(g); g.connect(AC.destination);
      const t=AC.currentTime + i*0.09;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(0.16,t+0.02);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.28);
      o.start(t); o.stop(t+0.3);
    });
  }catch(e){}
}
function ruckeln(ms){ if(navigator.vibrate) try{navigator.vibrate(ms);}catch(e){} }

/* --- Der Alarm bei Sicherheitsstufe Rot ----------------------------------
   Zwei Töne im Wechsel, wie eine Sirene. Wird zum Schluss hin schneller —
   das treibt mehr als ein gleichmäßiges Piepsen. Läuft, bis alarmAus()
   gerufen wird; das passiert am Ende des Countdowns und beim Verlassen.
   ------------------------------------------------------------------------ */
let alarmUhr = null, alarmBis = 0;
function alarmTon(){
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state === "suspended") AC.resume();
    /* zwei Töne hintereinander: hoch, tief */
    [[950, 0], [700, 0.30]].forEach(([f, ab])=>{
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = "square";
      o.frequency.value = f;
      const filter = AC.createBiquadFilter();
      filter.type = "lowpass"; filter.frequency.value = 1800;
      o.connect(filter); filter.connect(g); g.connect(AC.destination);
      const t = AC.currentTime + ab;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.11, t + 0.03);
      g.gain.setValueAtTime(0.11, t + 0.24);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.29);
      o.start(t); o.stop(t + 0.31);
    });
  }catch(e){}
}
function alarmAn(sekunden){
  alarmAus();
  alarmBis = Date.now() + sekunden * 1000;
  const schlag = ()=>{
    const restMs = alarmBis - Date.now();
    if(restMs <= 0){ alarmAus(); return; }
    alarmTon();
    ruckeln([90, 60, 90]);
    /* die letzten 20 Sekunden doppelt so schnell */
    const abstand = restMs < 20000 ? 800 : 1500;
    alarmUhr = setTimeout(schlag, abstand);
  };
  schlag();
}
function alarmAus(){
  if(alarmUhr){ clearTimeout(alarmUhr); alarmUhr = null; }
  alarmBis = 0;
}
/* Wenn das Handy weggelegt oder die Seite gewechselt wird: Ruhe. */
document.addEventListener("visibilitychange", function(){
  if(document.hidden) alarmAus();
});

/* --- Hilfsfunktionen ----------------------------------------------------- */
function saeubern(s){
  return String(s||"").toUpperCase()
    .replace(/Ä/g,"AE").replace(/Ö/g,"OE").replace(/Ü/g,"UE").replace(/ß/g,"SS")
    .replace(/[^A-Z0-9]/g,"");
}
function stimmt(eingabe, soll, auch){
  const liste = [soll].concat(auch||[]);
  const ist = saeubern(eingabe);
  if(!ist) return false;
  return liste.some(a => saeubern(a) === ist);
}
function zeitText(){
  if(!Z.start) return "0:00";
  const s = Math.floor((Date.now()-Z.start)/1000);
  return Math.floor(s/60) + ":" + String(s%60).padStart(2,"0");
}
function punkteFuer(i){
  const voll = SPIEL.punkteProStation;
  let p = voll;
  if(Z.tipps.indexOf(i)>-1) p -= SPIEL.abzugTipp;
  p -= (Z.fehler[i]||0) * SPIEL.abzugFehler;
  return Math.max(Math.round(voll*0.2), p);
}
/* Teamabhängiger Text: teamText ist eine Liste, einer je Team */
function fuerTeam(feld, ersatz){
  if(Array.isArray(feld) && Z.team !== null) return feld[Z.team % feld.length];
  return ersatz || "";
}

/* ==========================================================================
   KOPFZEILE
   ========================================================================== */
function kopfZeichnen(){
  const gesamt = BUCHSTABEN_STATIONEN.length;
  const geloest = Z.gesammelt.length;
  $("#kopfTeam").textContent = Z.team!==null ? SPIEL.teams[Z.team].name : SPIEL.titel;
  $("#kopfZahl").innerHTML   = '<b>'+Z.punkte+'</b> P &nbsp;·&nbsp; '+zeitText();
  const anteil = AKTIV.length>1 ? (Z.station/(AKTIV.length-1)*100) : 0;
  $("#balken i").style.width  = Math.min(100, anteil) + "%";
  $("#kopf").style.display    = Z.team!==null ? "flex" : "none";
  $("#balken").style.display  = Z.team!==null ? "block" : "none";
}
setInterval(()=>{ if(Z.team!==null && !Z.fertig) kopfZeichnen(); }, 1000);

/* ==========================================================================
   START UND TEAMWAHL
   ========================================================================== */
/* Wie lange die Jagd ungefähr dauert — wird ausgerechnet, nicht eingetippt.
   Sonst stimmt die Zahl nicht mehr, sobald eine Station dazukommt. */
const DAUER_JE_ART = { start:5, code:9, quiz:8, foto:11, duell:10, handyaus:8,
                       spiegel:8, stoppuhr:5, sprint:6, kennwort:7, anruf:8, finale:10 };
function geschaetzteMinuten(){
  const roh = AKTIV.reduce((n,s)=> n + (DAUER_JE_ART[s.typ] || 8), 0);
  return Math.round(roh / 5) * 5;
}

function zeigeStart(){
  const wieLang = "rund " + geschaetzteMinuten() + " Minuten";
  const festesTeam = TEAM_VORGABE !== null ? SPIEL.teams[TEAM_VORGABE].name : null;
  app().innerHTML = `
    <div class="start-logo">
      <div class="klein-label">Very Important People</div>
      <h1 class="gross">${SPIEL.titel}</h1>
      <p class="untertitel">${SPIEL.untertitel}</p>
    </div>
    <div class="strich"></div>
    <div class="karte">
      <p class="klein-label">Einladung</p>
      <p>Ihr steht vor der VIP-Lounge. Wer rein will, muss beweisen, dass er dazugehört.</p>
      <p>Unterwegs sammelt ihr <b>Buchstaben</b> — aber durcheinander. Am Ende müsst ihr
      selbst das Losungswort daraus legen. Und dann steht da noch jemand am Tor.</p>
      <p class="hinweis">${SPIEL.datum} · ${wieLang}</p>
    </div>
    ${festesTeam ? `<div class="gemeinsam" style="text-align:center">
        <b>Ihr seid ${festesTeam}</b>
        <span>Euer Code hat euch schon eingetragen.</span>
      </div>` : ""}
    <button class="knopf" id="los">${festesTeam ? "Los geht's" : "Team wählen"}</button>
    <p class="hinweis">Ein Handy pro Team reicht. Der Fortschritt wird gespeichert —
    auch wenn das Handy zwischendurch ausgeht.</p>`;
  $("#los").onclick = ()=>{
    ton("klick");
    if(TEAM_VORGABE !== null){
      Z.team  = TEAM_VORGABE;
      Z.start = Z.start || Date.now();
      zeigerSchreiben(MODUS, Z.team);
      ruckeln(30); sichern(); zeigeStation();
    }else{
      zeigeTeamwahl();
    }
  };
}

function zeigeTeamwahl(){
  app().innerHTML = `
    <div class="start-logo"><h1 class="gross" style="font-size:clamp(32px,11vw,52px)">Wer seid ihr?</h1></div>
    <p class="hinweis" style="margin-bottom:20px">Tippt euer Team an. Jedes Team nimmt ein eigenes Handy.</p>
    ${SPIEL.teams.map((t,i)=>`
      <button class="teamknopf" data-i="${i}"><span class="punkt"></span>${t.name}</button>`).join("")}
    <button class="knopf leise" id="zurueck" style="margin-top:14px">Zurück</button>`;
  document.querySelectorAll(".teamknopf").forEach(b=>{
    b.onclick = ()=>{
      Z.team = +b.dataset.i;
      Z.start = Z.start || Date.now();
      zeigerSchreiben(MODUS, Z.team);
      ton("gut"); ruckeln(30); sichern(); zeigeStation();
    };
  });
  $("#zurueck").onclick = zeigeStart;
}

/* ==========================================================================
   DIE STATIONEN
   ========================================================================== */
function zeigeStation(){
  kopfZeichnen();
  const i = Z.station;
  if(i >= AKTIV.length) return zeigeFinale();
  const st = AKTIV[i];
  window.scrollTo(0,0);
  const darf = darfZurueck();          /* vor dem Bauen fragen */
  if(st.typ !== "handyaus") alarmAus();
  stationBauen(st, i);
  videoVerdrahten();
  /* Der Zurueck-Knopf haengt unten dran — auf allen Stationsarten gleich */
  if(darf && !$("#einsZurueck")){
    const halter = document.createElement("div");
    halter.innerHTML = zurueckBlock();
    if(halter.firstElementChild) app().appendChild(halter.firstElementChild);
  }
}
/* Langsamer abspielen UND die Tonhöhe mitgehen lassen — das ergibt die tiefe,
   verzerrte Stimme, ohne dass Robert das Video schneiden muss.
   Ohne "preservesPitch = false" würde der Browser die Stimme künstlich auf der
   ursprünglichen Höhe halten, dann bringt das Verlangsamen nichts. */
function videoVerdrahten(){
  document.querySelectorAll("video[data-tempo]").forEach(v=>{
    const t = parseFloat(v.dataset.tempo);
    if(!t || t <= 0) return;
    try{
      v.preservesPitch = false;
      v.mozPreservesPitch = false;
      v.webkitPreservesPitch = false;
      v.playbackRate = t;
      /* Manche Browser setzen playbackRate beim Laden zurück */
      v.addEventListener("loadedmetadata", ()=>{ v.playbackRate = t; });
      v.addEventListener("play", ()=>{ v.playbackRate = t; });
    }catch(e){}
  });
}

function stationBauen(st, i){
  switch(st.typ){
    case "start":     return bauStart(st,i);
    case "code":      return bauCode(st,i);
    case "quiz":      return bauQuiz(st,i);
    case "foto":      return bauFoto(st,i);
    case "duell":     return bauDuell(st,i);
    case "handyaus":  return bauHandyAus(st,i);
    case "spiegel":   return bauSpiegel(st,i);
    case "stoppuhr":  return bauStoppuhr(st,i);
    case "sprint":    return bauSprint(st,i);
    case "kennwort":  return bauKennwort(st,i);
    case "anruf":     return bauAnruf(st,i);
    case "finale":    return zeigeFinale();
    default:          return bauCode(st,i);
  }
}

/* --- Eine Station zurueck ------------------------------------------------
   Nur fuer den Fall, dass jemand versehentlich zweimal auf Weiter tippt.
   Bewusst eng gehalten:
     - geht hoechstens EINE Station zurueck, nie weiter
     - gibt die Punkte der Station wieder ab, es gibt sie also nicht doppelt
     - nimmt auch die Buchstaben wieder weg, die sie gebracht hat
     - verschwindet, sobald an der neuen Station irgendetwas passiert ist
   Damit kann man einen Fehltipp reparieren, aber nicht durch die
   Loesungen blaettern.
   ------------------------------------------------------------------------ */
function darfZurueck(){
  const i = Z.station;
  if(i <= 0 || Z.fertig) return false;
  if(!Z.zuletzt || Z.zuletzt.station !== i-1) return false;
  const st = AKTIV[i];
  if(!st) return false;
  /* Stationen, die von selbst loslaufen, sind schon begonnen */
  if(st.typ === "handyaus" || st.typ === "finale") return false;
  /* An dieser Station wurde schon etwas gemacht */
  if(Z.tipps.indexOf(i) > -1) return false;
  if(Z.fehler[i]) return false;
  if((Z.haken[i] || []).length) return false;
  if(Z.haken["sprint"+i]) return false;
  if(Z.haken["uhr"+i]) return false;
  if(Z.quiz[i]) return false;
  return true;
}
/* Manche Stationen zeichnen sich beim Starten nicht neu — dann muss der
   Knopf von Hand weg, sonst steht er noch da, während die Uhr schon läuft. */
function zurueckKnopfWeg(){
  const k = $("#einsZurueck");
  if(k) k.remove();
}
function zurueckBlock(){
  if(!darfZurueck()) return "";
  return `<button class="knopf leise klein" id="einsZurueck">↩︎ Ups — eine Station zurück</button>`;
}
function eineZurueck(){
  if(!darfZurueck()) return;
  const z = Z.zuletzt;
  Z.punkte = Math.max(0, Z.punkte - (z.punkte || 0));
  for(let n = 0; n < (z.buchstaben || 0); n++) Z.gesammelt.pop();
  /* Der Sprint haengt an der Uhr — der Countdown muss neu gestartet werden */
  delete Z.haken["sprint" + z.station];
  Z.station = z.station;
  Z.zuletzt = null;
  sichern(); ton("klick"); ruckeln(20); zeigeStation();
}
/* Ein einziger Zuhoerer fuer alle Bildschirme — ueberlebt jedes Neuzeichnen */
document.addEventListener("click", function(e){
  const k = e.target && e.target.closest && e.target.closest("#einsZurueck");
  if(k){ e.preventDefault(); eineZurueck(); }
});

/* --- gemeinsame Bausteine ------------------------------------------------ */
function kopfBlock(st,i){
  const nr = BUCHSTABEN_STATIONEN.findIndex(o=>o.i===i);
  const zaehler = nr>=0
    ? "Buchstabe " + (nr+1) + " von " + BUCHSTABEN_STATIONEN.length
    : (st.typ==="start" ? "Willkommen" : "Station " + Z.station + " von " + (AKTIV.length-1));
  return `<p class="klein-label">${zaehler}</p><h2 class="mittel">${st.titel}</h2>`;
}
/* --- Text der Station in saubere Bloecke zerlegen ------------------------
   Alles wird zentriert — nur nummerierte Schritte nicht, die brauchen einen
   linken Rand, sonst franst die Wegbeschreibung aus und man verliert die
   Zeile. Aus "1. … 2. … 3. …" wird darum eine echte Liste.
   ------------------------------------------------------------------------ */
function textBlock(text){
  if(!text) return "";
  const zeilen = String(text).split("\n");
  let html = "", absatz = [], schritte = [];
  const absatzRaus = ()=>{
    if(absatz.length){ html += "<p>" + absatz.join("\n") + "</p>"; absatz = []; }
  };
  const schritteRaus = ()=>{
    if(schritte.length){
      html += '<ol class="schritte">' + schritte.map(z=>"<li>"+z+"</li>").join("") + "</ol>";
      schritte = [];
    }
  };
  zeilen.forEach(z=>{
    const t = z.trim();
    const m = t.match(/^(\d+)\.\s+(.*)$/);
    if(m){ absatzRaus(); schritte.push(m[2]); }
    else if(!t){ schritteRaus(); absatzRaus(); }
    else { schritteRaus(); absatz.push(t); }
  });
  schritteRaus(); absatzRaus();
  return html;
}

function ortBlock(st){
  const weg = st.weg || "";
  if(!st.ort && !weg) return "";
  return `<div class="ort"><span class="pin">📍</span><div>
      ${st.ort ? "<b>"+st.ort+"</b>" : ""}
      ${weg ? "<span>"+weg+"</span>" : ""}
    </div></div>`;
}
function gemeinsamBlock(st){
  if(!st.gemeinsam) return "";
  return `<div class="gemeinsam"><b>👥 Zusammen mit dem anderen Team</b>
    <span>${st.gemeinsamText || "Wartet aufeinander — diese Station macht ihr gemeinsam."}</span>
  </div>`;
}
function medienBlock(st){
  let h = "";
  if(st.foto)  h += `<img class="bild" src="${st.foto}" alt="Hinweisbild" onerror="this.style.display='none'">`;
  if(st.video) h += videoBlock(st.video, st.videoStoerung, st.videoTempo);
  return h;
}
function videoBlock(link, stoerung, tempo){
  /* stoerung:  true = normal, "stark" = kaum noch erkennbar
     tempo:     kleiner als 1 = langsamer und tiefere Stimme */
  const kl = stoerung ? (stoerung === "stark" ? " gestoert stark" : " gestoert") : "";
  const langsam = (tempo && tempo !== 1) ? ` data-tempo="${tempo}"` : "";
  const huelle = (inhalt)=> stoerung
    ? `<div class="videohuelle">${inhalt}<div class="scanlinien"></div>
       <div class="stoerband"></div>
       <div class="videoetikett">▲ Übertragung entschlüsselt · Signal schwach</div></div>`
    : inhalt;

  if(/\.(mp4|m4v|mov|webm)(\?|$)/i.test(link))
    return huelle(`<video class="bild${kl}" controls playsinline preload="metadata"${langsam}
              style="background:#000"><source src="${link}">
              Dein Browser kann dieses Video nicht abspielen.</video>`);
  const yt = String(link).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  if(yt) return huelle(`<div class="videobox${kl}"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}"
      allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
      allowfullscreen loading="lazy"></iframe></div>`);
  if(/^https?:\/\//.test(link))
    return `<a class="knopf" href="${link}" target="_blank" rel="noopener">▶︎ Video ansehen</a>
            <p class="hinweis">Das Video öffnet sich in einem neuen Fenster. Danach hierher zurück.</p>`;
  return "";
}
/* Der Tipp kann für jedes Team ein anderer sein — dafür teamTipp verwenden.
   Steht dort nichts, gilt der gemeinsame tipp. */
function tippText(st){
  return fuerTeam(st.teamTipp, st.tipp) || "";
}
function tippBlock(st,i){
  const t = tippText(st);
  if(!t) return "";
  if(Z.tipps.indexOf(i)>-1) return `<div class="meldung tipp">💡 ${t}</div>`;
  return `<button class="knopf leise" id="tippKnopf">Tipp holen (−${SPIEL.abzugTipp} Punkte)</button>`;
}
function tippVerdrahten(st,i){
  const k = $("#tippKnopf");
  if(k) k.onclick = ()=>{ Z.tipps.push(i); ton("klick"); sichern(); zeigeStation(); };
}
function fehlerMeldung(i){
  const n = Z.fehler[i]||0;
  if(!n) return "";
  return `<div class="meldung minus">Leider falsch. ${n===1?"Ein Versuch":n+" Versuche"} daneben —
    schaut nochmal genau hin.</div>`;
}
/* Eingabefeld samt Prüfung — wird von mehreren Stationsarten benutzt */
function eingabeBlock(st, platzhalter){
  return `<input class="eingabe" id="feld" placeholder="${platzhalter||"Antwort"}"
      inputmode="${st.eingabeArt==='zahl'?'numeric':'text'}"
      autocomplete="off" autocorrect="off" spellcheck="false">
    <button class="knopf" id="pruefen">Antwort prüfen</button>`;
}
function eingabeVerdrahten(i, soll, auch){
  const feld = $("#feld");
  if(!feld) return;
  const pruefen = ()=>{
    if(stimmt(feld.value, soll, auch)){
      ton("gut"); ruckeln(40); geschafft(i, punkteFuer(i));
    }else{
      Z.fehler[i] = (Z.fehler[i]||0)+1; sichern();
      ton("schlecht"); ruckeln([40,60,40]);
      feld.classList.add("falsch");
      setTimeout(()=>zeigeStation(), 500);
    }
  };
  $("#pruefen").onclick = pruefen;
  feld.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); pruefen(); }});
}

/* --- Typ: START ---------------------------------------------------------- */
function bauStart(st,i){
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${medienBlock(st)}
      ${textBlock(st.text)}
      ${(st.auftraege||[]).length ? `<ul class="liste">${st.auftraege.map((a,n)=>
        `<li data-n="${n}"><span class="box">✓</span>${a}</li>`).join("")}</ul>` : ""}
      ${st.merkkasten ? `<div class="merkkasten">${st.merkkasten}</div>` : ""}
      ${(st.regeln||[]).length ? `<div class="regeln"><b>Die Regeln</b>
        <ul>${st.regeln.map(r=>`<li>${r}</li>`).join("")}</ul></div>` : ""}
    </div>
    <button class="knopf" id="weiter">Los geht's</button>`;
  hakenVerdrahten(i);
  $("#weiter").onclick = ()=>{ ton("gut"); geschafft(i,0); };
}

/* --- Typ: CODE ----------------------------------------------------------- */
function bauCode(st,i){
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${gemeinsamBlock(st)}
      ${medienBlock(st)}
      ${textBlock(fuerTeam(st.teamText, st.text))}
      ${fehlerMeldung(i)}
      ${eingabeBlock(st)}
      ${tippBlock(st,i)}
    </div>`;
  tippVerdrahten(st,i);
  eingabeVerdrahten(i, st.antwort, st.antwortAuch);
}

/* --- Typ: SPIEGEL -------------------------------------------------------- */
function bauSpiegel(st,i){
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${textBlock(fuerTeam(st.teamText, st.text))}
      <div class="spiegelfeld">${st.spiegelText||""}</div>
      <p>${st.frage||"Was steht da?"}</p>
      ${fehlerMeldung(i)}
      ${eingabeBlock(st)}
      ${tippBlock(st,i)}
    </div>`;
  tippVerdrahten(st,i);
  eingabeVerdrahten(i, st.antwort, st.antwortAuch);
}

/* --- Typ: STOPPUHR ------------------------------------------------------- */
function bauStoppuhr(st,i){
  const ziel = st.sekunden || 30;
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${textBlock(st.text)}
      <div class="countdown" id="uhr" style="color:var(--akzent)">0,0</div>
      <button class="knopf" id="startstop">Start</button>
      <p class="hinweis">Nicht auf die Uhr schauen — die zeigt sowieso nichts an.</p>
    </div>`;
  let laeuft = false, ab = 0, t = null;
  const uhr = $("#uhr"), knopf = $("#startstop");
  knopf.onclick = ()=>{
    if(!laeuft){
      laeuft = true; ab = Date.now(); knopf.textContent = "Stopp";
      uhr.textContent = "läuft …"; uhr.classList.add("blind");
      Z.haken["uhr"+i] = 1; sichern(); zurueckKnopfWeg();
      ton("klick");
    }else{
      clearInterval(t);
      const gebraucht = (Date.now()-ab)/1000;
      const weg = Math.abs(gebraucht - ziel);
      const punkte = Math.max(20, Math.round(SPIEL.punkteProStation - weg*12));
      uhr.classList.remove("blind");
      uhr.textContent = gebraucht.toFixed(1).replace(".", ",") + " s";
      ton(weg < 3 ? "gut" : "schlecht"); ruckeln(40);
      const urteil = weg < 1 ? "Wahnsinn. Das war fast auf die Zehntelsekunde."
                   : weg < 3 ? "Sehr gut getroffen."
                   : weg < 6 ? "Ordentlich."
                   : "Da war jemand nervös.";
      setTimeout(()=> geschafft(i, punkte, urteil + " " + weg.toFixed(1).replace(".",",") + " Sekunden daneben."), 900);
    }
  };
}

/* --- Typ: SPRINT --------------------------------------------------------- */
function bauSprint(st,i){
  const dauer = st.sekunden || 180;
  const schonGelaufen = Z.haken["sprint"+i];
  if(!schonGelaufen){
    app().innerHTML = `
      <div class="karte">
        ${kopfBlock(st,i)}
        ${ortBlock(st)}
        ${textBlock(st.text)}
        <button class="knopf" id="losrennen">Countdown starten</button>
        <p class="hinweis">Erst tippen, wenn wirklich alle bereit sind.</p>
      </div>`;
    $("#losrennen").onclick = ()=>{
      Z.haken["sprint"+i] = Date.now(); sichern(); ton("klick"); bauSprint(st,i);
    };
    return;
  }
  const rest = Math.max(0, Math.round(dauer - (Date.now()-schonGelaufen)/1000));
  app().innerHTML = `
    <div class="karte ${rest>0?"alarm":""}">
      ${kopfBlock(st,i)}
      <div class="countdown" id="uhr">${Math.floor(rest/60)}:${String(rest%60).padStart(2,"0")}</div>
      <p class="zentriert">${rest>0 ? "Los, los, los!" : "Zeit ist um."}</p>
      <ul class="liste">${(st.auftraege||["Wir waren rechtzeitig dort"]).map((a,n)=>
        `<li class="${(Z.haken[i]||[]).indexOf(n)>-1?'an':''}" data-n="${n}"><span class="box">✓</span>${a}</li>`
        ).join("")}</ul>
      <button class="knopf" id="weiter">Weiter</button>
    </div>`;
  hakenVerdrahten(i);
  let t = setInterval(()=>{
    const r = Math.max(0, Math.round(dauer - (Date.now()-schonGelaufen)/1000));
    const u = $("#uhr");
    if(!u){ clearInterval(t); return; }
    u.textContent = Math.floor(r/60)+":"+String(r%60).padStart(2,"0");
    if(r<=0){ clearInterval(t); u.closest(".karte").classList.remove("alarm"); }
  },1000);
  $("#weiter").onclick = ()=>{
    const r = dauer - (Date.now()-schonGelaufen)/1000;
    const geschafftInZeit = (Z.haken[i]||[]).length>0 && r>0;
    clearInterval(t); ton(geschafftInZeit?"gut":"klick");
    geschafft(i, geschafftInZeit ? punkteFuer(i)+50 : Math.round(SPIEL.punkteProStation*0.3),
              geschafftInZeit ? "Rechtzeitig da: +50 Bonus" : "Knapp nicht geschafft — geht trotzdem weiter.");
  };
}

/* --- Typ: QUIZ ----------------------------------------------------------- */
function bauQuiz(st,i){
  const stand = Z.quiz[i] || {nr:0, richtig:0};
  Z.quiz[i] = stand;
  if(stand.nr >= st.fragen.length){
    const anteil = stand.richtig / st.fragen.length;
    const p = Math.max(Math.round(SPIEL.punkteProStation*0.2),
                       Math.round(SPIEL.punkteProStation*anteil));
    return geschafft(i, p, `${stand.richtig} von ${st.fragen.length} richtig`);
  }
  const f = st.fragen[stand.nr];
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${stand.nr===0 ? ortBlock(st)+`${textBlock(st.text)}` : ""}
      <p class="quizzaehler">Frage ${stand.nr+1} von ${st.fragen.length} · ${stand.richtig} richtig</p>
      <p class="frage">${f.frage}</p>
      ${f.optionen.map((o,n)=>`<button class="antwortknopf" data-n="${n}">${o}</button>`).join("")}
    </div>`;
  document.querySelectorAll(".antwortknopf").forEach(b=>{
    b.onclick = ()=>{
      const n = +b.dataset.n;
      document.querySelectorAll(".antwortknopf").forEach(x=>x.disabled=true);
      if(n===f.richtig){ b.classList.add("richtig"); stand.richtig++; ton("gut"); ruckeln(30); }
      else{
        b.classList.add("falsch"); ton("schlecht"); ruckeln([40,60,40]);
        document.querySelectorAll(".antwortknopf")[f.richtig].classList.add("richtig");
      }
      stand.nr++; sichern();
      setTimeout(()=>zeigeStation(), 950);
    };
  });
}

/* --- Typ: FOTO (Abhak-Liste) --------------------------------------------- */
function bauFoto(st,i){
  const noetig = st.mindestens || (st.auftraege||[]).length;
  const an = (Z.haken[i]||[]).length;
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${gemeinsamBlock(st)}
      ${medienBlock(st)}
      ${textBlock(fuerTeam(st.teamText, st.text))}
      <ul class="liste">${(st.auftraege||[]).map((a,n)=>
        `<li class="${(Z.haken[i]||[]).indexOf(n)>-1?'an':''}" data-n="${n}"><span class="box">✓</span>${a}</li>`
        ).join("")}</ul>
      <button class="knopf" id="weiter" ${an<noetig?"disabled":""}>
        ${an<noetig ? (noetig-an===1 ? "Noch 1 Auftrag fehlt" : "Noch "+(noetig-an)+" Aufträge fehlen") : "Fertig — weiter"}</button>
      <p class="hinweis">Mindestens ${noetig} von ${(st.auftraege||[]).length} müssen erledigt sein.</p>
    </div>`;
  hakenVerdrahten(i);
  const w = $("#weiter");
  if(w && !w.disabled) w.onclick = ()=>{
    const voll = (Z.haken[i]||[]).length === (st.auftraege||[]).length;
    ton("gut"); geschafft(i, punkteFuer(i) + (voll?25:0), voll?"Alle Aufträge erledigt: +25 Bonus":"");
  };
}
function hakenVerdrahten(i){
  document.querySelectorAll(".liste li").forEach(li=>{
    li.onclick = ()=>{
      const n = +li.dataset.n;
      Z.haken[i] = Z.haken[i]||[];
      const p = Z.haken[i].indexOf(n);
      if(p>-1) Z.haken[i].splice(p,1); else { Z.haken[i].push(n); ton("klick"); ruckeln(20); }
      sichern();
      const st = AKTIV[i];
      if(st && (st.typ==="foto")) zeigeStation(); else li.classList.toggle("an");
    };
  });
}

/* --- Typ: DUELL ---------------------------------------------------------- */
function bauDuell(st,i){
  const meins = SPIEL.teams[Z.team].geheimwort;
  const raetsel = fuerTeam(st.teamRaetsel, "");
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${gemeinsamBlock(st)}
      ${textBlock((fuerTeam(st.teamText, st.text)||"").replace("DAS RÄTSEL STEHT UNTEN", ""))}
      ${(st.ablauf||[]).length ? `<ol class="schritte">${
        st.ablauf.map(a=>`<li>${a}</li>`).join("")}</ol>
        ${st.ablaufHinweis ? `<p class="hinweis">${st.ablaufHinweis}</p>` : ""}` : ""}
      ${raetsel ? `<div class="emojis">${raetsel}</div>
        <p class="hinweis">Das ist euer Rätsel. Zeigt es dem anderen Team —
        <b>nicht</b> die Lösung verraten.</p>` : ""}
      ${fehlerMeldung(i)}
      <input class="eingabe" id="feld" placeholder="Geheimwort" autocomplete="off"
        autocorrect="off" spellcheck="false">
      <button class="knopf" id="pruefen">Eintragen</button>
      ${tippBlock(st,i)}
      <div class="geheim zu" id="geheimkasten">
        <b>Euer eigenes Geheimwort</b>
        <span class="verdeckt" id="geheimwort">${meins}</span>
        <button class="knopf leise klein" id="geheimAuf">👁 Antippen zum Anzeigen</button>
      </div>
      <p class="hinweis">Erst aufdecken, wenn ihr es wirklich verraten wollt —
      und dann das Handy <b>nicht</b> herumzeigen. Vorlesen reicht.</p>
      ${st.streitText ? `<button class="knopf leise klein" id="streit">🕴 Türsteher rufen</button>
        <div class="meldung schiri" id="schiri" hidden>${st.streitText}</div>` : ""}
    </div>`;
  /* Das Geheimwort bleibt verdeckt, bis es jemand absichtlich aufdeckt.
     Sonst liest das andere Team es im Vorbeigehen vom Bildschirm ab. */
  const geheimKnopf = $("#geheimAuf");
  if(geheimKnopf) geheimKnopf.onclick = ()=>{
    const kasten = $("#geheimkasten"), wort = $("#geheimwort");
    const offen = kasten.classList.toggle("auf");
    kasten.classList.toggle("zu", !offen);
    wort.classList.toggle("verdeckt", !offen);
    geheimKnopf.textContent = offen ? "🙈 Wieder verstecken" : "👁 Antippen zum Anzeigen";
    ton("klick"); ruckeln(15);
  };

  const streitKnopf = $("#streit");
  if(streitKnopf) streitKnopf.onclick = ()=>{
    const kasten = $("#schiri");
    if(kasten){ kasten.hidden = false; ton("klick"); ruckeln(20);
                kasten.scrollIntoView({behavior:"smooth", block:"nearest"}); }
    streitKnopf.hidden = true;
  };
  tippVerdrahten(st,i);
  const feld = $("#feld");
  const pruefen = ()=>{
    const ist = saeubern(feld.value);
    const treffer = SPIEL.teams.some((t,n)=> n!==Z.team && saeubern(t.geheimwort)===ist);
    if(treffer){ ton("gut"); ruckeln(40); geschafft(i, punkteFuer(i)); }
    else{
      Z.fehler[i]=(Z.fehler[i]||0)+1; sichern();
      ton("schlecht"); ruckeln([40,60,40]); feld.classList.add("falsch");
      setTimeout(()=>zeigeStation(), 500);
    }
  };
  $("#pruefen").onclick = pruefen;
  feld.addEventListener("keydown", e=>{ if(e.key==="Enter"){ e.preventDefault(); pruefen(); }});
}

/* --- Typ: HANDYAUS (der Gag) --------------------------------------------- */
function bauHandyAus(st,i){
  if(Z.handyausAb) return handyAusDanke(st,i);
  Z.handyausAb = Date.now(); sichern();
  const dauer = st.sekunden || 120;
  app().innerHTML = `
    <div class="karte alarm">
      <div class="alarmzeichen">⚠️</div>
      <p class="klein-label" style="color:#ff6b62;text-align:center">VIP-Server · Systemmeldung</p>
      <h2 class="mittel zentriert" style="color:#ff6b62">${st.titel}</h2>
      ${textBlock(st.text)}
      <div class="countdown" id="uhr">${dauer}</div>
      <p class="hinweis">Der Server prüft die Verbindung.</p>
    </div>`;
  ton("schlecht"); ruckeln([200,100,200,100,400]);
  if(st.alarmTon !== false) alarmAn(dauer);
  let rest = dauer;
  const t = setInterval(()=>{
    rest--;
    const u = $("#uhr");
    if(!u){ clearInterval(t); return; }
    u.textContent = rest;
    if(rest<=0){ clearInterval(t); handyAusDanke(st,i); }
  },1000);
}
function handyAusDanke(st,i){
  alarmAus();
  app().innerHTML = `
    <div class="karte">
      <div class="erfolg" style="padding-top:8px">
        <div class="haken">🔒</div>
        <p class="klein-label">Verbindung wiederhergestellt</p>
      </div>
      <p>${st.dankeText||"Danke, dass ihr eure Handys neu gestartet habt. Wir machen weiter."}</p>
    </div>
    <button class="knopf" id="weiter">Weiter</button>`;
  ton("gut"); ruckeln(50);
  $("#weiter").onclick = ()=> geschafft(i, punkteFuer(i));
}

/* --- Typ: KENNWORT (zwei Verstecke, je eine Hälfte) ---------------------- */
function bauKennwort(st,i){
  /* Die eigene Hälfte steht bewusst NICHT auf dem Bildschirm — sonst müsste
     man sie draußen gar nicht suchen. Sie steht nur auf dem Holzstecken. */
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${textBlock(fuerTeam(st.teamText, st.text))}
      <div class="strich"></div>
      <p>${st.frage||"Tippt das ganze Kennwort ein."}</p>
      ${fehlerMeldung(i)}
      ${eingabeBlock(st, "Kennwort")}
      ${tippBlock(st,i)}
    </div>`;
  tippVerdrahten(st,i);
  eingabeVerdrahten(i, SPIEL.kennwortTeil1 + SPIEL.kennwortTeil2,
                       [SPIEL.kennwortTeil2 + SPIEL.kennwortTeil1]);
}

/* --- Typ: ANRUF ---------------------------------------------------------- */
function bauAnruf(st,i){
  const nr = SPIEL.telefonnummer || "";
  const waehlbar = /^[\d +\/().-]+$/.test(nr);
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${gemeinsamBlock(st)}
      ${textBlock(fuerTeam(st.teamText, st.text))}
      <div class="telefon">
        <b>Der Empfang</b>
        ${waehlbar
          ? `<a class="knopf" href="tel:${nr.replace(/[^\d+]/g,"")}">📞 ${nr} anrufen</a>`
          : `<span class="nummer">${nr}</span>`}
      </div>
      <p class="hinweis">Sagt beide Wörter des Kennworts, deutlich und in der richtigen
      Reihenfolge. Wer nuschelt, wird nicht durchgestellt.</p>
      <div class="strich"></div>
      <p>${st.frage||"Wie lautet der Zutrittscode?"}</p>
      ${fehlerMeldung(i)}
      ${eingabeBlock(st, "Zutrittscode")}
      ${tippBlock(st,i)}
    </div>`;
  tippVerdrahten(st,i);
  eingabeVerdrahten(i, SPIEL.anrufCode, SPIEL.anrufCodeAuch);
}

/* ==========================================================================
   ERFOLGS-BILDSCHIRM
   ========================================================================== */
function geschafft(i, punkte, zusatz){
  const st = AKTIV[i];
  Z.punkte += punkte;
  const neue = BUCHSTABEN_JE_STATION[i] || [];
  let dazu = 0;
  neue.forEach(b => {
    if(Z.gesammelt.length < SPIEL.loesungswort.length){ Z.gesammelt.push(b); dazu++; }
  });
  Z.station = i+1;
  /* Fuer den Zurueck-Knopf merken, was diese Station gebracht hat */
  Z.zuletzt = { station:i, punkte:punkte, buchstaben:dazu };
  sichern(); kopfZeichnen();

  if(!neue.length && st.typ==="start") return zeigeStation();

  window.scrollTo(0,0);
  app().innerHTML = `
    <div class="karte">
      <div class="erfolg">
        <div class="haken">✓</div>
        <p class="klein-label">Station geschafft</p>
        <p class="punkte">+${punkte}<small>Punkte</small></p>
        ${zusatz?`<p class="hinweis">${zusatz}</p>`:""}
      </div>
      ${neue.length ? `<div class="strich"></div>
        <p class="klein-label zentriert">${neue.length>1?"Eure Buchstaben":"Euer Buchstabe"}</p>
        ${sammlungHTML()}
        <p class="hinweis">Sie kommen durcheinander. Am Ende müsst ihr sie richtig ordnen.</p>` : ""}
    </div>
    <button class="knopf" id="weiter">Weiter</button>`;
  ton("gut"); ruckeln([30,50,30]);
  $("#weiter").onclick = ()=>{ ton("klick"); zeigeStation(); };
}
function sammlungHTML(){
  const gesamt = SPIEL.loesungswort.length;
  let h = "";
  for(let n=0; n<gesamt; n++){
    const hat = n < Z.gesammelt.length;
    h += `<span class="${hat?'hat':''}">${hat?Z.gesammelt[n]:"?"}</span>`;
  }
  return `<div class="sammlung">${h}</div>`;
}

/* ==========================================================================
   FINALE — die Buchstaben zum Losungswort legen
   ========================================================================== */
function zeigeFinale(){
  const st = AKTIV[AKTIV.length-1] || {};
  const wort = (SPIEL.loesungswort||"").toUpperCase();

  /* Schon gelöst? Dann direkt der Türsteher-Bildschirm */
  if(Z.fertig) return zeigeTuersteher(st);

  Z.gelegt = Z.gelegt || [];
  window.scrollTo(0,0);

  const offen = Z.gesammelt.map((b,n)=>({b,n})).filter(o=>Z.gelegt.indexOf(o.n)===-1);

  app().innerHTML = `
    <div class="karte">
      <p class="klein-label">Letzte Hürde</p>
      <h2 class="mittel">${st.titel||"Die VIP-Lounge"}</h2>
      ${ortBlock(st)}
      ${textBlock(st.text)}

      <div class="legezeile" id="zeile">
        ${Array.from({length: wort.length}, (_,k)=>{
          const q = Z.gelegt[k];
          return `<span class="platz ${q!==undefined?'voll':''}" data-k="${k}">${
            q!==undefined ? Z.gesammelt[q] : ""}</span>`;
        }).join("")}
      </div>

      <p class="klein-label zentriert" style="margin-top:18px">Eure Buchstaben</p>
      <div class="kacheln" id="kacheln">
        ${offen.map(o=>`<button class="kachel" data-n="${o.n}">${o.b}</button>`).join("")}
      </div>

      <button class="knopf" id="pruefen" ${Z.gelegt.length<wort.length?"disabled":""}>
        ${Z.gelegt.length<wort.length ? (wort.length-Z.gelegt.length)+" Buchstaben fehlen noch" : "Code prüfen"}</button>
      <button class="knopf leise" id="zurueckstellen">Alles zurücklegen</button>
    </div>`;

  /* Kachel antippen → auf den nächsten freien Platz */
  document.querySelectorAll(".kachel").forEach(k=>{
    k.onclick = ()=>{
      if(Z.gelegt.length >= wort.length) return;
      Z.gelegt.push(+k.dataset.n);
      ton("klick"); ruckeln(15); sichern(); zeigeFinale();
    };
  });
  /* Platz in der Zeile antippen → Buchstabe zurück */
  document.querySelectorAll(".platz.voll").forEach(p=>{
    p.onclick = ()=>{
      const k = +p.dataset.k;
      if(k < Z.gelegt.length){ Z.gelegt.splice(k,1); ton("klick"); sichern(); zeigeFinale(); }
    };
  });
  $("#zurueckstellen").onclick = ()=>{ Z.gelegt = []; ton("klick"); sichern(); zeigeFinale(); };

  const pk = $("#pruefen");
  if(pk && !pk.disabled) pk.onclick = ()=>{
    const versuch = Z.gelegt.map(n=>Z.gesammelt[n]).join("");
    if(versuch === wort){
      document.querySelectorAll(".platz").forEach(p=>p.classList.add("richtig"));
      ton("gut"); setTimeout(()=>ton("gut"),260); ruckeln([60,80,60,80,200]);
      Z.fertig = true; Z.punkte += 100; sichern();
      konfetti();
      setTimeout(()=>zeigeTuersteher(st), 1400);
    }else{
      document.querySelectorAll(".platz").forEach(p=>p.classList.add("falschrot"));
      ton("schlecht"); ruckeln([60,80,60]);
      Z.punkte = Math.max(0, Z.punkte - 10); sichern();
      setTimeout(()=>{ Z.gelegt = []; sichern(); zeigeFinale(); }, 900);
    }
  };
}

/* --- Der Türsteher wartet ------------------------------------------------ */
function zeigeTuersteher(st){
  const wort = (SPIEL.loesungswort||"").toUpperCase();
  const min  = Z.start ? Math.round((Date.now()-Z.start)/60000) : 0;
  window.scrollTo(0,0);
  app().innerHTML = `
    <div class="start-logo">
      <div class="klein-label">Zutritt gewährt</div>
      <h1 class="gross" style="font-size:clamp(34px,12vw,58px)">${wort}</h1>
    </div>
    <div class="karte">
      <p>${st.danachText||""}</p>
      <div class="strich"></div>
      <div class="erfolg" style="padding:10px 0 0">
        <p class="punkte">${Z.punkte}<small>Punkte · ${min} Minuten</small></p>
      </div>
    </div>
    <p class="hinweis">Zeigt diesen Bildschirm dem Türsteher — und sagt das Wort laut auf.</p>`;
  kopfZeichnen();
}

/* --- Konfetti ------------------------------------------------------------ */
function konfetti(){
  const c = document.createElement("canvas"); c.id="konfetti";
  document.body.appendChild(c);
  const x = c.getContext("2d");
  const gr = ()=>{ c.width=innerWidth; c.height=innerHeight; };
  gr(); addEventListener("resize",gr);
  const farben = document.body.classList.contains("silber")
    ? ["#ffffff","#c8ccd2","#8d9199","#e9edf2"]
    : ["#f7e9a8","#d4af37","#8c6d1f","#fff6d0"];
  const teile = Array.from({length:110},()=>({
    x:Math.random()*c.width, y:-20-Math.random()*c.height,
    b:5+Math.random()*7, h:8+Math.random()*10,
    v:1.6+Math.random()*3.2, d:Math.random()*Math.PI*2,
    s:(Math.random()-0.5)*0.16, f:farben[(Math.random()*farben.length)|0]
  }));
  let ende = Date.now()+7000;
  (function mal(){
    x.clearRect(0,0,c.width,c.height);
    teile.forEach(t=>{
      t.y += t.v; t.d += t.s; t.x += Math.sin(t.d)*1.1;
      if(t.y > c.height+30){ t.y=-20; t.x=Math.random()*c.width; }
      x.save(); x.translate(t.x,t.y); x.rotate(t.d);
      x.fillStyle=t.f; x.globalAlpha=.9;
      x.fillRect(-t.b/2,-t.h/2,t.b,t.h); x.restore();
    });
    if(Date.now()<ende) requestAnimationFrame(mal);
    else c.remove();
  })();
}

/* ==========================================================================
   SPIELLEITER — Krone oben links 3x antippen
   ========================================================================== */
let kronenKlicks=0, kronenUhr=null;
function kroneGetippt(){
  kronenKlicks++;
  clearTimeout(kronenUhr);
  kronenUhr = setTimeout(()=>kronenKlicks=0, 1200);
  if(kronenKlicks>=3){ kronenKlicks=0; leiterFragen(); }
}
function leiterFragen(){
  const p = prompt("Spielleiter-Code:");
  if(p===null) return;
  if(saeubern(p)===saeubern(SPIEL.leiterCode)) zeigeLeiter();
  else alert("Falscher Code.");
}
function zeigeLeiter(){
  const zeilen = AKTIV.map((s,i)=>{
    let loesung = "—";
    if(s.typ==="code" || s.typ==="spiegel") loesung = s.antwort;
    if(s.typ==="duell")    loesung = "Geheimwort eines anderen Teams";
    if(s.typ==="quiz")     loesung = s.fragen.map(f=>f.optionen[f.richtig]).join(" · ");
    if(s.typ==="foto")     loesung = "mind. "+(s.mindestens||"alle")+" abhaken";
    if(s.typ==="handyaus") loesung = "Fake — läuft nach "+(s.sekunden||120)+" Sek. weiter";
    if(s.typ==="stoppuhr") loesung = "Schätzung, keine feste Lösung";
    if(s.typ==="sprint")   loesung = "Countdown "+(s.sekunden||180)+" Sek.";
    if(s.typ==="kennwort") loesung = SPIEL.kennwortTeil1+" + "+SPIEL.kennwortTeil2;
    if(s.typ==="anruf")    loesung = "Code am Telefon: "+SPIEL.anrufCode;
    if(s.typ==="finale")   loesung = SPIEL.loesungswort;
    const b = (BUCHSTABEN_JE_STATION[i]||[]).join("");
    return `<tr><td>${i}. ${s.titel}${b?" ("+b+")":""}</td><td>${loesung}</td></tr>`;
  }).join("");
  app().innerHTML = `
    <div class="karte leiter">
      <h3>Spielleiter · Modus ${MODUS}</h3>
      <table>${zeilen}</table>
    </div>
    <div class="karte leiter">
      <h3>Notfall</h3>
      <button class="knopf leise" id="skip">Diese Station überspringen</button>
      <button class="knopf leise" id="zurueck2">Eine Station zurück</button>
      <button class="knopf leise" id="reset">Spiel komplett neu starten</button>
    </div>
    <button class="knopf" id="raus">Zurück ins Spiel</button>`;
  $("#skip").onclick = ()=>{
    const i = Z.station;
    (BUCHSTABEN_JE_STATION[i]||[]).forEach(b=>{
      if(Z.gesammelt.length < SPIEL.loesungswort.length) Z.gesammelt.push(b);
    });
    Z.station = Math.min(i+1, AKTIV.length);
    sichern(); zeigeStation();
  };
  $("#zurueck2").onclick = ()=>{ Z.station=Math.max(0,Z.station-1); sichern(); zeigeStation(); };
  $("#reset").onclick = ()=>{ if(confirm("Wirklich alles löschen und neu anfangen?")) neuStarten(); };
  $("#raus").onclick = zeigeStation;
}

/* ==========================================================================
   START
   ========================================================================== */
function los(){
  if(SPIEL.farbe === "silber") document.body.classList.add("silber");
  document.title = SPIEL.titel + " — " + SPIEL.untertitel;
  $("#kopfKrone").onclick = kroneGetippt;
  laden();
  if(Z.team===null) zeigeStart();
  else zeigeStation();
  kopfZeichnen();
}
document.addEventListener("DOMContentLoaded", los);
})();
