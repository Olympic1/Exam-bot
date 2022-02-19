const { createLogger, format, transports } = require('winston');

module.exports.logger = createLogger({
  transports: [new transports.Console()],
  format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
  exitOnError: false,
});