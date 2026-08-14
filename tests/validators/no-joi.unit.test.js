const Module = require('module');

describe('validators fallback when joi is missing', () => {
  // Always simulate `joi` missing by intercepting Module._load below so
  // we exercise the fallback permissive schemas and improve coverage.
  let origLoad;

  beforeAll(() => {
    origLoad = Module._load;
    // Make require('joi') throw to simulate missing dependency
    const path = require('path');
    Module._load = function(request) {
      try {
        if (typeof request === 'string') {
          if (
            request === 'joi' ||
            request.includes(path.sep + 'node_modules' + path.sep + 'joi') ||
            request.endsWith(path.sep + 'joi') ||
            request.endsWith('/joi') ||
            request.endsWith('\\joi')
          ) {
            throw new Error('Cannot find module joi');
          }
        }
      } catch (e) {
        throw e;
      }
      return origLoad.apply(this, arguments);
    };
    // Remove any cached joi module so require will call Module._load and
    // trigger the simulated missing-module error even if joi is installed.
    try {
      const rid = require.resolve('joi');
      delete require.cache[rid];
    } catch (e) {
      // ignore if joi isn't installed
    }
    // Also remove any cached modules under a joi node_modules path to be thorough
    try {
      const keys = Object.keys(require.cache);
      for (const k of keys) {
        if (k.includes(path.sep + 'node_modules' + path.sep + 'joi')) {
          delete require.cache[k];
        }
      }
    } catch (e) {}
    jest.resetModules();
  });

  afterAll(() => {
    Module._load = origLoad;
    jest.resetModules();
  });

  test('validators export passthrough schemas when joi missing', () => {
    // Load each validator fresh (clear require cache) so they pick up the thrown error path
    const paths = ['../../validators/auth', '../../validators/appointment', '../../validators/medicine', '../../validators/pathology'];
    for (const p of paths) {
      delete require.cache[require.resolve(p)];
      const mod = require(p);
      for (const key of Object.keys(mod)) {
        const schema = mod[key];
        expect(schema).toBeDefined();
        expect(typeof schema.validate).toBe('function');
        const res = schema.validate({});
        // passthrough validate returns { error: null }
        if (!(res && res.error === null)) {
          throw new Error(`Expected passthrough for ${p} -> ${key}, got ${res && res.error}`);
        }
      }
    }
  });
});
