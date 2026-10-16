// Entry point for `node --import`. Installs the loader hooks in ./loader.mjs
// before any test module is linked.
import { register } from 'node:module';

register('./loader.mjs', import.meta.url);
