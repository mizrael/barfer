import * as path from 'path';
import * as fs from 'fs';
import * as winston from 'winston';

const isEnabled = (process.env.LOGGING_ENABLED == "true"),
    logDir = './logs',
    logFullPath = path.join(logDir, 'log.txt');
let needInit = true;

function init() {
    if (!needInit)
        return;

    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    winston.configure({
        level: 'verbose',
        transports: [
            new winston.transports.Console({
                colorize: true
            }),
            new winston.transports.File({ filename: 'logs/log.txt' })
        ]
    });

    needInit = false;
}

init();

function log(level: string, text: string, data?: any) {
    if (process.env.LOGGING_ENABLED == "true") {
        winston.log(level, text, data);
    }
}

export function info(text: string, data?: any) {
    log("info", text, data);
}

export function error(text: string, data?: any) {
    log("error", text, data);
}

export function warning(text: string, data?: any) {
    log("warning", text, data);
}