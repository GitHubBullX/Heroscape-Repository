const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');

test('WebGL battlefield builds and caches real triangle geometry from game state', () => {
  let uploaded = 0, uploads = 0, contextLostHandler;
  const gl = new Proxy({}, {
    get(target, key) {
      if (key === 'VERTEX_SHADER') return 1;
      if (key === 'FRAGMENT_SHADER') return 2;
      if (key === 'COMPILE_STATUS' || key === 'LINK_STATUS') return 1;
      if (key === 'ARRAY_BUFFER' || key === 'DYNAMIC_DRAW' || key === 'FLOAT' || key === 'TRIANGLES' || key === 'DEPTH_TEST' || key === 'LEQUAL' || key === 'COLOR_BUFFER_BIT' || key === 'DEPTH_BUFFER_BIT') return 1;
      if (key === 'bufferData') return (_type, data) => { uploaded = data.length; uploads++; };
      if (!(key in target)) target[key] = () => ({});
      return target[key];
    }
  });
  const canvas = {
    getContext(name) { assert.equal(name, 'webgl2'); return gl; },
    getBoundingClientRect() { return { width: 800, height: 600 }; },
    addEventListener(name, handler) { if (name === 'webglcontextlost') contextLostHandler = handler; },
    width: 0, height: 0
  };
  const classes = new Set();
  const context = vm.createContext({
    document: { querySelector: () => canvas, body: { classList: { add(value) { classes.add(value); }, remove(value) { classes.delete(value); } } } },
    window: {}, performance: { now: () => 0 }, requestAnimationFrame() {},
    devicePixelRatio: 1, innerWidth: 800, Math, Float32Array
  });
  vm.runInContext(readFileSync(require.resolve('../dist/world3d.js'), 'utf8'), context);
  assert.equal(context.window.Valhalla3D.available, true);
  const scene = {
    view: { x: 0, y: 0, w: 600, h: 500 },
    height: { '1,1': 1 },
    tiles: [{ q: 1, r: 1, t: 'forest', h: 1 }],
    state: {
      structures: [{ type: 'tower', q: 1, r: 1 }],
      bases: [{ team: 'player', q: 1, r: 1, hp: 10 }],
      units: [{ team: 'player', q: 1, r: 1, hp: 3, maxHp: 3, size: 3, range: 4 }]
    }
  };
  context.window.Valhalla3D.render(scene);
  assert.ok(uploaded > 1000, 'expected substantial 3D vertex data');
  assert.equal(uploads, 1);
  context.window.Valhalla3D.render({ ...scene, view: { x: 20, y: 10, w: 500, h: 400 } });
  assert.equal(uploads, 1, 'camera and UI updates should reuse the existing mesh');
  scene.state.units[0].q = 2;
  context.window.Valhalla3D.render(scene);
  assert.equal(uploads, 2, 'game-state geometry changes should rebuild the mesh');
  let prevented = false;
  contextLostHandler({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(canvas.hidden, true);
  assert.equal(context.window.Valhalla3D.available, false);
  assert.equal(classes.has('webgl-ready'), false);
  context.window.Valhalla3D.render(scene);
  assert.equal(uploads, 2, 'lost contexts should stop GPU uploads and retain the SVG fallback');
});
