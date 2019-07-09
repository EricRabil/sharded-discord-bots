import child_process, { ChildProcess } from "child_process";
import { bot_path, how_many_bots } from "../const";
import { parseMessage, EventType } from "..";
import { Log } from "../logger";

/**
 * Creates a child process that runs the code at bot.ts
 * @param shardID the shard ID of this child
 */
const create_child = (shardID: number) => child_process.fork(bot_path, [shardID.toFixed(0)], {
    stdio: [
        process.stdin,
        process.stdout,
        'pipe',
        'ipc'
    ],
    env: {
        SHARD_ID: shardID,
        SHARD_COUNT: how_many_bots,
        FORCE_COLOR: 1
    }
});

export interface SupervisorOptions {
    shardAmount: number;
}

/**
 * Supervisor class that manages the child process bots
 */
export default class Supervisor {
    shardAmount: number;
    children: ChildProcess[] = [];
    log = Log.fork("supervisor");

    constructor({shardAmount}: SupervisorOptions) {
        this.shardAmount = shardAmount;

        // create the # of shards specified in config
        for (let shardID = 0; shardID < shardAmount; shardID++) {
            const bot = create_child(shardID);

            // assign bot process to children array
            this.children[shardID] = bot;

            // add listener
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