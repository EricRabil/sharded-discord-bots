import { Command, Context } from "../../api/command";

class MainCommands {
    @Command("ping")
    ping(context: Context, next: (err?: any) => any): any {
        context.message.reply("PONG!");
    }
}

export const Commands = new MainCommands();