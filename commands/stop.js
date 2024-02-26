const { SlashCommandBuilder } = require('@discordjs/builders');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('megá lít'),
    async execute(interaction, bot) {
        bot.queue.delete(interaction.guild.id);
        getVoiceConnection(interaction.guild.id).destroy();
        interaction.reply('Deleted ');
    },
};