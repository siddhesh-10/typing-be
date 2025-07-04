import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for structured logging
const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    logFormat
  ),
  defaultMeta: {
    service: 'typing-practice-backend',
    stage: process.env['STAGE'] || 'dev'
  },
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        logFormat
      )
    })
  ]
});

// Add request context to logger
export const createRequestLogger = (requestId: string, userId?: string) => {
  return logger.child({
    requestId,
    userId,
    timestamp: new Date().toISOString()
  });
};

// Log levels for different environments
if (process.env['STAGE'] === 'prod') {
  logger.level = 'info';
} else {
  logger.level = 'debug';
}

export default logger; 