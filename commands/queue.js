const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('kilistázza a zenéket ha elfelejtetted vóna'),
    async execute(interaction, bot) {
        if (!bot.queue.get(interaction.guild.id)) return interaction.reply('Üres  </play:1049229882988695552>!');
        const songList = bot.queue.get(interaction.guild.id).songs;
        let list = [];
        let count = 1;
        let totalLength = 0;
        
        for (let index in songList) {
            let object = songList[index];
            list.push(`\`${count}.\` **${object.title}** Kérte ${object.author}`);
            count++;
            totalLength += object.timestamp;
        }

        function time(duration) {
            var hrs = ~~(duration / 3600);
            var mins = ~~((duration % 3600) / 60);
            var secs = ~~duration % 60;
            var ret = "";
            if (hrs > 0) ret += `${hrs}:${(mins < 10 ? "0" : "")} `;
            ret += `${mins}:${(secs < 10 ? "0" : "")}`;
            ret += secs;
            return ret;
        }
        
        const emb = new EmbedBuilder()
            .setAuthor({ name: 'bot Music', iconURL: bot.user.displayAvatarURL() })
            .setThumbnail(songList[0].thumbnail)
            .setColor('LuminousVividPink')
            .setTitle('Baszd meg Baro73 :DDDD')
            .setDescription(`${songList.length} • ${time(totalLength)} mins\n\n${list.join('\n')}`)
            .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL() });
        interaction.reply('had szoljon!');
    },
};