import os
import re

app_file = r'C:\Users\tyildirim\.gemini\antigravity\scratch\cosmic-explorer\app.js'
html_file = r'C:\Users\tyildirim\.gemini\antigravity\scratch\cosmic-explorer\index.html'
styles_file = r'C:\Users\tyildirim\.gemini\antigravity\scratch\cosmic-explorer\styles.css'

with open(app_file, 'r', encoding='utf-8') as f:
    app_js = f.read()

# 1. Fix the freeze bug
# Remove the bad line from inside the rendering block
app_js = app_js.replace("if (gameState === 'TRAITOR_DIALOGUE' && e.key === 'Enter') { startTraitorBoss(); return; }", "")

# Add it to the keydown listener (around line 1569 where `if (gameState === 'QUIZ' && e.key === 'Enter') checkQuizAnswer();` is)
app_js = app_js.replace("if (gameState === 'QUIZ' && e.key === 'Enter') checkQuizAnswer();", 
                        "if (gameState === 'QUIZ' && e.key === 'Enter') checkQuizAnswer();\n    if (gameState === 'TRAITOR_DIALOGUE' && e.key === 'Enter') { startTraitorBoss(); return; }")

# 2. Level 1 Upgrades
old_alien_spawn = """if (Math.random() < 0.02 * dt * 60) {
              entities.push({ type: 'alien', x: Math.random() * canvas.width, y: -20, vx: (Math.random()-0.5)*100, vy: 50 + Math.random()*50, size: 20 });
           }"""
new_alien_spawn = """if (Math.random() < 0.08 * dt * 60) {
              entities.push({ type: 'alien', x: Math.random() * canvas.width, y: -20, vx: (Math.random()-0.5)*100, vy: 50 + Math.random()*50, size: 20 });
           }"""
if old_alien_spawn in app_js:
    app_js = app_js.replace(old_alien_spawn, new_alien_spawn)
else:
    # Just in case the formatting is slightly different
    app_js = re.sub(r'Math\.random\(\) < 0\.02 \* dt \* 60', 'Math.random() < 0.08 * dt * 60', app_js)

old_alien_physics = """         if (e.type === 'alien') {
             e.x += e.vx * dt; e.y += e.vy * dt;
             if (e.x < 0 || e.x > canvas.width) e.vx *= -1;
             
             // Basic alien rendering (pixel art style)
"""
new_alien_physics = """         if (e.type === 'alien') {
             let dx = ship.x - e.x;
             let dy = ship.y - e.y;
             let dist = Math.hypot(dx, dy) || 1;
             e.vx += (dx / dist) * 200 * dt;
             e.vy += (dy / dist) * 200 * dt;
             e.vx *= 0.98; e.vy *= 0.98;
             e.x += (e.vx + Math.sin(timestamp * 0.01 + e.size) * 150) * dt;
             e.y += e.vy * dt;
             if (e.x < 0 || e.x > canvas.width) e.vx *= -1;
             
             // Basic alien rendering (pixel art style)
"""
app_js = app_js.replace(old_alien_physics, new_alien_physics)


# 3. Cosmology Question Pool
questions = """
  const cosmologyQuestions = [
    { q: "What is the primary evidence for the Big Bang?", a: ["Cosmic Microwave Background Radiation", "Starlight", "Solar Winds", "Asteroid Impacts"], c: 0 },
    { q: "What phenomenon shows that the universe is expanding?", a: ["Blue shift", "Red shift", "Green shift", "Doppler effect in sound"], c: 1 },
    { q: "What force is responsible for the formation of stars?", a: ["Electromagnetism", "Strong Nuclear Force", "Gravity", "Weak Nuclear Force"], c: 2 },
    { q: "What is the final stage of a low-mass star like our Sun?", a: ["Supernova", "Black Hole", "Neutron Star", "White Dwarf"], c: 3 },
    { q: "What do high-mass stars become after a supernova?", a: ["White Dwarf or Red Giant", "Black Hole or Neutron Star", "Protostar", "Planetary Nebula"], c: 1 },
    { q: "Which element is primarily fused in a main sequence star?", a: ["Helium", "Carbon", "Hydrogen", "Iron"], c: 2 },
    { q: "What mysterious substance makes up most of the universe's mass?", a: ["Dark Energy", "Antimatter", "Dark Matter", "Plasma"], c: 2 },
    { q: "What is causing the universe's expansion to accelerate?", a: ["Dark Matter", "Dark Energy", "Gravity", "Black Holes"], c: 1 },
    { q: "What is a large collection of billions of stars called?", a: ["Solar System", "Constellation", "Galaxy", "Nebula"], c: 2 },
    { q: "What is the name of our galaxy?", a: ["Andromeda", "Milky Way", "Triangulum", "Sombrero"], c: 1 }
  ];
"""
app_js = app_js.replace("function triggerJumpscareAndQuiz(nextCallback) {", questions + "\n  function triggerJumpscareAndQuiz(nextCallback) {")

