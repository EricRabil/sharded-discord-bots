import chalk from "chalk";

const formatData = (data?: any[]) => data && " %O" || "";

interface Shorthand {
    (message: string, ...data: any[]): any;
}

export declare interface Logger extends Shorthand {
    (message: string, ...data: any[]): any;
}

/**
 * Lightweight logging class with color
 * 
 * It extends function so that you can call any instance of Logger as a shorthand for logging
 * 
 * const log = new Logger();
 * log("yay!");
 * log.warn("crap!");
 */
export class Logger extends Function {
    constructor(private prefix: string = "") {
        super('...args', 'return this.__call__(...args)');

        return this.bind(this);
    }

    debug(message: string, ...data: any[]) {
        console.log(`${this.formattedPrefixString}🤓 ${chalk.green(message)} ${formatData(data)}`, data);
    }

    log(message: string, ...data: any[]) {
        console.log(`${this.formattedPrefixString}ℹ️ ${message} ${formatData(data)}`, data);
    }

    warn(message: string, ...data: any[]) {
        console.warn(`${this.formattedPrefixString}⚠️ ${chalk.yellow(message)} ${formatData(data)}`, data);
    }

    error(message: string, error: Error, ...data: any[]) {
        console.error(`${this.formattedPrefixString}🚨 ${chalk.redBright(message)} ${chalk.red(`\n${error}`)} ${formatData(data)}`, data);
    }

    __call__(message: string, ...data: any[]) {
        this.log(message, ...data);
    }

    private get formattedPrefixString() {
        return chalk.magentaBright(this.prefix || "");
    }

    /**
     * Creates another breadcrumb in the tracer prefix
     * @param name the breadcrumb name
     */
    fork(name: string) {
        return new Logger((this.prefix || "") + `${name} `);
    }
}

export const Log = new Logger();