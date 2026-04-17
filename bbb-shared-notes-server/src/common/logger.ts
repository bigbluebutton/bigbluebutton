import config from '../config';

const { level } = config.log;
const trace = level.toLowerCase() === 'trace';
const debug = trace || level.toLowerCase() === 'debug';

const date = () => new Date().toISOString();

const parse = (messages: (object | string)[]) => {
  return messages.map(message => {
    if (typeof message === 'object') return JSON.stringify(message);

    return message;
  });
};

// TODO: enhance logger.
export class Logger {
  context: any;
  constructor(context: any) {
    this.context = context;
  }

  trace(...messages: (object | string)[]) {
    if (trace) {
      console.log(date(), 'TRACE\t', `[${this.context}]`, ...parse(messages));
    }
  }

  debug(...messages: (object | string)[]) {
    if (debug) {
      console.log(date(), 'DEBUG\t', `[${this.context}]`, ...parse(messages));
    }
  }

  info(...messages: (object | string)[]) {
    console.log(date(), 'INFO\t', `[${this.context}]`, ...parse(messages));
  }

  warn(...messages: (object | string)[]) {
    if (debug) {
      console.log(date(), 'WARN\t', `[${this.context}]`, ...parse(messages));
    }
  }

  error(...messages: (object | string)[]) {
    console.log(date(), 'ERROR\t', `[${this.context}]`, ...parse(messages));
  }

  fatal(...messages: (object | string)[]) {
    console.log(date(), 'FATAL\t', `[${this.context}]`, ...parse(messages));
  }
};
