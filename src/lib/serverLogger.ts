export interface ServerLogger {
    moduleName: string
    route: string
    log: (type: string, message: string) => void
}

export function createLogger(moduleName: string, route: string): ServerLogger {
    return {
        moduleName,
        route,
        log(type: string, message: string) {
            const time = new Date().toISOString().split("T")[1].split(".")[0];
            console.log(
                `[${time}] [${type}] ${this.moduleName}.${this.route} | ${message}`
            );
        }
    }
}

export enum LogLevel {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}