old_quiz_setup = """    quizQuestion.textContent = "Quick Quiz: What is the primary evidence for the Big Bang Theory?";
    quizLabels[0].textContent = "Cosmic Microwave Background Radiation";
    quizLabels[1].textContent = "The existence of Black Holes";
    quizLabels[2].textContent = "Solar Eclipses";
    quizLabels[3].textContent = "The speed of light";
    quizRadios.forEach(r => r.value = (r.id === 'q1' ? 'correct' : 'wrong'));"""

new_quiz_setup = """    let currentQ = cosmologyQuestions[Math.floor(Math.random() * cosmologyQuestions.length)];
    quizQuestion.textContent = "Quick Quiz: " + currentQ.q;
    quizLabels[0].textContent = currentQ.a[0];
    quizLabels[1].textContent = currentQ.a[1];
    quizLabels[2].textContent = currentQ.a[2];
    quizLabels[3].textContent = currentQ.a[3];
    quizRadios[0].value = currentQ.c === 0 ? 'correct' : 'wrong';
    quizRadios[1].value = currentQ.c === 1 ? 'correct' : 'wrong';
    quizRadios[2].value = currentQ.c === 2 ? 'correct' : 'wrong';
    quizRadios[3].value = currentQ.c === 3 ? 'correct' : 'wrong';"""

app_js = app_js.replace(old_quiz_setup, new_quiz_setup)


# 4. Debug Panel JS integration
debug_js = """
  // Debug Panel Listeners
  document.querySelectorAll('#debug-panel button').forEach(btn => {
      btn.addEventListener('click', () => {
          let lvl = btn.getAttribute('data-level');
          entities.length = 0; playerLasers.length = 0; enemyLasers.length = 0; particles.length = 0;
          ship.health = 100; ship.lives = 3;
          ship.x = 400; ship.y = 500;
          gameHud.hidden = false; overlay.hidden = true; jumpscareOverlay.hidden = true; quizModal.hidden = true;
          if(lvl == '1') startLevel1();
          if(lvl == '2') startLevel2();
          if(lvl == '3') startLevel3();
          if(lvl == '4') startLevel4();
          if(lvl == '5') startLevel5();
          if(lvl == '6') startLevel6();
          if(lvl == '6.5') startTraitorDialogue();
          if(lvl == '7') startLevel7();
      });
  });
"""
# Insert right before game loop starts
app_js = app_js.replace("function gameLoop(timestamp) {", debug_js + "\n  function gameLoop(timestamp) {")

with open(app_file, 'w', encoding='utf-8') as f:
    f.write(app_js)

# 5. Debug Panel HTML
with open(html_file, 'r', encoding='utf-8') as f:
    html = f.read()

debug_html = """
  <div id="debug-panel" class="debug-panel">
    <h3>DEBUG PANEL</h3>
    <button data-level="1">Lvl 1 (Swarm)</button>
    <button data-level="2">Lvl 2 (Comet)</button>
    <button data-level="3">Lvl 3 (Orbit)</button>
    <button data-level="4">Lvl 4 (Constell.)</button>
    <button data-level="5">Lvl 5 (Chaos)</button>
    <button data-level="6">Lvl 6 (Slalom)</button>
    <button data-level="6.5">Lvl 6.5 (Traitor)</button>
    <button data-level="7">Lvl 7 (Boss)</button>
  </div>
"""
if "id=\"debug-panel\"" not in html:
    html = html.replace("<div class=\"main-content\">", debug_html + "\n  <div class=\"main-content\">")
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html)

# 6. Debug Panel CSS
with open(styles_file, 'r', encoding='utf-8') as f:
    styles = f.read()

debug_css = """
/* DEBUG PANEL */
.debug-panel {
  position: absolute;
  top: 100px;
  left: 20px;
  width: 180px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid #ff00ff;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  z-index: 10000;
  box-shadow: 0 0 10px #ff00ff;
}
.debug-panel h3 {
  color: #ff00ff;
  font-family: var(--font-heading);
  text-align: center;
  font-size: 0.7rem;
  margin-bottom: 10px;
}
.debug-panel button {
  padding: 5px;
  font-size: 0.6rem;
  margin-bottom: 5px;
  border-color: #ff00ff !important;
  color: #ff00ff !important;
  box-shadow: 0 0 5px #ff00ff, inset 0 0 5px #ff00ff !important;
}
.debug-panel button:hover {
  background: #ff00ff !important;
  color: #000 !important;
  box-shadow: 0 0 15px #ff00ff, inset 0 0 15px #ff00ff !important;
}
"""
if "/* DEBUG PANEL */" not in styles:
    styles += debug_css
    with open(styles_file, 'w', encoding='utf-8') as f:
        f.write(styles)

print("Updates applied successfully!")
