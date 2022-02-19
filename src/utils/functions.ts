import { ActivityType, Guild, GuildBasedChannel, GuildMember, Role, Snowflake } from 'discord.js';
import { DateTime } from 'luxon';
import { IGuild } from '../models/guildModel';
import { BotClient } from '../structures/BotClient';
import { createCronJob } from './job';
import { logger } from './logger';

/** Logs an unhandled rejection from a promise. */
export function handleRejection(reason: unknown, promise: Promise<unknown>): void {
  if (reason instanceof Error) {
    // Ignore 'Missing Access' errors
    if (reason.message.includes('Missing Access')) return;

    logger.error(`Er is een niet afgehandelde afwijzing opgetreden: ${reason}`);
    return;
  }

  logger.error(reason);
}

/** Logs an uncaught exception and termimates the bot. */
export function handleException(error: Error): void {
  if (!error) {
    logger.error('Er is een ongedefinieerde uitzondering opgetreden.');
    return;
  }

  logger.error(`Er is een niet afhandelde uitzondering opgetreden: ${error}`);
}

/** Logs a warning. */
export function handleWarning(warning: Error | string): void {
  if (!warning || typeof warning === 'string' && !warning.length) {
    logger.error('Er is een ongedefinieerde waarschuwing opgetreden.');
    return;
  }

  logger.warn(`Er is een waarschuwing opgetreden: ${warning}`);
}

/** Converts seconds into a string in the format of days, hours, minutes and seconds. */
export function formatToDuration(seconds: number): string {
  // Don't allow 0
  if (seconds <= 0) return '0 sec';

  // Calculate time
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor(seconds % (3600 * 24) / 3600);
  const minutes = Math.floor(seconds % 3600 / 60);
  seconds = Math.floor(seconds % 60);

  let result = '';

  // Construct message
  if (days) result += days + (days === 1 ? ' dag ' : ' dagen ');
  if (hours) result += `${hours} uur `;
  if (minutes) result += `${minutes} min `;
  if (seconds) result += `${seconds} sec`;

  return result;
}

/** Converts milliseconds into a string in the format of a localized date and time. */
export function formatToDate(milliseconds: number, showSeconds?: boolean): string {
  const date = new Date(milliseconds);

  // Setup options
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: showSeconds ? 'numeric' : undefined,
    timeZone: 'Europe/Brussels'
  };

  return date.toLocaleString('nl-BE', options);
}

/** Tries to parse the provided time into a number in the format of seconds. If the provided time has an invalid format, returns an error message. */
export function tryParseTime(time: string): number | string {
  // Don't allow 0
  if (!time) return 'Ongeldig formaat. Geef ten minste 1 cijfer en letter, voorbeelden: `10s`, `5m`, etc.';
  if (+time < 1) return 'Ongeldig formaat. De duur moet minstens 1 zijn.';

  // Check if there is only a number
  if (!isNaN(+time)) return +time;

  // Search for the duration and character
  const duration = +(time.match(/^\d+/) || '');
  const character = (time.match(/[a-z]+$/i) || '').toString().charAt(0).toLowerCase();

  // Check if the found values are valid
  if (!duration || !character) return 'Ongeldig formaat. Geef ten minste 1 cijfer en letter, voorbeelden: `10s`, `5m`, etc.';
  if (isNaN(duration)) return 'Ongeldig formaat. Het getal is ongeldig.';
  if (character !== 's' && character !== 'm' && character !== 'h' && character !== 'd') return 'Ongeldig formaat. Onbekend type. Geef `s`, `m`, `h` of `d` op voor respectievelijk seconden, minuten, uren of dagen.';

  // Check if the duration is within the ranges
  if ((character === 's' || character === 'm') && duration > 60) return 'Ongeldig formaat. Seconden of minuten kunnen niet langer zijn dan 60.';
  if (character === 'h' && duration > 24) return 'Ongeldig formaat. Uren kunnen niet langer zijn dan 24.';
  if (character === 'd' && duration > 365) return 'Ongeldig formaat. Dagen kunnen niet langer zijn dan 365.';

  // Search for the character
  switch (character) {
    case 's':
      return duration;
    case 'm':
      return duration * 60;
    case 'h':
      return duration * 3600;
    case 'd':
      return duration * 3600 * 24;
  }
}

/** Checks if the provided date has a valid format and returns `true` or `false`. */
export function isValidDate(date: string | undefined): boolean {
  if (!date) return false;

  // Checks date with /
  const slash = DateTime.fromFormat(date, 'd/M').isValid;
  const slashYear = DateTime.fromFormat(date, 'd/M/y').isValid;

  // Checks date with -
  const hyphen = DateTime.fromFormat(date, 'd-M').isValid;
  const hyphenYear = DateTime.fromFormat(date, 'd-M-y').isValid;

  return slash || slashYear || hyphen || hyphenYear;
}

