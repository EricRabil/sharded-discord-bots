import chalk from "chalk";
import { Logger } from "./logger";

export enum EventType {
    HELLO = "HELLO"
}

export interface IPCMessage {
    event: EventType;
    data: any;
}

export function isValidEvent(event: any): event is IPCMessage {
    return typeof event["event"] === "string"
        && typeof EventType[event["event"]] !== "undefined";
}

/**
 * Parses a raw message received over IPC
 * @param rawMessage the raw message data
 */
export function parseMessage(log: Logger, rawMessage: any) {
    let message: any;
    
    if (typeof rawMessage === "string") {
        try {
            message = JSON.parse(rawMessage);
        } catch (e) {
            log.warn("something went wrong when parsing payload", rawMessage, e);
            return;
        }
    } else {
        return;
    }

    if (!isValidEvent(message)) {
        log.warn("got an invalid payload", message);
        return;
    }

    return message;
}