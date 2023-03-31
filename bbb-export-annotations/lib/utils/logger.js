const config = require('../../config');

const {level} = config.log;
const trace = level.toLowerCase() === 'trace';
const debug = trace || level.toLowerCase() === 'debug';

const date = () => new Date().toISOString();

const parse = (messages) => {
  return messages.map((message) => {
    if (typeof message === 'object') return JSON.stringify(message);

    return message;
  });
};

module.exports = class Logger {
  constructor(context) {
    this.context = context;
  }

  trace(...messages) {
    if (trace) {
      console.log(date(), 'TRACE\t', `[${this.context}]`, ...parse(messages));
    }
  }

  debug(...messages) {
    if (debug) {
      console.log(date(), 'DEBUG\t', `[${this.context}]`, ...parse(messages));
    }
  }

  info(...messages) {
    console.log(date(), 'INFO\t', `[${this.context}]`, ...parse(messages));
  }

  warn(...messages) {
    if (debug) {
      console.log(date(), 'WARN\t', `[${this.context}]`, ...parse(messages));
    }
  }

  error(...messages) {
    console.log(date(), 'ERROR\t', `[${this.context}]`, ...parse(messages));
  }

  fatal(...messages) {
    console.log(date(), 'FATAL\t', `[${this.context}]`, ...parse(messages));
  }
};
