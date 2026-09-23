"use strict";

var cvs = document.getElementById("canvas");
var ctx = cvs.getContext("2d");

// load images
var bird = new Image();
var bg = new Image();
var fg = new Image();
var pipeNorth = new Image();
var pipeSouth = new Image();

bird.src = "images/bird.png";
bg.src = "images/bg.png";
fg.src = "images/fg.png";
pipeNorth.src = "images/pipeNorth.png";
pipeSouth.src = "images/pipeSouth.png";

// some variables
var gap = 85;
var constant;
var bX = 10;
var bY = 150;
var gravity = 1.5;
var score = 0;
var gameOver = false;

// audio files
var fly = new Audio();
var scor = new Audio();

fly.src = "sounds/fly.mp3";
scor.src = "sounds/score.mp3";

// on key down
document.addEventListener("keydown", moveUp);

// tap / touch support for phones
document.addEventListener("touchstart", function(e){
  e.preventDefault();
  moveUp();
}, {passive:false});
cvs.addEventListener("mousedown", moveUp);

function moveUp() {
  if(gameOver) return;
  bY -= 25;

  try { fly.play(); } catch(e) {}
}

// pipe coordinates
var pipe = [];

pipe[0] = {
  x: cvs.width,

  y: 0,
};

// game over overlay
function showGameOver(){
  gameOver = true;
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  ctx.fillStyle = "#fff";
  ctx.font = "28px Verdana";
  ctx.textAlign = "center";
  ctx.fillText("Loja mbaroi!", cvs.width/2, cvs.height/2 - 30);
  ctx.font = "18px Verdana";
  ctx.fillText("Pikët: " + score, cvs.width/2, cvs.height/2 + 5);
  ctx.fillText("Prek për të luajtur sërish", cvs.width/2, cvs.height/2 + 40);
  ctx.textAlign = "left";
}

function restart(){
  if(!gameOver) return;
  bY = 150;
  score = 0;
  gameOver = false;
  pipe = [{ x: cvs.width, y: 0 }];
  draw();
}

document.addEventListener("keydown", function(){
  if(gameOver) restart();
});
document.addEventListener("touchstart", function(){
  if(gameOver) setTimeout(restart, 350);
}, {passive:true});

// draw images
function draw() {
  ctx.drawImage(bg, 0, 0);

  for (var i = 0; i < pipe.length; i++) {
    constant = pipeNorth.height + gap;

    ctx.drawImage(pipeNorth, pipe[i].x, pipe[i].y);
    ctx.drawImage(pipeSouth, pipe[i].x, pipe[i].y + constant);

    if(!gameOver) pipe[i].x--;

    if (pipe[i].x == 125) {
      pipe.push({
        x: cvs.width,
        y: Math.floor(Math.random() * pipeNorth.height) - pipeNorth.height,
      });
    }

    // detect collision
    if (
      !gameOver &&
      ((bX + bird.width >= pipe[i].x &&
        bX <= pipe[i].x + pipeNorth.width &&
        (bY <= pipe[i].y + pipeNorth.height ||
          bY + bird.height >= pipe[i].y + constant)) ||
      bY + bird.height >= cvs.height - fg.height)
    ) {
      showGameOver();
      try { scor.play(); } catch(e) {}
    }

    if (pipe[i].x == 5 && !gameOver) {
      score++;
      try { scor.play(); } catch(e) {}
    }
  }

  ctx.drawImage(fg, 0, cvs.height - fg.height);
  ctx.drawImage(bird, bX, bY);

  if(!gameOver) bY += gravity;
  ctx.fillStyle = "#000";
  ctx.font = "20px Verdana";
  ctx.fillText("Pikët: " + score, 10, cvs.height - 20);
  if(!gameOver) requestAnimationFrame(draw);
}

// start the game only after all images are loaded,
// otherwise their sizes are 0 and the bird dies instantly
var sprites = [bird, bg, fg, pipeNorth, pipeSouth];
var spritesLoaded = 0;
var started = false;
function spriteReady(){
  spritesLoaded++;
  if(spritesLoaded === sprites.length && !started){
    started = true;
    draw();
  }
}
sprites.forEach(function(img){
  if(img.complete && img.naturalWidth) spriteReady();
  else { img.onload = spriteReady; img.onerror = spriteReady; }
});
