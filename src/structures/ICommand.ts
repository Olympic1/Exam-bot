import { ApplicationCommandOptionData, CommandInteraction, Message, MessageEmbed, PermissionString } from 'discord.js';
import { BotClient } from './BotClient';

export interface ICommand {
  name: string
  aliases?: string[]
  description?: string
  cooldown?: number
  permissions?: PermissionString[]
  ownerOnly?: boolean
  slash?: boolean | 'both'
  category?: string
  minArgs?: number
  maxArgs: number
  expectedArgs?: string[]
  syntaxError?: string
  examples?: string[]
  options?: ApplicationCommandOptionData[]
  execute: ICallback
}

export interface ICallback {
  (client: BotClient<true>, message: Message<true> | CommandInteraction<'cached'>, args: string[]): Promise<['send' | 'reply', string] | ['embed', MessageEmbed]>
}