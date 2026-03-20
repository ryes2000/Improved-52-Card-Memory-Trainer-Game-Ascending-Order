let numCards = 5;
let currentSuit = 1;
let sequence = [];
let playerIndex = 0;
let mistakes = 0;
let successes = 0;
let isPlayerTurn = false;
let streak = 0;

let revealSpeed = 1000;

const suitSymbols = ["♣","♥","♠","♦"];
const suits = Array.from({length:4},()=>Array.from({length:13},(_,i)=>i+2));

function shuffle(a){ return a.sort(()=>Math.random()-0.5); }

/* 🔊 BUILT-IN SOUND SYSTEM (NO FILES) */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration, volume = 0.2, type = "sine"){
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.frequency.value = freq;
  osc.type = type;

  gain.gain.setValueAtTime(volume, audioCtx.currentTime);

  osc.start();

  setTimeout(()=>{
    osc.stop();
  }, duration);
}

/* 🎯 SCORE */
function updateScore(){
  document.getElementById("score").textContent =
    `Suit: ${suitSymbols[currentSuit-1]} | Cards: ${numCards} | Progress: ${playerIndex}/${sequence.length}`;
}

/* 💾 SAVE */
function saveGame(){
  localStorage.setItem("memoryGameSave", JSON.stringify({
    numCards,
    currentSuit,
    sequence,
    successes,
    mistakes
  }));
}

/* 📥 LOAD */
function loadGame(){
  const saved = localStorage.getItem("memoryGameSave");
  if(!saved) return false;

  const data = JSON.parse(saved);

  numCards = data.numCards || 5;
  currentSuit = data.currentSuit || 1;
  sequence = data.sequence || [];
  successes = data.successes || 0;
  mistakes = data.mistakes || 0;

  return true;
}

/* 🎮 START ROUND */
function startRound(newSeq=true){
  updateScore();
  playerIndex = 0;
  isPlayerTurn = false;

  document.querySelectorAll(".card").forEach(c=>{
    c.classList.remove("flipped");
  });

  setTimeout(()=>{

    if(newSeq){
      sequence = suits[currentSuit-1].slice(0,numCards);
      mistakes = 0;
    }

    const display = shuffle([...sequence]);
    const game = document.getElementById("game");
    game.innerHTML = "";

    display.forEach(v=>{
      const c = document.createElement("div");
      c.className = "card";

      const inner = document.createElement("div");
      inner.className = "card-inner";

      const f = document.createElement("div");
      f.className = "card-front";
      f.textContent = "?";

      const b = document.createElement("div");
      b.className = "card-back";

      let d = v;
      if(v===11)d="J";
      if(v===12)d="Q";
      if(v===13)d="K";
      if(v===14)d="A";

      b.textContent = d + suitSymbols[currentSuit-1];

      inner.appendChild(f);
      inner.appendChild(b);
      c.appendChild(inner);

      c.dataset.value = v;

      c.onclick = () => {
        if(isPlayerTurn) clickCard(c);
      };

      game.appendChild(c);
    });

    reveal(display);

  },500);
}

/* 👀 REVEAL */
function reveal(display){
  const cards = [...document.querySelectorAll(".card")];
  let i = 0;

  function next(){
    if(i >= display.length){
      isPlayerTurn = true;
      return;
    }

    const card = cards.find(c =>
      parseInt(c.dataset.value) === display[i]
    );

    if(card){
      card.classList.add("flipped");

      setTimeout(()=>{
        card.classList.remove("flipped");
        i++;
        setTimeout(next, 50);
      }, revealSpeed);
    } else {
      i++;
      next();
    }
  }

  next();
}

/* 🎯 CLICK */
function clickCard(card){

  if(card.classList.contains("flipped")) return;

  const v = parseInt(card.dataset.value);

  /* ✅ CORRECT */
  if(v === sequence[playerIndex]){

    // 🔊 correct sound (soft ding)
    playTone(600, 100, 0.10);

    card.classList.add("flipped");

    // green flash
    card.style.background = "#c8f7c5";
    setTimeout(()=> card.style.background = "", 200);

    playerIndex++;
    updateScore();
    saveGame();

    if(playerIndex === sequence.length){
      isPlayerTurn = false;
      successes++;
      mistakes = 0;
      nextRound();
    }

  } else {
    /* ❌ WRONG */

    // 🔊 softer wrong sound (fixed)
    playTone(180, 120, 0.16, "sine");

    card.classList.add("wrong");
    setTimeout(()=>card.classList.remove("wrong"),300);

    isPlayerTurn = false;
    successes = 0;
    mistakes++;
    saveGame();

    if(mistakes < 2){
      setTimeout(()=>startRound(false), 800);
    } else {
      mistakes = 0;
      if(numCards > 5) numCards--;
      setTimeout(()=>startRound(true), 800);
    }
  }
}

/* 📈 NEXT ROUND */
function nextRound(){

  // 🔊 win sound (pleasant chime)
  playTone(523, 100, 0.1);
  setTimeout(()=>playTone(659, 100, 0.08), 90);
  setTimeout(()=>playTone(784, 140, 0.08), 180);

  saveGame();

  if(successes < 2){
    setTimeout(()=>startRound(true), 800);
    return;
  }

  successes = 0;

  if(numCards < 13){
    numCards++;

    if(revealSpeed > 300) revealSpeed -= 30;

    setTimeout(()=>startRound(true), 800);

  } else if(currentSuit < 4){
    alert("🎉 Completed a suit!");
    currentSuit++;
    numCards = 5;
    startRound(true);

  } else {
    alert("🎉 You mastered the game!");
    currentSuit = 1;
    numCards = 5;
    startRound(true);
  }
}

/* ▶️ BUTTONS */
document.getElementById("beginBtn").onclick = function(){
  this.style.display = "none";

  if(loadGame()){
    startRound(false);
  } else {
    startRound(true);
  }
};

document.getElementById("resetBtn").onclick = function(){
  localStorage.removeItem("memoryGameSave");
  location.reload();
};
