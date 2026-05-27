import os
import re

app_file = r'C:\Users\tyildirim\.gemini\antigravity\scratch\cosmic-explorer\app.js'
styles_file = r'C:\Users\tyildirim\.gemini\antigravity\scratch\cosmic-explorer\styles.css'

with open(app_file, 'r', encoding='utf-8') as f:
    app_js = f.read()

# 1. Fix early return
app_js = app_js.replace("if (!gameState.startsWith('LEVEL_') && gameState !== 'TRANSITION') {", 
                        "if (!gameState.startsWith('LEVEL_') && gameState !== 'TRANSITION' && gameState !== 'BOSS_DIALOGUE' && gameState !== 'VICTORY_CINEMATIC' && gameState !== 'TRAITOR_DIALOGUE' && gameState !== 'TRAITOR_BOSS') {")
app_js = app_js.replace("if (ship.health > 0 && gameState !== 'TRANSITION' && gameState !== 'BOSS_DIALOGUE' && gameState !== 'VICTORY_CINEMATIC') {",
                        "if (ship.health > 0 && gameState !== 'TRANSITION' && gameState !== 'BOSS_DIALOGUE' && gameState !== 'VICTORY_CINEMATIC' && gameState !== 'TRAITOR_DIALOGUE') {")

# 2. Level 4 (Constellations) updates
old_starPath = """const starPath = [
       {x: 600, y: 400}, {x: 500, y: 450}, {x: 350, y: 400}, 
       {x: 250, y: 300}, {x: 300, y: 200}, {x: 450, y: 200}, {x: 350, y: 400} 
    ];"""
new_starPath = """const starPath = [
       {x: 400, y: 150}, {x: 500, y: 250}, {x: 650, y: 300}, 
       {x: 550, y: 450}, {x: 600, y: 600}, {x: 400, y: 550}, 
       {x: 200, y: 600}, {x: 250, y: 450}, {x: 150, y: 300}, 
       {x: 300, y: 250}, {x: 400, y: 150} 
    ];
    ship.levelTimer = 15;"""
app_js = app_js.replace(old_starPath, new_starPath)

level4_physics = """         if (gameState === 'LEVEL_4') {
            // Draw Target Constellation Lines
"""
new_level4_physics = """         if (gameState === 'LEVEL_4') {
            ship.levelTimer -= dt;
            ctx.fillStyle = '#f00'; ctx.font = '16px "Press Start 2P"';
            ctx.fillText("TIME LEFT: " + Math.ceil(ship.levelTimer), canvas.width/2, 100);
            if (ship.levelTimer <= 0) {
                ship.health = 0;
            }
            // Draw Target Constellation Lines
"""
app_js = app_js.replace(level4_physics, new_level4_physics)


# 3. Level 6 Slalom Rock Colors and dusty particles
old_rock_spawn = "entities.push({ type: 'asteroid', x: Math.random()*canvas.width, y: -20, vy: 100 + Math.random()*200, size: 15 + Math.random()*20, hp: 50 });"
new_rock_spawn = """
                 const rockColors = ['#9b59b6', '#2ecc71', '#e67e22', '#3498db', '#e74c3c'];
                 entities.push({ type: 'colored_rock', x: Math.random()*canvas.width, y: -20, vy: 100 + Math.random()*200, size: 15 + Math.random()*20, color: rockColors[Math.floor(Math.random()*rockColors.length)] });
"""
app_js = app_js.replace(old_rock_spawn, new_rock_spawn)

old_slalom_end = "setTimeout(() => startBossDialogue(), 2000);"
new_slalom_end = "setTimeout(() => startTraitorDialogue(), 2000);"
app_js = app_js.replace(old_slalom_end, new_slalom_end)

colored_rock_logic = """
         if (e.type === 'colored_rock') {
             e.y += e.vy * dt;
             ctx.fillStyle = e.color;
             ctx.beginPath();
             for(let j=0; j<8; j++){
                 let angle = (j/8) * Math.PI*2;
                 let rad = e.size * (0.8 + Math.random()*0.4);
                 ctx.lineTo(e.x + Math.cos(angle)*rad, e.y + Math.sin(angle)*rad);
             }
             ctx.fill();
             if (Math.random() < 0.3) {
                 particles.push({x: e.x, y: e.y, vx: (Math.random()-0.5)*20, vy: -50, life: 1, maxLife: 1, color: 'rgba(200,200,200,0.5)', size: 3});
             }
             if (e.y > canvas.height + 50) entities.splice(i, 1);
             
             if (Math.hypot(ship.x - e.x, ship.y - e.y) < ship.size + e.size) {
                 ship.health -= 20;
                 createExplosion(ship.x, ship.y, '#f00', 20);
                 entities.splice(i, 1);
             }
             continue;
         }
"""
app_js = app_js.replace("if (e.type === 'energycore') {", colored_rock_logic + "\n         if (e.type === 'energycore') {")


