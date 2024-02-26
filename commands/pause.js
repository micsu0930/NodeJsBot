const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Megállj '),
    async execute(interaction, bot) {
        const player = bot.player.get(interaction.guild.id);
        await player.pause();
        interaction.reply('megállt');
    },
};