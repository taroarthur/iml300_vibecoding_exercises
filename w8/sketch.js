// sketch.js — builds the score DOM and adds p5.js sound-based hover pulses

const rows = [
  ['♩','♩','♩','♩','♩','♩','♩','·','·'],
  ['♪','♪','·','·','·','·','♪','♪','·'],
  ['·','·','♪','♪','·','·','·','♪','♩'],
  ['·','·','p','p','·','♪','♪','·','·'],
  ['·','·','·','♪','·','·','♫','♫','♫']
];

const pulses = new Map(); // element -> {osc, intervalId}

function setup(){
  noCanvas();
  buildScore();
}

function buildScore(){
  const container = document.getElementById('score');
  container.innerHTML = '';
  rows.forEach((r)=>{
    r.forEach((ch)=>{
      const el = document.createElement('div');
      el.className = 'note';
      if(ch === '·') el.classList.add('dot','small');
      if(ch === 'p') el.classList.add('p');
      el.textContent = ch;
      container.appendChild(el);

      // mouse hover handlers
      el.addEventListener('mouseenter', ()=>startPulse(el));
      el.addEventListener('mouseleave', ()=>stopPulse(el));
      // support touchstart for mobile
      el.addEventListener('touchstart', (e)=>{ e.preventDefault(); startPulse(el); });
      el.addEventListener('touchend', (e)=>{ e.preventDefault(); stopPulse(el); });
    });
  });
  // instruction text removed per request (visual-only score)
}

function startPulse(el){
  // ensure audio context is resumed on first user interaction
  if (getAudioContext && getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
  if(pulses.has(el)) return; // already playing

  const symbol = el.textContent.trim();
  if(symbol === '·') return; // rest / dot — no sound

  // create a 20Hz sine oscillator
  const osc = new p5.Oscillator('sine');
  osc.freq(20);
  osc.start();

  // create an envelope with a softer attack
  const env = new p5.Envelope();
  const attack = 0.06; // softer attack (seconds)
  const decay = 0.05;
  const sustainLevel = 0.5;
  const release = 0.08;
  env.setADSR(attack, decay, sustainLevel, release);

  // tempo and duration mapping
  const bpm = 80;
  const beatMs = 60000 / bpm;
  let pattern = [];
  let amp = 0.6;

  if(symbol === '♩'){
    pattern = [{dur: beatMs}];
  } else if(symbol === '♪'){
    pattern = [{dur: beatMs/2}];
  } else if(symbol === '♫'){
    // two connected eighths
    pattern = [{dur: beatMs/2},{dur: beatMs/2}];
  } else if(symbol === 'p' || symbol === 'P'){
    // piano dynamic — quieter quarter
    pattern = [{dur: beatMs}];
    amp = 0.28;
  } else {
    // fallback short pulse
    pattern = [{dur: beatMs/4}];
  }

  env.setRange(amp, 0);

  // play once then repeat the pattern while hovered
  const totalMs = pattern.reduce((s,it)=>s+it.dur, 0);
  const timeouts = [];

  function playOnce(){
    let offset = 0;
    pattern.forEach((note, i)=>{
      const dur = note.dur;
      const sustainSec = Math.max(0, (dur/1000) - (attack + release));
      const t = setTimeout(()=>{
        env.play(osc, 0, sustainSec);
        el.classList.add('playing');
        setTimeout(()=> el.classList.remove('playing'), dur);
      }, offset);
      timeouts.push(t);
      offset += dur;
    });
  }

  // start immediately and then loop
  playOnce();
  const intervalId = setInterval(playOnce, Math.max(20, totalMs));

  pulses.set(el, {osc, env, intervalId, timeouts});
}

function stopPulse(el){
  const rec = pulses.get(el);
  if(!rec) return;
  clearInterval(rec.intervalId);
  // clear scheduled timeouts
  if(rec.timeouts && rec.timeouts.length){
    rec.timeouts.forEach(t=>clearTimeout(t));
  }
  // smoothly stop oscillator
  try{
    rec.env.setRange(0,0);
  }catch(e){}
  rec.osc.amp(0,0.06);
  setTimeout(()=>{ try{ rec.osc.stop(); rec.osc.dispose(); }catch(e){} }, 140);
  pulses.delete(el);
  el.classList.remove('playing');
}