# 4. Traitor Boss Logistics
traitor_funcs = """
  function startTraitorDialogue() {
    gameState = 'TRAITOR_DIALOGUE';
    hudLevel.textContent = '';
    hudObjective.textContent = '';
  }

  function startTraitorBoss() {
    gameState = 'TRAITOR_BOSS';
    hudLevel.textContent = 'LEVEL 6.5: HUMAN TRAITOR';
    hudObjective.textContent = 'DEFEAT THE TRAITOR!';
    entities = []; playerLasers = []; enemyLasers = [];
    ship.x = 400; ship.y = 500; ship.vx = 0; ship.vy = 0;
    entities.push({ type: 'traitor', x: 400, y: 100, hp: 200, maxHp: 200, size: 30 });
  }
"""
app_js = app_js.replace("function startBossDialogue() {", traitor_funcs + "\n  function startBossDialogue() {")

traitor_render = """
       if (gameState === 'TRAITOR_DIALOGUE') {
           ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
           ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.moveTo(canvas.width/2, 100); ctx.lineTo(canvas.width/2-50, 250); ctx.lineTo(canvas.width/2+50, 250); ctx.fill();
           ctx.fillStyle = '#fff'; ctx.fillRect(100, 380, 600, 100);
           ctx.fillStyle = '#000'; ctx.font = '16px "Press Start 2P", monospace';
           ctx.fillText("FOOL! I have traded humanity", 120, 420);
           ctx.fillText("for ultimate cosmic power!", 120, 450);
           ctx.fillStyle = '#ff0'; ctx.font = '12px "Press Start 2P", monospace';
           ctx.fillText("PRESS ENTER TO FIGHT", 300, 550);
       }
"""
app_js = app_js.replace("if (gameState === 'BOSS_DIALOGUE') {", traitor_render + "\n       if (gameState === 'BOSS_DIALOGUE') {")

traitor_key = "if (gameState === 'TRAITOR_DIALOGUE' && e.key === 'Enter') { startTraitorBoss(); return; }\n    if (gameState === 'BOSS_DIALOGUE'"
app_js = app_js.replace("if (gameState === 'BOSS_DIALOGUE'", traitor_key)

traitor_physics = """
         if (e.type === 'traitor') {
             e.x += Math.sin(timestamp * 0.005) * 600 * dt;
             // draw red ship
             ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.moveTo(e.x, e.y-e.size); ctx.lineTo(e.x-e.size, e.y+e.size); ctx.lineTo(e.x+e.size, e.y+e.size); ctx.fill();
             // health bar
             ctx.fillStyle = '#f00'; ctx.fillRect(e.x - 30, e.y - 40, 60 * (e.hp/e.maxHp), 5);
             if (Math.random() < 0.15 * dt * 60) enemyLasers.push({x: e.x, y: e.y+20, vy: 400, color: '#f00'});
             
             for(let j=playerLasers.length-1; j>=0; j--){
                 if(Math.hypot(playerLasers[j].x - e.x, playerLasers[j].y - e.y) < e.size) {
                     e.hp -= 5; playerLasers.splice(j,1);
                     if (e.hp <= 0) {
                         createExplosion(e.x, e.y, '#f00', 50); ship.score += 20000; updateHud();
                         entities.splice(i, 1); gameState = 'TRANSITION';
                         setTimeout(() => startBossDialogue(), 3000);
                     }
                     break;
                 }
             }
             continue;
         }
"""
app_js = app_js.replace("if (e.type === 'boss') {", traitor_physics + "\n         if (e.type === 'boss') {")


with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_js)

# 5. CSS Button Overhaul
with open(styles_file, 'r', encoding='utf-8') as f:
    styles_css = f.read()

# Add a block to the end of styles.css targeting buttons to override
retro_buttons = """
/* CYBERPUNK BUTTON OVERHAUL */
button, #start-btn, #quiz-submit, #quiz-close {
    background: rgba(0, 0, 0, 0.7) !important;
    border: 2px solid #0ff !important;
    color: #0ff !important;
    box-shadow: 0 0 10px #0ff, inset 0 0 10px #0ff !important;
    text-shadow: 0 0 5px #0ff !important;
    transition: all 0.2s ease-in-out !important;
    cursor: pointer !important;
    font-family: var(--font-heading) !important;
    text-transform: uppercase;
}

button:hover, #start-btn:hover, #quiz-submit:hover, #quiz-close:hover {
    background: #0ff !important;
    color: #000 !important;
    box-shadow: 0 0 25px #0ff, inset 0 0 20px #0ff !important;
    transform: scale(1.05) !important;
    text-shadow: none !important;
}
"""

if "CYBERPUNK BUTTON OVERHAUL" not in styles_css:
    styles_css += retro_buttons

with open(styles_file, 'w', encoding='utf-8') as f:
    f.write(styles_css)

print("Updates applied successfully!")
