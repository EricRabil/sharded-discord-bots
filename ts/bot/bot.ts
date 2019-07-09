import { Client } from "discord.js";
import { EventType, parseMessage } from "..";
import { Logger, Log } from "../logger";
import { bot_token } from "../const";

export interface BotOptions {
    shardID?: number;
    token: string;
    useIPC?: boolean;
}

/**
 * Lightweight controller class for the bot processes
 */
export default class Bot {
    shardID: number | null = null;
    token: string;
    useIPC: boolean = false;
    log: Logger;
    client: Client;

    constructor({shardID, token, useIPC}: BotOptions) {
        this.shardID = shardID || this.shardID;
        this.token = token;
        this.useIPC = useIPC || this.useIPC;
        this.log = Log.fork(typeof shardID === "number" ? `bot[${shardID}]` : "bot");

        // send ipc hello and begin listening for messages
        if (this.useIPC && process.send) {
            process.send!(JSON.stringify({
                event: EventType.HELLO
            }));

            process.on("message", rawMessage => {
                const message = parseMessage(this.log, rawMessage);

                if (!message) return;

                this.log("mommy process says", message);

                switch (message.event) {
                    case EventType.HELLO:
                        this.login();
                        break;
                }
            });
        }
    }

    /**
     * Log in to discord!!
     */
    async login() {
        try {
            this.client = new Client();

            await this.client.login(bot_token);
        } catch (e) {
            this.log.error("couldn't login!", e);
            return;
        }

        this.log("im ready!");
    }
}

if (process.argv[2]) {
    // Spawn new bot with shard ID at process.argv[2]
    const bot = new Bot({
        shardID: parseInt(process.argv[2]),
        token: bot_token,
        useIPC: true
    });
}