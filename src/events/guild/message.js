const profileModel = require('../../models/profileModel');

module.exports = async (client, discord, message) => {
  // Get the prefix
  const prefix = client.config.prefix;

  // Check if the command begins with the prefix and was send by an user inside a server
  if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

  // Check if the user already has a profile in our database
  let profileData;
  try {
    profileData = await profileModel.findOne({ userID: message.author.id });

    // Create a database profile for the existing user
    if (!profileData) {
      const profile = await profileModel.create({
        userID: message.author.id,
        serverID: message.guild.id,
        cooldowns: [],
        exams: []
      });

      profile.save()
        .then(profileData = await profileModel.findOne({ userID: message.author.id }));

      // Check if we can find the new profile
      if (!profileData) return message.channel.send('Er is iets fout gegaan. Voer uw commando opnieuw in.');
    }
  } catch (error) {
    console.error(`An error occurred when trying to create a database profile for an existing user.\n${error}`);
  }

  // Remove the prefix and put the arguments into an array
  const args = message.content.slice(prefix.length).split(/ +/);

  // Get the command name and remove it from the array
  const commandName = args.shift().toLowerCase();

  // Check for the command name or its aliases
  const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  // Check if the command exist
  if (!command) return message.reply(`er is geen commando met de naam of alias \`${commandName}\`. Typ \`${prefix}help\` voor meer informatie over mijn commando's.`);

  // All Discord permissions
  const permissionList = [
    'ADMINISTRATOR',
    'VIEW_CHANNEL',
    'MANAGE_CHANNELS',
    'MANAGE_ROLES',
    'MANAGE_EMOJIS',
    'VIEW_AUDIT_LOG',
    'VIEW_GUILD_INSIGHTS',
    'MANAGE_WEBHOOKS',
    'MANAGE_GUILD',
    'CREATE_INSTANT_INVITE',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'SEND_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'ADD_REACTIONS',
    'USE_EXTERNAL_EMOJIS',
    'MENTION_EVERYONE',
    'MANAGE_MESSAGES',
    'READ_MESSAGE_HISTORY',
    'SEND_TTS_MESSAGES',
    'CONNECT',
    'SPEAK',
    'STREAM',
    'USE_VAD',
    'PRIORITY_SPEAKER',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS'
  ];

  // Check if the command has permissions
  if (command.permissions.length) {
    const invalidUserPerms = [];
    const invalidBotPerms = [];

    for (const perm of command.permissions) {
      // Check if there is an invalid permission in the command
      if (!permissionList.includes(perm)) return console.warn(`The command '${command.name}' has an invalid permission set: ${perm}`);

      // Check if user has the correct permissions, unless it's the owner
      const isBotOwner = message.author.id === client.config.owner;
      if (!isBotOwner && !message.member.hasPermission(perm)) invalidUserPerms.push(perm);

      // Check if the bot has the correct permissions with exception of 'ADMINISTRATOR'
      if (perm !== 'ADMINISTRATOR' && !message.guild.me.hasPermission(perm)) invalidBotPerms.push(perm);
    }

    // Send a message if the user lacks a permission
    if (invalidUserPerms.length) return message.reply(`je mist de volgende permissies: \`${invalidUserPerms}\`.`);

    // Send a message if the bot lacks a permission
    if (invalidBotPerms.length) return message.channel.send(`Ik mis de volgende permissies: \`${invalidBotPerms}\`. Neem contact op met de serverbeheerders.`);
  }

  // Check if the command has a cooldown
  if (command.cooldown) {
    const cooldown = profileData.cooldowns.find((x) => x.name === command.name);

    if (!cooldown) {
      await profileModel.findOneAndUpdate(
        {
          userID: message.author.id
        },
        {
          $push: {
            cooldowns: {
              name: command.name,
              time: Date.now()
            }
          }
        }
      );
    } else {
      if ((command.cooldown * 1000) - (Date.now() - cooldown.time) > 0) {
        const time = (command.cooldown * 1000) - (Date.now() - cooldown.time);
        return message.reply(`je moet nog ${time} wachten voordat je dit commando weer kunt gebruiken.`);
      }

      await profileModel.findOneAndUpdate(
        {
          userID: message.author.id
        },
        {
          $pull: {
            cooldowns: {
              name: command.name
            }
          }
        }
      );

      await profileModel.findOneAndUpdate(
        {
          userID: message.author.id
        },
        {
          $push: {
            cooldowns: {
              name: command.name,
              time: Date.now()
            }
          }
        }
      );
    }
  }

  // Execute the command
  try {
    command.execute(message, args, client, discord, profileData);
  } catch (error) {
    console.error(`An error occurred when trying to execute a command.\n${error}`);
    message.channel.send(`Er is een fout opgetreden bij het uitvoeren van dat commando! Neem contact op met <@${client.config.owner}>.`);
    throw error;
  }
}