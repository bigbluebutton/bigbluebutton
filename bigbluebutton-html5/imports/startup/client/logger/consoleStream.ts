import {
  TRACE,
  DEBUG,
  INFO,
  WARN,
  ERROR,
  FATAL,
} from '@browser-bunyan/levels';

const css = {
  levels: {
    trace: 'color: DeepPink',
    debug: 'color: GoldenRod',
    info: 'color: DarkTurquoise',
    warn: 'color: Purple',
    error: 'color: Crimson',
    fatal: 'color: Black',
  },
  def: 'color: DimGray',
  msg: 'color: SteelBlue',
  src: 'color: DimGray; font-style: italic; font-size: 0.9em',
};

export default class ConsoleFormattedStream {
  /* eslint-disable */
  write({
    childName,
    err,
    level,
    levelName,
    v,
    msg,
    name,
    src,
    time,
    ...extraFields
  }: Record<string, any>) {
    let levelCss, consoleMethod;
    const defaultCss = css.def;
    const msgCss = css.msg;
    const srcCss = css.src;

    const loggerName = childName ? name + '/' + childName : name;

    //get level name and pad start with spacs
    const formattedLevelName = (
      Array(Math.max(0, 6 - levelName.length)).join(' ') + levelName
    ).toUpperCase();

    if (level === TRACE) {
      levelName = 'debug';
    } else if (level === FATAL) {
      levelName = 'error';
    }
    consoleMethod =
      typeof console[levelName as 'log' | 'error' | 'warn' | 'info'] ===
      'function'
        ? console[levelName as 'log' | 'error' | 'warn' | 'info']
        : console.log;

    if (level < DEBUG) {
      levelCss = css.levels.trace;
    } else if (level < INFO) {
      levelCss = css.levels.debug;
    } else if (level < WARN) {
      levelCss = css.levels.info;
    } else if (level < ERROR) {
      levelCss = css.levels.warn;
    } else if (level < FATAL) {
      levelCss = css.levels.error;
    } else {
      levelCss = css.levels.fatal;
    }

    const padZeros = (number: number, len: number) =>
      Array(len + 1 - (number + '').length).join('0') + number;

    const logArgs = [];
    // [time] level: loggerName: msg src?
    logArgs.push(`[%s:%s:%s:%s] %c%s%c: %s: %c%s ${src ? '%c%s' : ''}`);
    logArgs.push(padZeros(time.getHours(), 2));
    logArgs.push(padZeros(time.getMinutes(), 2));
    logArgs.push(padZeros(time.getSeconds(), 2));
    logArgs.push(padZeros(time.getMilliseconds(), 4));
    logArgs.push(levelCss);
    logArgs.push(formattedLevelName);
    logArgs.push(defaultCss);
    logArgs.push(loggerName);
    logArgs.push(msgCss);
    logArgs.push(msg);
    if (src) {
      logArgs.push(srcCss);
      logArgs.push(src);
    }
    if (Object.keys(extraFields).length) {
      logArgs.push('\n');
      logArgs.push(extraFields);
    }
    if (err?.stack) {
      logArgs.push('\n');
      logArgs.push(err.stack);
    }
    consoleMethod.apply(console, logArgs);
  }
}
