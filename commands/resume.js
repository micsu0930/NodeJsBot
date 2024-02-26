const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('folyt'),
    async execute(interaction, bot) {
        const player = bot.player.get(interaction.guild.id);
        await player.unpause();
        interaction.reply('folytköv');
    },
};