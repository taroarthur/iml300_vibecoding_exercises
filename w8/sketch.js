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
  const cap = document.createElement('div');
  cap.className = 'caption';
  cap.textContent = 'Hover any symbol to play 20Hz pulses.';
  container.appendChild(cap);
}

function startPulse(el){
  // ensure audio context is resumed on first user interaction
  if (getAudioContext && getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }

  if(pulses.has(el)) return; // already playing

  // create a 20Hz sine oscillator
  const osc = new p5.Oscillator('sine');
  osc.freq(20);
  osc.amp(0);
  osc.start();

  // rhythm: pulse every 300ms (approx a steady rhythmic gesture)
  const intervalMs = 300;
  const pulseDuration = 120; // ms

  const trigger = ()=>{
    // ramp up quickly then down
    osc.amp(0.7, 0.01);
    setTimeout(()=>{ osc.amp(0, 0.08); }, pulseDuration);
    el.classList.add('playing');
    setTimeout(()=> el.classList.remove('playing'), pulseDuration+60);
  };

  // trigger immediately and then periodically
  trigger();
  const intervalId = setInterval(trigger, intervalMs);

  pulses.set(el, {osc, intervalId});
}

function stopPulse(el){
  const rec = pulses.get(el);
  if(!rec) return;
  clearInterval(rec.intervalId);
  // smoothly ramp down and stop
  rec.osc.amp(0,0.06);
  setTimeout(()=>{ rec.osc.stop(); rec.osc.dispose(); }, 120);
  pulses.delete(el);
  el.classList.remove('playing');
}
