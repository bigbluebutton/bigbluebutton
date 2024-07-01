

class ChatLogger {
  constructor() {
    this.logLevel = 'info';
    this.levels = Object.freeze({
      error: 1,
      info: 2,
      debug: 3,
      trace: 4,
    });
    Object.keys(this.levels).forEach((i) => {
      this[i] = this.logger.bind(this, i);
    });
  }

  setLogLevel(level) {
    if (this.levels[level]) {
      this.logLevel = level;
    } else {
      throw new Error('This Level not exist');
    }
  }

  getLogLevel() {
    return this.logLevel;
  }

  logger(level, ...text) {
    const logLevel = this.levels[level];
    if (this.levels[this.logLevel] >= logLevel) {
      console.log(`${level}:`, ...text);
    }
  }
}

export default new ChatLogger();
