import * as winston from 'winston';

winston.configure({
    level: 'verbose',
    transports: [
        new winston.transports.Console({
            colorize: true
        }),
        new winston.transports.File({ filename: 'logs/log.txt' })
    ]
})

function log(level: string, text: string, data?: any) {
    winston.log(level, text, data);
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