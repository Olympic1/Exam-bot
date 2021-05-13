const { DateTime } = require('luxon');

module.exports = {
  /**
   * The **`formatToTime()`** function parses seconds and returns a string in the format of weeks, days, hours, minutes and seconds.
   * @param {number} seconds The seconds to parse.
   * @returns {string} A string in the format of weeks, days, hours, minutes and seconds.
   */
  formatToTime: (seconds) => {
    let sec = Math.trunc(seconds);

    const weeks = Math.floor(sec / (3600 * 24 * 7));
    sec -= weeks * 3600 * 24 * 7;

    const days = Math.floor(sec / (3600 * 24));
    sec -= days * 3600 * 24;

    const hrs = Math.floor(sec / 3600);
    sec -= hrs * 3600;

    const min = Math.floor(sec / 60);
    sec -= min * 60;

    const tmp = [];

    weeks && tmp.push(weeks + (weeks === 1 ? ' week' : ' weken'));
    days && tmp.push(days + (days === 1 ? ' dag' : ' dagen'));
    hrs && tmp.push(hrs + (hrs === 1 ? ' uur' : ' uren'));
    min && tmp.push(min + ' min');
    tmp.push(sec + ' sec');

    return tmp.join(', ');
  },

  /**
   * The **`formatToDate()`** function parses milliseconds and returns a string in the format of a localized date and time.
   * @param {number} milliseconds The milliseconds to parse.
   * @returns {string} A string in the format of a localized date and time.
   */
  formatToDate: (milliseconds) => {
    const date = new Date(milliseconds);
    const tmp = [];

    tmp.push(date.toLocaleDateString('nl-BE', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    tmp.push(date.toLocaleTimeString('nl-BE', { hour: 'numeric', minute: 'numeric', hour12: false }));

    return tmp.join(' ');
  },

  /**
   * The **`isValidDate()`** function checks if the given date has a valid format and returns true or false.
   * @param {string} date The date to check.
   * @returns {boolean} True if the given date is valid; otherwise false.
   */
  isValidDate: (date) => {
    // Checks date with /
    const check1 = DateTime.fromFormat(date, 'd/M').isValid;
    const check2 = DateTime.fromFormat(date, 'd/M/y').isValid;

    // Checks date with -
    const check3 = DateTime.fromFormat(date, 'd-M').isValid;
    const check4 = DateTime.fromFormat(date, 'd-M-y').isValid;

    return check1 || check2 || check3 || check4;
  },

  /**
   * The **`convertToISO()`** function parses a date and returns an ISO 8601-compliant string.
   * @param {string} date The date to parse.
   * @returns {string} An ISO 8601-compliant string in UTC.
   */
  convertToISO: (date) => {
    let tmp;

    // Converts date with /
    if (DateTime.fromFormat(date, 'd/M').isValid) tmp = DateTime.fromFormat(date, 'd/M');

    if (DateTime.fromFormat(date, 'd/M/y').isValid) tmp = DateTime.fromFormat(date, 'd/M/y');

    // Converts date with -
    if (DateTime.fromFormat(date, 'd-M').isValid) tmp = DateTime.fromFormat(date, 'd-M');

    if (DateTime.fromFormat(date, 'd-M-y').isValid) tmp = DateTime.fromFormat(date, 'd-M-y');

    return tmp.setZone('utc', { keepLocalTime: true }).toISO();
  },

  /**
   * The **`getUser()`** function parses a string with the username, ID, tag or mention and returns a resolved user object, or null.
   * @param {Guild} guild The guild to search in.
   * @param {string} user The user's id, name, tag or mention.
   * @param {Array} [context] The array of user id's to search in. Defaults to guild.members.
   * @returns {GuildMember|User|null} A resolved user object or null.
   */
  getUser: async (guild, user, context) => {
    if (!user) return null;

    // If there is a context provided, use it to search for users.
    // If not, check if there is a guild provided to get all the users in the guild.
    // Otherwise an empty array.
    const users = context ? context : guild ? (await guild.members.fetch()).map(gm => gm) : [];

    if (!users || !users.length) return null;

    // Check if we have a mention
    const mention = new RegExp(/<@!?(\d+)>/g).exec(user);

    if (mention && mention.length > 1) {
      const userViaMention = users.find(gm => gm.user.id === mention[1]);

      if (userViaMention) return userViaMention;
    }

    // Check if we have an user's tag
    if (user.indexOf('#') > -1) {
      const [name, discriminator] = user.split('#');
      const userViaDiscriminator = users.find(gm => gm.user.username === name && gm.user.discriminator === discriminator);

      if (userViaDiscriminator) return userViaDiscriminator;
    }

    // Check if we have an user's ID
    if (user.match(/^(\d+)$/)) {
      const userViaId = users.find(gm => gm.user.id === user);

      if (userViaId) return userViaId;
    }

    // Check if we have an user's name
    const userViaName = users.find(gm => gm.user.username === user);

    if (userViaName) return userViaName;

    // Check if we have an user's nickname
    const userViaNick = context.find(gm => gm.user.nick === user);

    if (userViaNick) return userViaNick;

    // Nothing found
    return null;
  },

  /**
   * The **`getRole()`** function parses a string with the role name, ID or mention and returns a resolved role object, or null.
   * @param {Guild} guild The guild to search in.
   * @param {string} role The role's id, name or mention.
   * @returns {Role|null} A resolved role object or null.
   */
  getRole: (guild, role) => {
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
  },

  /**
   * The **`getChannel()`** function parses a string with the channel name, ID or mention and returns a resolved channel object, or null.
   * @param {Guild} guild The guild to search in.
   * @param {string} channel The channel's id, name or mention.
   * @returns {GuildChannel|null} A resolved channel object or null.
   */
  getChannel: (guild, channel) => {
    if (!channel) return null;

    // Check if we have a mention
    const mention = new RegExp(/<#(\d+)>/g).exec(channel);

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
  },
};