import { Client } from "discord.js";
import fs from "fs-extra";
import { EventType, parseMessage } from "..";
import { Logger, Log } from "../logger";
import { bot_token, bot_prefix } from "../const";
import { CommandHandler, Context } from "../api/command";
import { resolve } from "path";

export interface BotOptions {
    shardID?: number;
    token: string;
    useIPC?: boolean;
}

export interface CommandList {
    [name: string]: {
        middleware?: CommandHandler[];
        handler: CommandHandler;
    }
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
    commandList: CommandList = {};

    public static bot: Bot;

    constructor({shardID, token, useIPC}: BotOptions) {
        Bot.bot = this;
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

        await this.importAllCommandFiles();

        this.client.on("message", async message => {
            if (!message.content.startsWith(bot_prefix)) return;
            const [ command, ...args ] = message.content.substring(bot_prefix.length).split(' ');

            const handlers = this.commandList[command];

            if (!handlers) {
                return;
            }

            let { handler, middleware } = handlers;

            const context: Context = {
                state: {},
                message
            };

            if (middleware) {
                const stop = await new Promise((resolve) => {
                    let current: CommandHandler | undefined;
                    const next = (err?: any) => {
                        current = middleware!.shift();
                        if (!current) {
                            return resolve();
                        }
                        current(context, next).catch(e => this.log.error("got an error during command exec", e));
                    }
                    next();
                });

                if (stop) {
                    return;
                }
            }

            handler(context, () => undefined);
        });

        this.log("im ready!");
    }

    async importAllCommandFiles() {
        const commands = await fs.readdir(resolve(__dirname, "commands")).then(commands => commands.map(command => resolve(__dirname, "commands", command)));
        await Promise.all(commands.map(command => import(command)));
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