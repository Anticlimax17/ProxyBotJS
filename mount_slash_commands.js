const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { clientId, guildId, TOKEN } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Creates a SlashCommandBuilder from command files and converts it to JSON for the mounting process.
 * @param {*} command The command to process.
 * @returns A JSON string
 */
function buildData(command) {
    let data = new SlashCommandBuilder()
        .setName(command.properties.name)
        .setDescription(command.properties.helpStr);
    // TODO: add options
    return data.toJSON();
}

// Register slash commands
var commands = []
const commandPath = path.join(__dirname, "commands")
const commandFiles = fs.readdirSync(commandPath).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
    const commandFilePath = path.join(commandPath, file);
    const command = require(commandFilePath);
    if ("properties" in command && "execute" in command && command.properties.isSlashCommand) {
        commands.push(buildData(command));
        console.log("Loaded command " + command.properties.name)
    } else console.log(`[!!! WARN !!!] ${commandFilePath} could not be registered as a slash command and is not flagged as a non-slash function. It may be missing its property or execute members.`)
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(TOKEN);

// and deploy your commands!
(async () => {
	try {
		console.log(`Refreshing ${commands.length} slash commands...`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });

		console.log(`Successfully refreshed ${data.length} slash commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();