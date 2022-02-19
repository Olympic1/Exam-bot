import { Snowflake } from 'discord.js';
import { Document, model, Schema } from 'mongoose';

export interface IProfile {
  _id: Snowflake
  cooldowns: IRecord[]
  exams: IRecord[]
}

export interface IRecord {
  guildId: Snowflake
  name: string
  date: Date
}

export type ProfileDoc = IProfile & Document;

const profileSchema = new Schema({
  // User ID
  _id: {
    type: String,
    required: true
  },
  cooldowns: {
    type: Array,
    default: []
  },
  exams: {
    type: Array,
    default: []
  }
});

export const profileModel = model<ProfileDoc>('Profile', profileSchema);