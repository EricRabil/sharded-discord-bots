import bignum from "big-integer";
import child_process, { ChildProcess } from "child_process";
import { bot_path, how_many_bots } from "../const";
import { parseMessage, EventType } from "..";
import { Log } from "../logger";

interface BotParameters {
    shardID: number;
}

const calculateShardID = (guildID: string) => bignum(guildID).shiftRight(22).mod(how_many_bots).toJSNumber();

const spawn_bot = (shardID: number) => child_process.fork(bot_path, [shardID.toFixed(0)], {
    stdio: [
        process.stdin,
        process.stdout,
        'pipe',
        'ipc'
    ],
    env: {
        SHARD_ID: shardID,
        SHARD_COUNT: how_many_bots
    }
});

export interface SupervisorOptions {
    shardAmount: number;
}

export default class Supervisor {
    shardAmount: number;
    children: ChildProcess[] = [];
    log = Log.fork("supervisor");

    constructor({shardAmount}: SupervisorOptions) {
        this.shardAmount = shardAmount;
        for (let shardID = 0; shardID < shardAmount; shardID++) {
            const bot = spawn_bot(shardID);
            this.children[shardID] = bot;

            bot.on("message", rawMessage => {
                const message = parseMessage(this.log, rawMessage);

                if (!message) return;

                this.log("slave process says", message);

                switch (message.event) {
                    case EventType.HELLO:
                        bot.send(JSON.stringify({
                            event: EventType.HELLO
                        }));
                }
            });
        }
    }
}