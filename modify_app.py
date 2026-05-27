import os
import re

app_file = r'C:\Users\tyildirim\.gemini\antigravity\scratch\cosmic-explorer\app.js'
with open(app_file, 'r', encoding='utf-8') as f:
    app_js = f.read()

# Replace all LEVEL_6 with LEVEL_7 where appropriate, but only for the old boss level code.
# Let's do it carefully.
app_js = app_js.replace("function startLevel6() {", "function startLevel7() {\n    gameState = 'LEVEL_7';\n    hudLevel.textContent = 'LEVEL 7: BLACK HOLE BOSS';")
app_js = app_js.replace("gameState = 'LEVEL_6';\n    hudLevel.textContent = 'LEVEL 6: BLACK HOLE BOSS';", "")
app_js = app_js.replace("setTimeout(() => { if (gameState === 'LEVEL_6') hudObjective.textContent = ''; }, 4000);", "setTimeout(() => { if (gameState === 'LEVEL_7') hudObjective.textContent = ''; }, 4000);")
app_js = app_js.replace("if (gameState === 'LEVEL_6') {\n               let gx = canvas.width/2 - ship.x;", "if (gameState === 'LEVEL_7') {\n               let gx = canvas.width/2 - ship.x;")
app_js = app_js.replace("if (gameState === 'LEVEL_1' || gameState === 'LEVEL_2' || gameState === 'LEVEL_6')", "if (gameState === 'LEVEL_1' || gameState === 'LEVEL_2' || gameState === 'LEVEL_7')")

# Insert startLevel6 and startBossDialogue just before startLevel7
new_levels = """
  function startLevel6() {
    gameState = 'LEVEL_6';
    hudLevel.textContent = 'LEVEL 6: SOLAR WIND SLALOM';
    hudObjective.textContent = 'SURVIVE THE CHAOTIC SOLAR WIND AND COLLECT 10 ENERGY CORES!';
    setTimeout(() => { if (gameState === 'LEVEL_6') hudObjective.textContent = ''; }, 4000);
    entities = []; playerLasers = []; enemyLasers = []; particles = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    ship.coresCollected = 0;
  }

  function startBossDialogue() {
    gameState = 'BOSS_DIALOGUE';
    hudLevel.textContent = '';
    hudObjective.textContent = '';
  }
"""
app_js = app_js.replace("function startLevel7() {", new_levels + "\n  function startLevel7() {")

# Update startLevel5 transition to go to startLevel6
app_js = app_js.replace("setTimeout(() => triggerJumpscareAndQuiz(startLevel6), 2000);", "setTimeout(() => triggerJumpscareAndQuiz(startLevel6), 2000); // Transitions to Slalom")
# Note: actually it's inside `if (gameState === 'LEVEL_5') { ... setTimeout(() => triggerJumpscareAndQuiz(startLevel6), 2000); }`. We don't need to change that since startLevel6 is now the slalom!

# Add Solar Wind game loop logic
wind_logic = """
         if (gameState === 'LEVEL_6') {
             // Solar Wind Mechanics
             let windX = Math.sin(timestamp * 0.002) * 150;
             let windY = Math.cos(timestamp * 0.0015) * 100 + 50;
             ship.x += windX * dt;
             ship.y += windY * dt;
             
             ctx.fillStyle = 'rgba(255, 200, 50, 0.3)';
             for(let k=0; k<5; k++) {
                 ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 15, 3);
             }
             
             if (Math.random() < 0.05 * dt * 60) {
                 entities.push({ type: 'asteroid', x: Math.random()*canvas.width, y: -20, vy: 100 + Math.random()*200, size: 15 + Math.random()*20, hp: 50 });
             }
             if (Math.random() < 0.015 * dt * 60) {
                 entities.push({ type: 'energycore', x: Math.random()*canvas.width, y: -20, vy: 50 + Math.random()*50, size: 10 });
             }
             
             hudObjective.textContent = `SLALOM! COLLECT ENERGY CORES: ${ship.coresCollected}/10`;
             
             if (ship.coresCollected >= 10) {
                 hudObjective.textContent = 'CORES COLLECTED! PREPARE...';
                 gameState = 'TRANSITION';
                 setTimeout(() => startBossDialogue(), 2000);
             }
         }
"""
app_js = app_js.replace("if (gameState === 'LEVEL_5') {", wind_logic + "\n       if (gameState === 'LEVEL_5') {")

# Add 'energycore' to entity logic
core_logic = """
         if (e.type === 'energycore') {
             e.y += e.vy * dt;
             ctx.fillStyle = '#ff0'; ctx.beginPath(); ctx.arc(e.x, e.y, e.size, 0, Math.PI*2); ctx.fill();
             if (Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + e.size) {
                 ship.coresCollected = (ship.coresCollected || 0) + 1;
                 createExplosion(e.x, e.y, '#ff0', 10);
                 entities.splice(i, 1);
                 ship.score += 1000; updateHud();
             } else if (e.y > canvas.height + 50) {
                 entities.splice(i, 1);
             }
             continue;
         }
"""
app_js = app_js.replace("if (e.type === 'datacube') {", core_logic + "\n         if (e.type === 'datacube') {")

