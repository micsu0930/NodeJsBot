const { ActivityType } = require('discord.js');

module.exports = {
  name: 'ready',
  once: true,
  execute(bot) {
    console.log(`Induljon vazzee ${bot.user.username}!`);
    bot.user.setPresence({
      activities: [{
        name: 'Bekapo dafaszom',
        type: ActivityType.Listening
      }],
      status: 'online'
    });
  },
};
