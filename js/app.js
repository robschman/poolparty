/* ==========================================================================
   VIP-SCHNITZELJAGD — die Spiel-Logik
   Hier musst du normalerweise NICHTS aendern. Alles Inhaltliche steht
   in  stationen.js .
   ========================================================================== */
(function(){
"use strict";

/* --- Kurzbefehle --------------------------------------------------------- */
const $   = (s)=>document.querySelector(s);
const app = ()=>$("#app");
const SPEICHER = "vip_jagd_v" + (SPIEL.version || "1");

/* --- Spielstand ---------------------------------------------------------- */
let Z = {
  team:null, station:0, punkte:0, start:null,
  buchstaben:[], tipps:[], fehler:{}, haken:{}, quiz:{},
  handyausAb:null, fertig:false
};
function laden(){
  try{ const d = localStorage.getItem(SPEICHER); if(d) Z = Object.assign(Z, JSON.parse(d)); }catch(e){}
}
function sichern(){
  try{ localStorage.setItem(SPEICHER, JSON.stringify(Z)); }catch(e){}
}
function neuStarten(){
  try{ localStorage.removeItem(SPEICHER); }catch(e){}
  location.reload();
}

/* --- Toene (leise, ohne Datei) ------------------------------------------- */
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

/* --- Hilfsfunktionen ----------------------------------------------------- */
function saeubern(s){
  return String(s||"").toUpperCase()
    .replace(/Ä/g,"AE").replace(/Ö/g,"OE").replace(/Ü/g,"UE").replace(/ß/g,"SS")
    .replace(/[^A-Z0-9]/g,"");
}
function stimmt(eingabe, station){
  const soll = [station.antwort].concat(station.antwortAuch||[]);
  const ist  = saeubern(eingabe);
  if(!ist) return false;
  return soll.some(a=>saeubern(a)===ist);
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
/* alle Stationen, die einen Buchstaben vergeben — in Reihenfolge */
const BUCHSTABEN_STATIONEN = STATIONEN.map((s,i)=>({s,i})).filter(o=>o.s.buchstabe);

/* ==========================================================================
   KOPFZEILE + FORTSCHRITT
   ========================================================================== */
function kopfZeichnen(){
  const geloest = Z.buchstaben.length;
  const gesamt  = BUCHSTABEN_STATIONEN.length;
  $("#kopfTeam").textContent = Z.team!==null ? SPIEL.teams[Z.team].name : SPIEL.titel;
  $("#kopfZahl").innerHTML   = '<b>'+Z.punkte+'</b> P &nbsp;·&nbsp; '+zeitText();
  $("#balken i").style.width = (gesamt? (geloest/gesamt*100):0) + "%";
  $("#kopf").style.display   = Z.team!==null ? "flex" : "none";
  $("#balken").style.display = Z.team!==null ? "block" : "none";
}
setInterval(()=>{ if(Z.team!==null && !Z.fertig) kopfZeichnen(); }, 1000);

/* ==========================================================================
   BILDSCHIRM 1 — START
   ========================================================================== */
function zeigeStart(){
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
      <p><b>${BUCHSTABEN_STATIONEN.length} Stationen</b> liegen vor euch, ungefähr <b>${SPIEL.dauerMinuten} Minuten</b>.
      Bei jeder Station gibt es einen Buchstaben. Alle zusammen ergeben das Losungswort für den Türsteher.</p>
      <p class="hinweis">${SPIEL.datum}</p>
    </div>
    <button class="knopf" id="los">Team wählen</button>
    <p class="hinweis">Ein Handy pro Team reicht. Der Fortschritt wird gespeichert —
    auch wenn das Handy zwischendurch ausgeht.</p>`;
  $("#los").onclick = ()=>{ ton("klick"); zeigeTeamwahl(); };
}

/* ==========================================================================
   BILDSCHIRM 2 — TEAMWAHL
   ========================================================================== */
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
      ton("gut"); ruckeln(30); sichern(); zeigeStation();
    };
  });
  $("#zurueck").onclick = zeigeStart;
}

/* ==========================================================================
   BILDSCHIRM 3 — DIE STATIONEN
   ========================================================================== */
function zeigeStation(){
  kopfZeichnen();
  const i = Z.station;
  if(i >= STATIONEN.length){ return zeigeFinale(); }
  const st = STATIONEN[i];
  window.scrollTo(0,0);

  switch(st.typ){
    case "start":    return bauStart(st,i);
    case "code":     return bauCode(st,i);
    case "quiz":     return bauQuiz(st,i);
    case "foto":     return bauFoto(st,i);
    case "duell":    return bauDuell(st,i);
    case "handyaus": return bauHandyAus(st,i);
    case "finale":   return zeigeFinale();
    default:         return bauCode(st,i);
  }
}

/* --- gemeinsame Bausteine ------------------------------------------------ */
function kopfBlock(st,i){
  const nr = BUCHSTABEN_STATIONEN.findIndex(o=>o.i===i);
  return `
    <p class="klein-label">${nr>=0 ? "Station "+(nr+1)+" von "+BUCHSTABEN_STATIONEN.length : "Willkommen"}</p>
    <h2 class="mittel">${st.titel}</h2>`;
}
function ortBlock(st){
  if(!st.ort && !st.weg) return "";
  return `<div class="ort"><span class="pin">📍</span><div>
      ${st.ort ? "<b>"+st.ort+"</b>" : ""}
      ${st.weg ? "<span>"+st.weg+"</span>" : ""}
    </div></div>`;
}
function medienBlock(st){
  let h = "";
  if(st.foto)  h += `<img class="bild" src="${st.foto}" alt="Hinweisbild" onerror="this.style.display='none'">`;
  if(st.video) h += videoBlock(st.video);
  return h;
}
function videoBlock(link){
  /* 1. Eigene Videodatei auf dem Server — z. B. "fotos/botschaft.mp4" */
  if(/\.(mp4|m4v|mov|webm)(\?|$)/i.test(link))
    return `<video class="bild" controls playsinline preload="metadata"
              style="background:#000">
              <source src="${link}">
              Dein Browser kann dieses Video nicht abspielen.
            </video>`;
  /* 2. YouTube — läuft direkt in der App */
  const yt = String(link).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/);
  if(yt) return `<div class="videobox"><iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}"
      allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture"
      allowfullscreen loading="lazy"></iframe></div>`;
  /* 3. Alles andere (z. B. TikTok) — Knopf, der es außerhalb öffnet */
  if(/^https?:\/\//.test(link))
    return `<a class="knopf" href="${link}" target="_blank" rel="noopener">▶︎ Video ansehen</a>
            <p class="hinweis">Das Video öffnet sich in einem neuen Fenster. Danach hierher zurück.</p>`;
  return "";
}
function tippBlock(st,i){
  if(!st.tipp) return "";
  if(Z.tipps.indexOf(i)>-1)
    return `<div class="meldung tipp">💡 ${st.tipp}</div>`;
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

/* --- Typ: START ---------------------------------------------------------- */
function bauStart(st,i){
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${medienBlock(st)}
      <p>${st.text||""}</p>
      ${(st.auftraege||[]).length ? `<ul class="liste">${st.auftraege.map((a,n)=>
        `<li data-n="${n}"><span class="box">✓</span>${a}</li>`).join("")}</ul>` : ""}
      ${(st.regeln||[]).length ? `<div class="regeln">
        <b>Die Regeln</b>
        <ul>${st.regeln.map(r=>`<li>${r}</li>`).join("")}</ul>
      </div>` : ""}
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
      ${medienBlock(st)}
      <p>${st.text||""}</p>
      ${fehlerMeldung(i)}
      <input class="eingabe" id="feld" placeholder="Antwort"
        inputmode="${st.eingabeArt==='zahl'?'numeric':'text'}"
        autocomplete="off" autocorrect="off" spellcheck="false">
      <button class="knopf" id="pruefen">Antwort prüfen</button>
      ${tippBlock(st,i)}
    </div>`;
  tippVerdrahten(st,i);
  const feld = $("#feld");
  const pruefen = ()=>{
    if(stimmt(feld.value, st)){
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
      ${stand.nr===0 ? ortBlock(st)+`<p>${st.text||""}</p>` : ""}
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
      ${medienBlock(st)}
      <p>${st.text||""}</p>
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
      const st = STATIONEN[i];
      if(st.typ==="foto") zeigeStation(); else li.classList.toggle("an");
    };
  });
}

/* --- Typ: DUELL (Geheimwort eines anderen Teams) -------------------------- */
function bauDuell(st,i){
  const meins = SPIEL.teams[Z.team].geheimwort;
  app().innerHTML = `
    <div class="karte">
      ${kopfBlock(st,i)}
      ${ortBlock(st)}
      ${medienBlock(st)}
      <p>${st.text||""}</p>
      ${fehlerMeldung(i)}
      <input class="eingabe" id="feld" placeholder="Geheimwort" autocomplete="off"
        autocorrect="off" spellcheck="false">
      <button class="knopf" id="pruefen">Eintragen</button>
      ${tippBlock(st,i)}
      <div class="geheim"><b>Euer eigenes Geheimwort</b><span>${meins}</span></div>
      <p class="hinweis">Nur verraten, wenn das andere Team seine Aufgabe wirklich gelöst hat.</p>
    </div>`;
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

/* --- Typ: HANDYAUS (der Fake) -------------------------------------------- */
function bauHandyAus(st,i){
  /* War die Station schon offen? Dann kommt jetzt der Dank — egal ob sie
     das Handy wirklich ausgeschaltet oder nur die Seite neu geladen haben. */
  if(Z.handyausAb){
    return handyAusDanke(st,i);
  }
  Z.handyausAb = Date.now(); sichern();
  const dauer = st.sekunden || 60;
  app().innerHTML = `
    <div class="karte alarm">
      <div class="alarmzeichen">⚠️</div>
      <p class="klein-label" style="color:#ff6b62;text-align:center">VIP-Server · Systemmeldung</p>
      <h2 class="mittel zentriert" style="color:#ff6b62">${st.titel}</h2>
      <p>${st.text||""}</p>
      <div class="countdown" id="uhr">${dauer}</div>
      <p class="hinweis">Der Server prüft die Verbindung.</p>
    </div>`;
  ton("schlecht"); ruckeln([200,100,200,100,400]);
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

/* ==========================================================================
   ERFOLGS-BILDSCHIRM
   ========================================================================== */
function geschafft(i, punkte, zusatz){
  const st = STATIONEN[i];
  Z.punkte += punkte;
  if(st.buchstabe && Z.buchstaben.indexOf(i)===-1) Z.buchstaben.push(i);
  Z.station = i+1;
  sichern(); kopfZeichnen();

  if(!st.buchstabe){ return zeigeStation(); }   /* Startstation: direkt weiter */

  window.scrollTo(0,0);
  app().innerHTML = `
    <div class="karte">
      <div class="erfolg">
        <div class="haken">✓</div>
        <p class="klein-label">Station geschafft</p>
        <p class="punkte">+${punkte}<small>Punkte</small></p>
        ${zusatz?`<p class="hinweis">${zusatz}</p>`:""}
      </div>
      <div class="strich"></div>
      <p class="klein-label zentriert">Euer Buchstabe</p>
      ${sammlungHTML()}
      <p class="hinweis">Merkt ihn euch — oder schreibt ihn auf die Hand.</p>
    </div>
    <button class="knopf" id="weiter">Nächste Station</button>`;
  ton("gut"); ruckeln([30,50,30]);
  $("#weiter").onclick = ()=>{ ton("klick"); zeigeStation(); };
}
function sammlungHTML(){
  return `<div class="sammlung">${BUCHSTABEN_STATIONEN.map(o=>{
    const hat = Z.buchstaben.indexOf(o.i)>-1;
    return `<span class="${hat?'hat':''}">${hat?o.s.buchstabe:"?"}</span>`;
  }).join("")}</div>`;
}

/* ==========================================================================
   FINALE
   ========================================================================== */
function zeigeFinale(){
  Z.fertig = true; sichern();
  const st = STATIONEN[STATIONEN.length-1] || {};
  const wort = BUCHSTABEN_STATIONEN.map(o=>o.s.buchstabe).join("");
  const min  = Z.start ? Math.round((Date.now()-Z.start)/60000) : 0;
  window.scrollTo(0,0);
  app().innerHTML = `
    <div class="start-logo">
      <div class="klein-label">Zutritt gewährt</div>
      <h1 class="gross" style="font-size:clamp(34px,12vw,58px)">${wort}</h1>
    </div>
    <div class="karte">
      <p class="klein-label zentriert">Eure Buchstaben</p>
      ${sammlungHTML()}
      <div class="strich"></div>
      <p>${st.text||""}</p>
      <p><b>${SPIEL.finaleText||""}</b></p>
      <div class="strich"></div>
      <div class="erfolg" style="padding:10px 0 0">
        <p class="punkte">${Z.punkte}<small>Punkte · ${min} Minuten</small></p>
      </div>
    </div>
    <p class="hinweis">Zeigt diesen Bildschirm dem Türsteher.</p>`;
  ton("gut"); setTimeout(()=>ton("gut"),300); ruckeln([60,80,60,80,200]);
  konfetti();
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
  const zeilen = STATIONEN.map((s,i)=>{
    let loesung = "—";
    if(s.typ==="code")  loesung = s.antwort;
    if(s.typ==="duell") loesung = "Geheimwort eines anderen Teams";
    if(s.typ==="quiz")  loesung = s.fragen.map(f=>f.optionen[f.richtig]).join(" · ");
    if(s.typ==="foto")  loesung = "mind. "+(s.mindestens||"alle")+" abhaken";
    if(s.typ==="handyaus") loesung = "Fake — läuft nach "+(s.sekunden||60)+" Sek. von selbst weiter";
    return `<tr><td>${i}. ${s.titel}${s.buchstabe?" ("+s.buchstabe+")":""}</td><td>${loesung}</td></tr>`;
  }).join("");
  app().innerHTML = `
    <div class="karte leiter">
      <h3>Spielleiter</h3>
      <table>${zeilen}</table>
    </div>
    <div class="karte leiter">
      <h3>Notfall</h3>
      <button class="knopf leise" id="skip">Diese Station überspringen</button>
      <button class="knopf leise" id="zurueck2">Eine Station zurück</button>
      <button class="knopf leise" id="reset">Spiel komplett neu starten</button>
    </div>
    <button class="knopf" id="raus">Zurück ins Spiel</button>`;
  $("#skip").onclick = ()=>{ Z.station=Math.min(Z.station+1,STATIONEN.length);
    const st=STATIONEN[Z.station-1];
    if(st&&st.buchstabe&&Z.buchstaben.indexOf(Z.station-1)===-1) Z.buchstaben.push(Z.station-1);
    sichern(); zeigeStation(); };
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
