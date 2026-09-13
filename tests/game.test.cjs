const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

// Exercise the actual game, instrumenting only the test copy to expose state.
// A controlled clock allows restarting a mission while the AI is paused.
function game() {
  const elements = new Map(), timers = [];
  const element = () => ({ dataset: {}, style: {}, classList: { add() {}, remove() {} },
    setAttribute() {}, append() {}, addEventListener() {},
    querySelectorAll: () => [element(), element()], clientWidth: 800 });
  const document = {
    querySelector(selector) {
      if (!elements.has(selector)) elements.set(selector, element());
      return elements.get(selector);
    }, querySelectorAll: () => [], createElement: element, createElementNS: element
  };
  const context = vm.createContext({ document, window: {}, console,
    setTimeout(fn, delay) { timers.push({ fn, delay }); },
    setInterval() {}, clearInterval() {}, confirm: () => true });
  const source = readFileSync(require.resolve('../dist/game.js'), 'utf8');
  vm.runInContext(source.replace(/\}\)\(\);?\s*$/, `
    globalThis.game = {
      get state(){return state}, get pan(){return [panX,panY]},
      reset(){state=fresh();return state}, endRound, allyTurn, enemyTurn,
      finish, combat, animateMove, deselect, reach, clickUnit, hex,
      camera(z,x,y){zoom=z;panX=x;panY=y;setView()},
      inspect(id){state.inspected=id}
    };
  })();`), context);
  return { api: context.game, elements, timers, async tick(delay) {
    const index = timers.findIndex(timer => timer.delay === delay);
    assert.notEqual(index, -1, `Expected ${delay}ms timer`);
    timers.splice(index, 1)[0].fn();
    await Promise.resolve();
  } };
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
  assert.equal(timers.filter(t => t.delay === 650).length, 1);
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
  api.camera(1.35, 100, 100);
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
  api.deselect(); api.clickUnit(click);
  assert.equal(api.state.phase, 'attack');
  const before = `${player.q},${player.r}`;
  api.hex({ currentTarget: { dataset: { q: '0', r: '0' } } });
  assert.equal(`${player.q},${player.r}`, before);
});
