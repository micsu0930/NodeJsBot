const { Client, Collection } = require('discord.js');
const fs = require('fs');
const path = require('node:path');
const bot = new Client({ intents: ['Guilds', 'GuildMembers', 'GuildVoiceStates'] });
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

bot.commands = new Collection();
bot.queue = new Collection();
bot.skip = new Collection();
bot.player = new Collection();

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
  if (event.once) {
    bot.once(event.name, (...args) => event.execute(...args, bot));
  } else {
    bot.on(event.name, (...args) => event.execute(...args, bot));
  }
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	if ('data' in command && 'execute' in command) {
		bot.commands.set(command.data.name, command);
	} else {
		console.error(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection: ', error);
});

bot.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = bot.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, bot);
  } catch (error) {
    console.log(error)
    return interaction.reply({ content: `Baj van baszod \`${error}\``, ephemeral: true });
  }
});

require('dotenv').config();
bot.login(process.env.token);

