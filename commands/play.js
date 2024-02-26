const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsearch = require('yt-search');
const mcEmbed = require('../utils/mcEmb');
global.AbortController = require('node-abort-controller').AbortController;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Muzsikus')
    .addStringOption(str => str.setName('song').setDescription('ide jöhet a zene')
    .setRequired(true)),
  async execute(interaction, bot) {
    if (!interaction.member.voice.channel) return interaction.reply('Legyé fent!');
    const guildQueue = bot.queue.get(interaction.guild.id);
    const query = interaction.options.getString('song');
    let song = {};
    if (ytdl.validateURL(query)) {
      const songCache = await ytdl.getBasicInfo(query);
      song = { title: songCache.videoDetail.title, thumbnail: songCache.videoDetails.thumbnail, author: interaction.member, url: songCache.videoDetails.video_url, artist: songCache.ownerChannelName, length: songCache.lengthSeconds, timestamp: songCache.timestamp, date: songCache.uploadDate };
    } else {
      const songNameCache = await ytsearch(query);
      const songRes = (songNameCache.videos.length > 1) ? songNameCache.videos[0] : null;
      if (songRes) {
        song = { title: songRes.title, thumbnail: songRes.thumbnail, author: interaction.member, url: songRes.url, artist: songRes.author.name, length: songRes.duration.timestamp, timestamp: songRes.seconds, date: songRes.ago };
      } else {
        return interaction.reply('Nem találom');
      }
    }
    interaction.reply({ embeds: [mcEmbed(song.thumbnail, song.title, `Bele rakva a kívánság kosárba **${song.title}**`, bot.user.displayAvatarURL())] });
    if (!guildQueue) {
      const queueConstructor = {
        targetChannel: interaction.member.voice.channel,
        textChannel: interaction.channel,
        connection: null,
        songs: []
      }
      queueConstructor.songs.push(song);
      bot.queue.set(interaction.guild.id, queueConstructor);
      try {
        const connection = await joinVoiceChannel({
          channelId: interaction.member.voice.channel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator
        });
        queueConstructor.connection = connection;
        streamPlayer(interaction.guild.id, queueConstructor.songs[0]);
      } catch (error) {
        bot.queue.delete(interaction.guild.id);
        interaction.channel.send(`Error connecting to the channel, \`${error}\``);
        throw error;
      }
    } else {
      guildQueue.songs.push(song);
    }
    bot.skip.set(interaction.guild.id, skip);
    var songQueue = bot.queue.get(interaction.guild.id);
    async function streamPlayer(guildId, songStream) {
      if (!songStream) {
        songQueue.connection.destroy();
        bot.queue.delete(guildId);
        songQueue.textChannel.send('ennyi he');
        return;
      }

      const streamCache = await ytdl(songStream.url, { filter: 'audioonly' });
      const stream = await createAudioResource(streamCache);
      const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
      player.play(stream);
      songQueue.connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        if (!songQueue) {
          songQueue.connection.destroy();
          return songQueue.textChannel.send('N incs tovabb');
        } else {
          songQueue.songs.shift();
          streamPlayer(guildId, songQueue.songs[0]);
        }
      });
      songQueue.textChannel.send({ embeds: [mcEmbed(songStream.thumbnail, songStream.title, `Most húzzák: **${songStream.title}**\n speciálba ${songStream.author}-nak`, bot.user.displayAvatarURL())] });
      bot.player.set(interaction.guild.id, player);
      player.on('error', (err) => {
        songQueue.textChannel.send(`**${songQueue.songs[0].title}** has encoding errors. Playing the next song.`);
        skip();
      });
    }
    async function skip(ins) {
      if (!songQueue.songs) return songQueue.textChannel.send('Ha nincs mit skippelni akkor nincs mit skippelni')
      songQueue.songs.shift();
      streamPlayer(interaction.guild.id, songQueue.songs[0]);
      if (ins) {
        ins.reply({ embeds: [mcEmbed(songQueue.songs[0].thumbnail, songQueue.songs[0].title, `Skipped to **${songQueue.songs[0].title}**\nRequested by ${songQueue.songs[0].author}`, bot.user.displayAvatarURL())] })
      } else songQueue.textChannel.send({ embeds: [mcEmbed(songQueue.songs[0].thumbnail, songQueue.songs[0].title, `Skipped to **${songQueue.songs[0].title}**\nRequested by ${songQueue.songs[0].author}`, bot.user.displayAvatarURL())] })
    }
  },
};