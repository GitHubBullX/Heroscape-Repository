const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

function game() {
  const elements = new Map(), timers = [], audio = [], spoken = [];
  const element = () => ({
    dataset: {}, style: {}, children: [], className: '', textContent: '', innerHTML: '', disabled: false, clientWidth: 800,
    classList: { add() {}, remove() {} }, setAttribute() {}, addEventListener() {}, setPointerCapture() {}, releasePointerCapture() {},
    append(...children) { this.children.push(...children); }, querySelectorAll: () => [element(), element()]
  });
  const document = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, element());
      return elements.get(selector);
    },
    querySelectorAll: () => [],
    createElement: element,
    createElementNS: element
  };
  const speechSynthesis = { cancelCount: 0, cancel() { this.cancelCount++; }, speak(line) { spoken.push(line.text); } };
  class AudioMock {
    constructor(src) { this.src = src; this.paused = false; this.currentTime = 0; audio.push(this); }
    play() { return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  class UtteranceMock { constructor(text) { this.text = text; } }
  const context = vm.createContext({
    document, window: { speechSynthesis }, Audio: AudioMock, SpeechSynthesisUtterance: UtteranceMock, console, Math,
    setTimeout(fn, delay) { timers.push({ fn, delay }); },
    setInterval() {}, clearInterval() {}, confirm: () => true
  });
  const source = readFileSync(require.resolve('../dist/game.js'), 'utf8');
  vm.runInContext(source.replace(/\}\)\(\);?\s*$/, `
    globalThis.game = {
      get state(){return state}, get pan(){return [panX,panY]},
      reset(){state=fresh();return state}, endRound, allyTurn, enemyTurn,
      finish, combat, animateMove, deselect, reach, range, clickUnit, hex,
      camera(z,x,y){zoom=z;panX=x;panY=y;setView()},
      inspect(id){state.inspected=id},
      setHeight(q,r,value){hm[key(q,r)]=value},
      heights(){return Object.values(hm)}, playVoice,
      setVoiceManifest(value){voiceManifest=value}, setSound(value){soundOn=value}
    };
  })();`), context);
  return {
    api: context.game, audio, spoken, speechSynthesis,
    elements,
    timers,
    async tick(delay) {
      const index = timers.findIndex(timer => timer.delay === delay);
      assert.notEqual(index, -1, `Expected ${delay}ms timer`);
      timers.splice(index, 1)[0].fn();
      await Promise.resolve();
    }
  };
}

test('capture requires consecutive uncontested rounds', () => {
  const { api } = game();
  const player = api.state.units.find(u => u.team === 'player');
  const enemy = api.state.units.find(u => u.team === 'enemy');
  player.q = 5; player.r = 5;
  api.endRound();
  assert.equal(api.state.capture.player, 1);
  enemy.q = 6; enemy.r = 5;
  api.endRound();
  assert.equal(api.state.capture.player, 0);
  assert.equal(api.state.capture.enemy, 0);
  enemy.q = 10; enemy.r = 1;
  api.endRound();
  assert.equal(api.state.over, false);
  api.endRound();
  assert.equal(api.state.over, true);
  assert.equal(api.state.victory, true);
});

test('vacant objective resets capture', () => {
  const { api } = game();
  api.state.capture.player = 1;
  api.endRound();
  assert.equal(api.state.capture.player, 0);
});

for (const turn of ['allyTurn', 'enemyTurn']) {
  test(`${turn} stops when a mission restarts during movement`, async () => {
    const { api, tick } = game();
    const running = api[turn]();
    api.reset();
    const snapshot = JSON.stringify(api.state);
    await tick(650);
    await running;
    assert.equal(JSON.stringify(api.state), snapshot);
  });
}

test('repeated end-turn input starts one AI loop', async () => {
  const { api, timers, tick } = game();
  const first = api.allyTurn();
  await api.allyTurn();
  assert.equal(timers.filter(timer => timer.delay === 650).length, 1);
  api.reset();
  await tick(650);
  await first;
});

test('queued turn cannot advance a replacement battle', async () => {
  const { api, tick } = game();
  const players = api.state.units.filter(u => u.team === 'player');
  players.forEach(u => u.done = true);
  api.finish(players[0]);
  api.reset();
  await tick(300);
  assert.equal(api.state.turn, 'player');
});

test('old callbacks do not clear replacement battle effects', async () => {
  const { api, tick } = game();
  const player = api.state.units.find(u => u.team === 'player');
  api.animateMove(player, 2, 9);
  api.combat(player, api.state.units.find(u => u.team === 'enemy'));
  api.reset();
  api.state.motion = { id: player.id, dx: 1, dy: 1 };
  api.state.fx = { newBattle: true };
  await tick(620);
  await tick(460);
  assert.equal(api.state.motion.dx, 1);
  assert.equal(api.state.fx.newBattle, true);
});

