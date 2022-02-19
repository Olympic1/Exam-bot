import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  transports: [new transports.Console()],
  format: format.printf(log => `[${log.level.toUpperCase()}] - ${log.message}`),
  exitOnError: false
});