/** Checks if the provided date has a valid format and returns an ISO 8601-compliant string; otherwise returns null. */
export function convertToISO(date: string | undefined): string | null {
  if (!date) return null;

  const formats = ['d/M', 'd/M/y', 'd-M', 'd-M-y'];

  for (const format of formats) {
    const result = DateTime.fromFormat(date, format);

    if (result.isValid) return result.setZone('utc', { keepLocalTime: true }).toISO();
  }

  // Invalid format
  return null;
}

/** Tries to find an user via the provided user's name, nickname, ID, tag or mention and returns a resolved user object. If no user was found, returns null. */
export async function getUser(guild: Guild, user: string | undefined, context?: GuildMember[]): Promise<GuildMember | null> {
  if (!user) return null;

  // If there is a context provided, use it to search for users.
  // If not, check if there is a guild provided to get all the users in the guild.
  // Otherwise an empty array.
  const users = context ? context : guild ? (await guild.members.fetch()).map(gm => gm) : [];

  if (!users || !users.length) return null;

  // Check if we have a mention
  const mention = new RegExp(/<@!?(\d+)>/g).exec(user);

  if (mention && mention.length > 1) {
    const userViaMention = users.find(m => m.user.id === mention[1]);

    if (userViaMention) return userViaMention;
  }

  // Check if we have an user's tag
  if (user.indexOf('#') > -1) {
    const [name, discriminator] = user.split('#');
    const userViaDiscriminator = users.find(m => m.user.username === name && m.user.discriminator === discriminator);

    if (userViaDiscriminator) return userViaDiscriminator;
  }

  // Check if we have an user's ID
  if (user.match(/^(\d+)$/)) {
    const userViaId = users.find(m => m.user.id === user);

    if (userViaId) return userViaId;
  }

  // Check if we have an user's name
  const userViaName = users.find(m => m.user.username === user);

  if (userViaName) return userViaName;

  // Check if we have an user's nickname
  const userViaNick = users.find(m => m.nickname === user);

  if (userViaNick) return userViaNick;

  // Nothing found
  return null;
}

/** Tries to find a role via the provided role's name, ID or mention and returns a resolved role object. If no role was found, returns null. */
export function getRole(guild: Guild, role: string | undefined): Role | null {
  if (!role) return null;

  // Check if we have a mention
  const mention = new RegExp(/<@&(\d+)>/g).exec(role);

  if (mention && mention.length > 1) {
    const roleViaMention = guild.roles.cache.find(r => r.id === mention[1]);

    if (roleViaMention) return roleViaMention;
  }

  // Check if we have a role's ID
  if (role.match(/^(\d+)$/)) {
    const roleViaId = guild.roles.cache.find(r => r.id === role);

    if (roleViaId) return roleViaId;
  }

  // Check if we have a role's name
  const roleViaName = guild.roles.cache.find(r => r.name.toLowerCase() === role.toLowerCase());

  if (roleViaName) return roleViaName;

  // Nothing found
  return null;
}

/** Tries to find a channel via the provided channel's name, ID or mention and returns a resolved channel object. If no channel was found, returns null. */
export function getChannel(guild: Guild, channel: string | undefined): GuildBasedChannel | null {
  if (!channel) return null;

  // Check if we have a mention
  const mention = new RegExp(/<#!?(\d+)>/g).exec(channel);

  if (mention && mention.length > 1) {
    const channelViaMention = guild.channels.cache.find(c => c.id === mention[1]);

    if (channelViaMention) return channelViaMention;
  }

  // Check if we have a channel's ID
  if (channel.match(/^(\d+)$/)) {
    const channelViaId = guild.channels.cache.find(c => c.id === channel);

    if (channelViaId) return channelViaId;
  }

  // Check if we have a channel's name
  const channelViaName = guild.channels.cache.find(c => c.name === channel);

  if (channelViaName) return channelViaName;

  // Nothing found
  return null;
}

/** Sets the presence of the bot. */
export function setBotStatus(client: BotClient<true>, status: string, type?: Exclude<ActivityType, 'CUSTOM'>): void {
  client.user.setPresence({
    status: 'online',
    activities: [{
      name: status,
      type: type || 'PLAYING'
    }]
  });
}

/** Stops the current cronjob and starts one with the new data. */
export function updateCronjob(client: BotClient<true>, guildId: Snowflake, data: IGuild): void {
  try {
    // If we already have a job running, stop it before we change the data
    const job = client.cronJobs.get(guildId);
    job?.stop();
  } catch (error) {
    // Ignore
  }

  // Start a cronjob with the new data
  const newJob = createCronJob(client, data);

  // Cache the new data
  client.cronJobs.set(guildId, newJob);
}