import { createLogger, format, transports, addColors } from 'winston';
import safeStringify from 'fast-safe-stringify';
// import { parseInt } from 'lodash';

const { combine, timestamp, printf, colorize, errors } = format;

const colors = {
  info: 'bold white greenBG',
  debug: 'bold black yellowBG',
  warn: 'bold white magentaBG',
  error: 'bold white redBG',
};
addColors(colors);

const replacer = (_key: string, value: any) => {
  // Remove the circular structure
  if (value === '[Circular]') {
    return;
  }
  return value;
};

const prettyJSONFormat = format((info) => {
  if (info.message && info.message.constructor === Object) {
    const spacer = info.spacer || 2;
    info.message = `\n${safeStringify(info.message, replacer, spacer)}`;
  }
  return info;
});

const debugFormat = printf(({ level, message, timestamp, stack }) => {
  return `${level} ${timestamp} \n\t${message}${stack ? `\n\n\t${stack}` : ''}`;
});

const upperCaseLevelFormat = format((info) => {
  info.level = info.level.toUpperCase();
  return info;
});

const yellFormat = format((info) => {
  if (info.yell) {
    info.message = info.message.toUpperCase();
  }
  return info;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    upperCaseLevelFormat(),
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    yellFormat(),
    prettyJSONFormat(),
    debugFormat
  ),
  defaultMeta: { api: 'gameshq-api' },
  transports: [
    new transports.Console({
      handleExceptions: true,
    }),
  ],
});
