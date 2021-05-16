const fs = require('fs');

module.exports = {
  name: 'kanaal',
  aliases: ['channel'],
  cooldown: 0,
  permissions: ['ADMINISTRATOR'],
  info: {
    description: 'Verander het kanaal waarin de bot de succes-berichten stuurt.',
    usage: 'kanaal <kanaalID>',
    examples: ['kanaal 838084030062264320', 'kanaal #algemeen'],
  },
  execute(message, args, client, discord, profileData) {
    if (!args.length) return message.reply('voer het ID of naam in van het kanaal waarin u de berichten wilt versturen.');

    const newChannel = client.utils.getChannel(message.guild, args[0]);

    if (!newChannel) return message.reply('dat is geen geldig kanaal.');
    if (client.config.examChannel === newChannel.id) return message.reply('dat kanaal gebruik ik nu al.');

    // Change the examChannel in the config file and bot
    client.config.examChannel = newChannel.id;

    // Write changes to the config file
    fs.writeFile('./config.json', JSON.stringify(client.config, null, 2), function(error) {
      if (error) {
        console.error(`Er is een fout opgetreden bij het bewerken van het kanaal in het configuratiebestand.\n${error}`);
        return message.channel.send('Er is een fout opgetreden bij het bewerken van het configuratiebestand.');
      }

      console.info(`Kanaal succesvol veranderd naar \`${newChannel.id}\`.`);
    });

    return message.channel.send(`Het kanaal is succesvol veranderd naar ${newChannel.name}.`);
  },
};