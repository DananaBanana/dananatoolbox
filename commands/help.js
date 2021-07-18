const discord = require("discord.js");
var path = require('path');
var botConfig = require(path.join(__dirname, "..", "botconfig.json"));
const fs = require("fs")

module.exports.run = async (bot, message, arguments) => {

    fs.readdir(path.join(__dirname) , (err, files) => {

        if(err) console.log(err);
    
        var jsFiles = files.filter(f => f.split(".").pop() === "js");

        if(arguments[0]) {
            try{var fileGet = require(`../commands/${arguments[0].toLowerCase() + ".js"}`)} catch(err) {return message.lineReply("I couldn't find your command.")}
            let embDescription = "Description: " + fileGet.help.description
            if(fileGet.help.aliasses) {
                let aliassesArr = [];
                fileGet.help.aliasses.forEach(alias => {
                    aliassesArr.push(botConfig.prefix + alias)
                })
                aliassesArr = aliassesArr.join(", ")
                embDescription = embDescription + "\nAliasses: " + aliassesArr
            }
            let embed = new discord.MessageEmbed()
                .setTitle(`${botConfig.prefix}${fileGet.help.name} help`)
                .setDescription(embDescription)
                .setTimestamp()
                .setColor('4c8639')
            return message.channel.send(embed)
        }

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