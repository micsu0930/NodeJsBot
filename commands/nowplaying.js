const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { getAverageColor } = require('fast-average-color-node');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('mi van most he'),
    async execute(interaction, bot) {
        if (!bot.queue.get(interaction.guild.id)) return interaction.reply('semmi </play:1049229882988695552>!');
        const songQueue = bot.queue.get(interaction.guild.id);
        let color;
        await getAverageColor(songQueue.songs[0].thumbnail).then(r => {
            color = r.hex;
        });
        const emb = new EmbedBuilder()
        .setAuthor({ name: 'bot Music', iconURL: bot.user.displayAvatarURL() })
        .setColor(color)
        .setImage(songQueue.songs[0].thumbnail)
        .setTitle(songQueue.songs[0].title)
        .setDescription(`• Muzsikus : ${songQueue.songs[0].artist}\n• Kigyütt: ${songQueue.songs[0].date}\n• Hossz: ${songQueue.songs[0].length}\n• Ettől a zsiványtól: ${songQueue.songs[0].author}\n• URL: ${songQueue.songs[0].url}`)
        interaction.reply({ embeds: [emb] });
    },
};