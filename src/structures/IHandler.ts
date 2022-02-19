import { BotClient } from './BotClient';

export interface IHandler {
  execute(client: BotClient): Promise<void>
}