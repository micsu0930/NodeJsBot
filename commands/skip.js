const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('mehet a kövi'),
    async execute(interaction, bot) {
        const skipFn = bot.skip.get(interaction.guild.id);
        skipFn(interaction);
    },
};