/**
 * @name Courier
 * @summary A discord bot for proxying messages for roleplaying games.
 * @author anticlimax.
 */

"use strict";
const {Client, Collection, Events, GatewayIntentBits, MessageFlags} = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { TOKEN } = require("./config.json");

const bot = new Client({intents: [GatewayIntentBits.Guilds]});

/**
 * Fires once, when client is ready for the first time.
 * TODO: initialize commands.
 */
bot.once(Events.ClientReady, (botInstance) => {
    console.log("Courier is ready!")
});

// Register slash commands
bot.commands = new Collection();
const commandPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const commandFilePath = path.join(commandPath, file);
    const command = require(commandFilePath);
    if ("properties" in command && "execute" in command) {
        if (command.properties.isSlashCommand) {
            bot.commands.set(command.properties.name, command);
            console.log("Loaded command " + command.properties.name);
        }
    } else console.log(`[!!! WARN !!!] ${commandFilePath} could not be registered as a slash command and is not flagged as a non-slash function. It may be missing its property or execute members.`)
}

// TODO: register nonslash commands?

bot.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return; 
	const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return console.error(`[!!! ERR !!! ] Command ${interaction.commandName} not found.`);
    try {
        await command.execute(interaction);
    } catch (e) {
        console.error(e);
        const errMessage = {
            content: `Whoops! There was an error while executing this command:\n\`\`\`${e.message}\`\`\``,
            flags: MessageFlags.Ephemeral
        }
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errMessage);
        } else await interaction.reply(errMessage);
    }
});

bot.login(TOKEN);