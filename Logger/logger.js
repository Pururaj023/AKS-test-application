const winston = require('winston');
const os = require('os');

// Custom format to match the log structure shown in the image
const customFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  const logEntry = {
    action: meta.action || '',
    apiHash: meta.apiHash || '',
    apiName: meta.apiName || '',
    apiType: meta.apiType || '',
    clientIP: meta.clientIP || '',
    customerNo: meta.customerNo || '',
    deviceType: meta.deviceType || '',
    errorCode: meta.errorCode || '',
    errorType: meta.errorType || '',
    functionName: meta.functionName || '',
    hostname: os.hostname(),
    level: meta.logLevel || 50,
    loggerName: meta.loggerName || '',
    logType: level,
    messageCode: meta.messageCode || '',
    meta: meta.metaData || {},
    name: meta.name || '',
    pid: process.pid,
    time: timestamp,
    timestamp: timestamp
  };

  return JSON.stringify(logEntry, null, 2);
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }),
    customFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }),
        customFormat
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

module.exports = logger;