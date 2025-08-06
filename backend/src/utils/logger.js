const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }

  writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, meta = {}) {
    const formatted = this.formatMessage('info', message, meta);
    console.log(`\x1b[36m${formatted.trim()}\x1b[0m`); // Cyan
    this.writeToFile(this.logFile, formatted);
  }

  warn(message, meta = {}) {
    const formatted = this.formatMessage('warn', message, meta);
    console.warn(`\x1b[33m${formatted.trim()}\x1b[0m`); // Yellow
    this.writeToFile(this.logFile, formatted);
  }

  error(message, meta = {}) {
    const formatted = this.formatMessage('error', message, meta);
    console.error(`\x1b[31m${formatted.trim()}\x1b[0m`); // Red
    this.writeToFile(this.logFile, formatted);
    this.writeToFile(this.errorFile, formatted);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formatted = this.formatMessage('debug', message, meta);
      console.log(`\x1b[35m${formatted.trim()}\x1b[0m`); // Magenta
      this.writeToFile(this.logFile, formatted);
    }
  }

  success(message, meta = {}) {
    const formatted = this.formatMessage('success', message, meta);
    console.log(`\x1b[32m${formatted.trim()}\x1b[0m`); // Green
    this.writeToFile(this.logFile, formatted);
  }
}

module.exports = new Logger();
