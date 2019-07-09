import chalk from "chalk";
import discord, { Client, ClientOptions } from "discord.js";
import events from "events";
import { isValidEvent, EventType, IPCMessage, parseMessage } from "..";
import { Logger, Log } from "../logger";
import { bot_token, how_many_bots } from "../const";

export interface BotOptions {
    shardID?: number;
    token: string;
    useIPC?: boolean;
}

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

    async login() {
        this.log("hi sisters");
        try {
            this.log("hi sisters");

            this.client = new Client();
            this.log("hi sisters");

            await this.client.login(bot_token);
        } catch (e) {
            this.log.error("fuck, couldn't login!", e);
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