test('zooming out returns the camera to the battlefield', () => {
  const { api } = game();
  api.camera(1.45, 100, 100);
  assert.ok(api.pan[0] > 0);
  api.camera(0.7, 100, 100);
  assert.equal(api.pan[0], 0);
  assert.equal(api.pan[1], 0);
});

test('deselect clears inspected enemy', () => {
  const { api, elements } = game();
  api.inspect(api.state.units.find(u => u.team === 'enemy').id);
  api.deselect();
  assert.equal(api.state.inspected, null);
  assert.equal(elements.get('#card').className, 'card empty');
});

test('movement stays spent after deselection and reselection', () => {
  const { api } = game();
  const player = api.state.units.find(u => u.team === 'player');
  const click = { currentTarget: { dataset: { id: player.id } } };
  api.clickUnit(click);
  const [destination] = api.reach(player).keys();
  const [q, r] = destination.split(',');
  api.hex({ currentTarget: { dataset: { q, r } } });
  assert.equal(player.moved, true);
  api.deselect();
  api.clickUnit(click);
  assert.equal(api.state.phase, 'attack');
  const before = `${player.q},${player.r}`;
  api.hex({ currentTarget: { dataset: { q: '0', r: '0' } } });
  assert.equal(`${player.q},${player.r}`, before);
});

test('a selected unit can attack without moving', () => {
  const { api } = game();
  const player = api.state.units.find(u => u.team === 'player');
  const enemy = api.state.units.find(u => u.team === 'enemy');
  enemy.q = player.q + 1; enemy.r = player.r;
  const hp = enemy.hp;
  api.clickUnit({ currentTarget: { dataset: { id: player.id } } });
  api.clickUnit({ currentTarget: { dataset: { id: enemy.id } } });
  assert.equal(player.moved, false);
  assert.ok(enemy.hp < hp);
});

test('inspecting an out-of-range enemy does not alter selection or activation', () => {
  const { api } = game();
  const player = api.state.units.find(u => u.team === 'player');
  const enemy = api.state.units.find(u => u.team === 'enemy');
  api.clickUnit({ currentTarget: { dataset: { id: player.id } } });
  api.clickUnit({ currentTarget: { dataset: { id: enemy.id } } });
  assert.equal(api.state.selected, player.id);
  assert.equal(api.state.inspected, enemy.id);
  assert.equal(player.done, false);
  assert.equal(player.moved, false);
});

test('even extreme elevation grants at most one additional range', () => {
  const { api } = game();
  const player = api.state.units.find(u => u.team === 'player');
  const enemy = api.state.units.find(u => u.team === 'enemy');
  player.range = 4; player.q = 0; player.r = 0;
  enemy.q = 5; enemy.r = 0;
  api.setHeight(0, 0, 20);
  api.setHeight(5, 0, 0);
  assert.equal(api.range(player, enemy), true);
  enemy.q = 6;
  assert.equal(api.range(player, enemy), false);
});

test('authored maps never create extreme floating elevation', () => {
  const { api } = game();
  assert.ok(Math.max(...api.heights()) <= 2);
});

test('browser bundle contains no ElevenLabs credential', () => {
  const source = readFileSync(require.resolve('../dist/game.js'), 'utf8');
  assert.doesNotMatch(source, /xi-api-key|ELEVENLABS_API_KEY|sk_[a-z0-9]{16,}/i);
});

test('character voice cues use their own action-specific clips without overlap', async () => {
  const { api, audio, speechSynthesis } = game();
  api.setSound(true);
  api.setVoiceManifest({ lines: {
    'Skywatch Rangers': { ready: 'voices/rangers-ready.mp3', attack: 'voices/rangers-attack.mp3' }
  } });
  api.playVoice('Skywatch Rangers', 'ready', 'Rangers ready.');
  api.playVoice('Skywatch Rangers', 'attack', 'Rangers attack.');
  assert.deepEqual(audio.map(line => line.src), ['voices/rangers-ready.mp3', 'voices/rangers-attack.mp3']);
  assert.equal(audio[0].paused, true);
  assert.equal(audio[0].currentTime, 0);
  assert.equal(audio[1].paused, false);
  assert.equal(speechSynthesis.cancelCount, 2);
});

test('speech fallback and recorded clips share one exclusive voice channel', () => {
  const { api, audio, spoken, speechSynthesis } = game();
  api.setSound(true);
  api.setVoiceManifest({ lines: { Narrator: { online: 'voices/briefing.mp3' } } });
  api.playVoice('Iron Guard', 'ready', 'The shield wall stands.');
  assert.deepEqual(spoken, ['The shield wall stands.']);
  api.playVoice('Narrator', 'online', 'Command online.');
  assert.equal(audio.length, 1);
  assert.equal(speechSynthesis.cancelCount, 2);
});
