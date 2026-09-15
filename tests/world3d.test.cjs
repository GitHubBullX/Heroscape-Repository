const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

test('WebGL battlefield builds real triangle geometry from game state', () => {
  let uploaded = 0;
  const gl = new Proxy({}, {
    get(target, key) {
      if (key === 'VERTEX_SHADER') return 1;
      if (key === 'FRAGMENT_SHADER') return 2;
      if (key === 'COMPILE_STATUS' || key === 'LINK_STATUS') return 1;
      if (key === 'ARRAY_BUFFER' || key === 'DYNAMIC_DRAW' || key === 'FLOAT' || key === 'TRIANGLES' || key === 'DEPTH_TEST' || key === 'LEQUAL' || key === 'COLOR_BUFFER_BIT' || key === 'DEPTH_BUFFER_BIT') return 1;
      if (key === 'bufferData') return (_type, data) => { uploaded = data.length; };
      if (!(key in target)) target[key] = () => ({});
      return target[key];
    }
  });
  const canvas = {
    getContext(name) { assert.equal(name, 'webgl2'); return gl; },
    getBoundingClientRect() { return { width: 800, height: 600 }; },
    width: 0, height: 0
  };
  const context = vm.createContext({
    document: { querySelector: () => canvas, body: { classList: { add() {} } } },
    window: {}, performance: { now: () => 0 }, requestAnimationFrame() {},
    devicePixelRatio: 1, innerWidth: 800, Math, Float32Array
  });
  vm.runInContext(readFileSync(require.resolve('../dist/world3d.js'), 'utf8'), context);
  assert.equal(context.window.Valhalla3D.available, true);
  context.window.Valhalla3D.render({
    view: { x: 0, y: 0, w: 600, h: 500 },
    height: { '1,1': 1 },
    tiles: [{ q: 1, r: 1, t: 'forest', h: 1 }],
    state: {
      structures: [{ type: 'tower', q: 1, r: 1 }],
      bases: [{ team: 'player', q: 1, r: 1, hp: 10 }],
      units: [{ team: 'player', q: 1, r: 1, hp: 3, maxHp: 3, size: 3, range: 4 }]
    }
  });
  assert.ok(uploaded > 1000, 'expected substantial 3D vertex data');
});
