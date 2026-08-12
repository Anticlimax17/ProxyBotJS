exports.execute = async (interaction) => {
    await interaction.reply(":ping_pong: **Pong!**")
}

exports.properties = {
    name: "ping",
    alias: [],
    isSlashCommand: true,
    hidden: false,
    helpStr: "Ping the bot to test its responsiveness.",
    options: {}
}