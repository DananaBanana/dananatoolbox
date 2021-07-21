const discord = require("discord.js");
var path = require('path');
var botConfig = require(path.join(__dirname, "..", "botconfig.json"));
const fs = require("fs")

module.exports.run = async (bot, message, arguments) => {

    fs.readdir(path.join(__dirname) , (err, files) => {

    
        var jsFiles = files.filter(f => f.split(".").pop() === "js");

        if(arguments[0]) { //if there is a specific request for a command
            let commands = bot.commands.get(arguments[0]) || bot.aliasses.get(arguments[0]); // make sure aliasses also work
            if(!commands) return message.lineReply("I couldn't find your command.")
            let embDescription = "Description: " + commands.help.description
            if(commands.help.aliasses) {
                let aliassesArr = [];
                commands.help.aliasses.forEach(alias => {
                    aliassesArr.push(botConfig.prefix + alias)
                })
                if (aliassesArr.length > 0) {
                    aliassesArr = ("`") + aliassesArr.join("`, `") + "`" //make aliasses look nice
                } else {
                    aliassesArr = "/"
                }
                embDescription = embDescription + "\nAliasses: " + aliassesArr
            }
            let embed = new discord.MessageEmbed()
                .setTitle(`${botConfig.prefix}${commands.help.name} help`)
                .setDescription(embDescription)
                .setTimestamp()
                .setColor('4c8639')
            return message.channel.send(embed)
        }

        // if you don't have a specific request for a command, send the list of commands

        let description = "";
        jsFiles.forEach((f,i) => {
            var fileGet = require(`../commands/${f}`);
            description = description + `\`${fileGet.help.name}\`, `
        })

        var embed = new discord.MessageEmbed()
            .setTitle(`${bot.user.username} help menu!`)
            .setDescription("**Command list:** \n" + description + "\n\nThe prefix is " + botConfig.prefix + `\n\nUse ${botConfig.prefix}help <command> to see details about a specific command.`)
            .setTimestamp()
            .setColor('4c8639')

        message.channel.send(embed)
    })

}

module.exports.help = {
    name: "help",
    aliasses: ["h"],
    description: "See all of the commands this bot has!"
}