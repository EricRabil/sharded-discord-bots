import { Message } from "discord.js";
import Bot from "../bot/bot";

export interface Context<T = any> {
    state: T;
    message: Message;
}

export type CommandHandler<T = any> = (message: Context<T>, next: (err?: any) => any) => Promise<any>;

export function Command(name: string | string[], ...middleware: CommandHandler[]) {
    return function (target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) {
        const handler = propertyDescriptor.value;

        name = Array.isArray(name) ? name : [name];

        name.forEach(name => {
            Bot.bot.commandList[name] = {
                handler,
                middleware
            }
        });
    }
}