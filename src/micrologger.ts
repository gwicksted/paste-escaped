interface IDictionary<T> {
    [key: string]: T;
}

const levels: IDictionary<boolean> = {
    trace: false,
    debug: true,
    info: true,
    warn: true,
    error: true,
    fatal: true
};

const getTimestamp = (): string => {
    return new Date().toISOString();
};

type Logger = (message: string) => void;

// tslint:disable:no-console
const loggerFor = (level: keyof typeof levels): Logger => {
    switch (level) {
        case "trace":
            return (message: string): void => { if (levels.trace) { console.log(message); } };
        case "debug":
        return (message: string): void => { if (levels.debug) { console.log(message); } };
        case "info":
            return (message: string): void => { if (levels.info) { console.log(message); } };
        case "warn":
            return (message: string): void => { if (levels.warn) { console.log(message); } };
        case "error":
        case "fatal":
            return (message: string): void => { if (levels.error) { console.log(message); } };
        default:
            return (message: string): void => { if (levels.log) { console.log(message); } };
    }
};
// tslint:enable:no-console

const extensionLog = (file: string, message: string, level: keyof typeof levels, reason?: Error | string): void => {
    let exceptionDetails: string = "";

    if (typeof reason === "string") {
        exceptionDetails = reason;
    } else if (typeof reason !== "undefined" && typeof reason.name === "string" && typeof reason.message === "string") {
        exceptionDetails = ` Error ${reason.name} '${reason.message}'`;
        if (typeof reason.stack === "string") {
            exceptionDetails += ` Stack: ${reason.stack}`;
        }
    }

    const logger = loggerFor(level);

    logger(`${getTimestamp()} - ${level}: [${file}] ${message}${exceptionDetails}`);
};

let extensionName: string = "";

export const setExtensionName = (name: string): void => {
    extensionName = name;
};

export const trace = (message: string, reason?: Error | string): void => {
    extensionLog(extensionName, message, "trace", reason);
};

export const debug = (message: string, reason?: Error | string): void => {
    extensionLog(extensionName, message, "debug", reason);
};

export const info = (message: string, reason?: Error | string): void => {
    extensionLog(extensionName, message, "info", reason);
};

export const warn = (message: string, reason?: Error | string): void => {
    extensionLog(extensionName, message, "warn", reason);
};

export const error = (message: string, reason?: Error | string): void => {
    extensionLog(extensionName, message, "error", reason);
};

export const fatal = (message: string, reason?: Error | string): void => {
    extensionLog(extensionName, message, "fatal", reason);
};
