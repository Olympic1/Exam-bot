import { ClientEvents } from 'discord.js';
import { BotClient } from './BotClient';

export interface IEvent {
  name: keyof ClientEvents
  once?: boolean
  execute: IEmit
}

export interface IEmit {
  (client: BotClient<true>, ...args: unknown[]): Promise<void>
}