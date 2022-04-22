//Global Constants
const cluePauseTime = 333; //How long to stop between clues.
const nextClueWaitTime = 1000; //How long to wait before starting next clue.

//Global Variables
var clueHoldTime = 1000; //How long to hold each clue's light/sound.
var progress = 0;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5;
var guessCounter = 0;
var pattern = [];
var userValue;
var totalButtons;
var speed;
var strikeCounter = 0;

//Game Timer Variables
var interval;
var timer;

//Function to hide the unwanted game buttons
function hideButton(totalButton) {
  totalButtons = Number(totalButton.innerHTML);
  console.log(totalButtons);

  switch (totalButtons) {
    case 7:
      document.getElementById("button8").classList.add("hide");
      break;

    case 6:
      for (var i = totalButtons + 1; i <= 8; i++) {
        document.getElementById("button" + i).classList.add("hide");
      }
      break;

    case 5:
      for (var i = totalButtons + 1; i <= 8; i++) {
        document.getElementById("button" + i).classList.add("hide");
      }
      break;

    case 4:
      for (var i = totalButtons + 1; i <= 8; i++) {
        document.getElementById("button" + i).classList.add("hide");
      }
      break;

    case 3:
      for (var i = totalButtons + 1; i <= 8; i++) {
        document.getElementById("button" + i).classList.add("hide");
      }
      break;

    default:
      break;
  }
  patternGenerator();
}

//Function to take input from user to get the size of the pattern
function patternSize(value) {
  userValue = value.innerHTML;
  totalButtons = value.innerHTML;
  console.log(totalButtons);
}

//Function to generate a random pattern using Math.random()
function patternGenerator() {
  for (var i = 0; i < userValue; i++) {
    var patternSelection = Math.floor(Math.random() * totalButtons) + 1;
    pattern.push(patternSelection);
    console.log(pattern);
  }
}

function gameSpeed(diffSpeed) {
  speed = diffSpeed.innerHTML;
  console.log(clueHoldTime);
  clueHoldTime = clueHoldTime / speed;
  console.log(speed);
  console.log(clueHoldTime);
}

function startGame() {
  progress = 0;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame() {
  gamePlaying = false;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6,
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 550,
  6: 630,
  7: 700,
  8: 800,
};

function playTone(btn, len) {
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
  context.resume();
  tonePlaying = true;
  setTimeout(function () {
    stopTone();
  }, len);
}

function startTone(btn) {
  if (!tonePlaying) {
    context.resume();
    o.frequency.value = freqMap[btn];
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025);
    context.resume();
    tonePlaying = true;
  }
}

function stopTone() {
  g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025);
  tonePlaying = false;
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();
var o = context.createOscillator();
var g = context.createGain();
g.connect(context.destination);
g.gain.setValueAtTime(0, context.currentTime);
o.connect(g);
o.start(0);

// Functions to light up the buttons when sound is playing
function lightButton(btn) {
  document.getElementById("button" + btn).classList.add("lit");
}
function clearButton(btn) {
  document.getElementById("button" + btn).classList.remove("lit");
}

function playSingleClue(btn) {
  if (gamePlaying) {
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function playClueSequence() {
  guessCounter = 0;
  //context.resume()
  let delay = nextClueWaitTime; //set delay to initial wait time
  for (let i = 0; i <= progress; i++) {
    // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms");
    setTimeout(playSingleClue, delay, pattern[i]); // set a timeout to play that clue
    delay += clueHoldTime;
    delay += cluePauseTime;
  }

  //Changes the time between each pattern computer plays by 50 each round
  if (clueHoldTime >= 100) {
    clueHoldTime = clueHoldTime - 50;
  }
}

function loseGame() {
  stopGame();
  alert("Game Over. You lost");
  document.location.reload();
}

function winGame() {
  stopGame();
  alert("Game Over. You win");
  document.location.reload();
}

function guess(btn) {
  console.log("user guessed: " + btn);
  if (guessCounter == 0) {
    countdown();
  }
  if (!gamePlaying) {
    return;
  }
  if (pattern[guessCounter] == btn) {
    //Correct Guess

    if (guessCounter == progress) {
      if (progress == pattern.length - 1) {
        //You Win!
        winGame();
      } else {
        //The pattern is correct, go to next segment
        clearInterval(interval);
        progress++;

        playClueSequence();
      }
    } else {
      //Check next guess
      guessCounter++;
    }
  } else {
    //Strike.
    strikeCounter++;
    var timeReduction = $(".clock").text();
    $(".clock").text(timeReduction - 3);
    clearInterval(interval);

    if (strikeCounter == 3) {
      loseGame();
    } else if (strikeCounter == 2) {
      document.getElementById("strikes").innerHTML = "🖤";
      alert("Wrong Pattern!!! You lose 3 seconds");
      playClueSequence();
    } else {
      document.getElementById("strikes").innerHTML = "🖤🖤";
      alert("Wrong Pattern!!! You lose 3 seconds");
      playClueSequence();
    }
  }
}

// Game Timer

$(document).ready(function () {
  $(".clock").text("90");
});

window.onclick = function () {
  if (timer <= 0) {
    alert("Time up!!! You lose");
    clearInterval(interval);
    document.location.reload();
  }
};

function countdown() {
  clearInterval(interval);
  interval = setInterval(function () {
    timer = $(".clock").html();
    timer -= 1;
    $(".clock").html(timer);

    if (timer == 0) clearInterval(interval);
  }, 1000);
}
