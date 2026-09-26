// Stands in for /imports/startup/client/logger. Keeps the whole payload so a
// test can assert on logCode AND extraInfo, which is the point of the change
// under test.
import { logs } from '../environment.mjs';

const record = (level) => (payload, msg) => { logs.push({ level, msg, ...payload }); };

export default {
  debug: record('debug'),
  info: record('info'),
  warn: record('warn'),
  error: record('error'),
};