# Add Boss Dialogue and Victory Cinematic Rendering to 2D Renderer section
render_additions = """
       if (gameState === 'BOSS_DIALOGUE') {
           ctx.fillStyle = 'rgba(0,0,0,0.8)';
           ctx.fillRect(0, 0, canvas.width, canvas.height);
           
           if (!window.bossImg) { window.bossImg = new Image(); window.bossImg.src = 'assets/boss_portrait.png'; }
           if (window.bossImg.complete) ctx.drawImage(window.bossImg, canvas.width/2 - 150, 50, 300, 300);
           
           ctx.fillStyle = '#fff'; ctx.fillRect(100, 380, 600, 100);
           ctx.fillStyle = '#000'; ctx.font = '16px "Press Start 2P", monospace';
           ctx.fillText("You come so far so good HUMAN,", 120, 420);
           ctx.fillText("but this cycle ends here!", 120, 450);
           
           ctx.fillStyle = '#ff0'; ctx.font = '12px "Press Start 2P", monospace';
           ctx.fillText("PRESS ENTER TO FIGHT", 300, 550);
       }
       
       if (gameState === 'VICTORY_CINEMATIC') {
           if (!window.victoryImg) { window.victoryImg = new Image(); window.victoryImg.src = 'assets/victory_bg.png'; }
           if (window.victoryImg.complete) ctx.drawImage(window.victoryImg, 0, 0, canvas.width, canvas.height);
           
           ctx.fillStyle = 'rgba(0,0,0,0.5)';
           ctx.fillRect(0, 0, canvas.width, 100);
           ctx.fillStyle = '#0f0'; ctx.font = '24px "Press Start 2P", monospace';
           ctx.textAlign = 'center';
           ctx.fillText("MISSION ACCOMPLISHED!", canvas.width/2, 50);
           ctx.fillStyle = '#fff'; ctx.font = '16px "Press Start 2P", monospace';
           ctx.fillText("Score: " + ship.score, canvas.width/2, 80);
           ctx.textAlign = 'left';
       }
"""
app_js = app_js.replace("if (ship.health > 0 && gameState !== 'TRANSITION') {", render_additions + "\n       if (ship.health > 0 && gameState !== 'TRANSITION' && gameState !== 'BOSS_DIALOGUE' && gameState !== 'VICTORY_CINEMATIC') {")

# Key listener for BOSS_DIALOGUE
app_js = app_js.replace("if (gameState === 'QUIZ' && e.key === 'Escape') {", "if (gameState === 'BOSS_DIALOGUE' && e.key === 'Enter') { startLevel7(); return; }\n    if (gameState === 'QUIZ' && e.key === 'Escape') {")

# Add Web Audio API Synth to gameOver
synth_code = """
  function playVictorySynth() {
       const AudioContext = window.AudioContext || window.webkitAudioContext;
       if (!AudioContext) return;
       const ctx = new AudioContext();
       const masterGain = ctx.createGain();
       masterGain.connect(ctx.destination);
       masterGain.gain.value = 0.3;

       const notes = [41.20, 41.20, 49.00, 55.00, 41.20, 41.20, 61.74, 55.00];
       let time = ctx.currentTime;
       for (let i = 0; i < 48; i++) {
           const osc = ctx.createOscillator();
           osc.type = 'sawtooth';
           osc.frequency.value = notes[i % notes.length];
           const gain = ctx.createGain();
           gain.gain.setValueAtTime(0.5, time);
           gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
           osc.connect(gain);
           gain.connect(masterGain);
           osc.start(time);
           osc.stop(time + 0.25);
           time += 0.25;
       }
       let ktime = ctx.currentTime;
       for(let i=0; i<24; i++) {
           const osc = ctx.createOscillator();
           osc.type = 'square';
           osc.frequency.setValueAtTime(150, ktime);
           osc.frequency.exponentialRampToValueAtTime(0.01, ktime + 0.1);
           const gain = ctx.createGain();
           gain.gain.setValueAtTime(0.8, ktime);
           gain.gain.exponentialRampToValueAtTime(0.01, ktime + 0.1);
           osc.connect(gain);
           gain.connect(masterGain);
           osc.start(ktime);
           osc.stop(ktime + 0.1);
           ktime += 0.5;
       }
  }

  function gameOver(win) {
"""
app_js = app_js.replace("function gameOver(win) {", synth_code)

victory_transition = """
    if (win) {
        gameState = 'VICTORY_CINEMATIC';
        if (!window.victoryAudioPlayed) {
            playVictorySynth();
            window.victoryAudioPlayed = true;
        }
        leaderboard.push({ name: currentPlayerName, score: ship.score });
        if (window.db) {
          window.addDoc(window.collection(window.db, "leaderboard"), {
            name: currentPlayerName, score: ship.score, date: new Date()
          }).then(() => renderLeaderboard()).catch(e => console.error("Error adding score", e));
        } else { renderLeaderboard(); }
        return; // Skip normal HTML overlay
    }
    
    gameState = 'GAME_OVER';
"""
app_js = app_js.replace("gameState = win ? 'VICTORY' : 'GAME_OVER';", victory_transition)

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_js)
print("Updated app.js successfully!")
