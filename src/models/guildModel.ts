import { CronJob } from 'cron';
import { Snowflake } from 'discord.js';
import { Document, model, Schema } from 'mongoose';

export interface IGuild {
  _id: Snowflake
  name: string
  prefix: string
  examChannel: Snowflake
  cronTimer: string
  job: CronJob
}

export type GuildDoc = IGuild & Document;

const guildSchema = new Schema<GuildDoc>({
  // Guild ID
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    default: '$'
  },
  examChannel: {
    type: String,
    default: ''
  },
  cronTimer: {
    type: String,
    default: '0 8 * * 1-5'
  }
});

export const guildModel = model<GuildDoc>('Guild', guildSchema);