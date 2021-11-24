const discord = require("discord.js");
require('discord-reply');
var path = require('path');
var botConfig = require(path.join(__dirname, "botconfig.json"));

const bot = new discord.Client();

const fs = require("fs");
bot.commands = new discord.Collection();
bot.aliasses = new discord.Collection();

fs.readdir(path.join(__dirname, "commands"), (err, files) => { // load all commands 

    if(err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");

    if(jsFiles.length <=0) {
        console.log("Couldn't find any commands");
        return;
    }

    jsFiles.forEach((f,i) => {

        var fileGet = require(path.join(__dirname, "commands", f));
        console.log(`The file ${f} has been loaded!`)

        bot.commands.set(fileGet.help.name, fileGet);
        if(fileGet.help.aliasses) {
            fileGet.help.aliasses.forEach(alias => {
                bot.aliasses.set(alias, fileGet)
            })
        }
    })

});

bot.on("ready", async () => {

    console.log(`${bot.user.username} is online.`)

    bot.user.setActivity("with ytdl!", { type: "PLAYING" });

})

bot.on("message", async message => {

    //return if in DM's
    if(message.channel.type === 'dm') return;
    if(message.author.bot) return;
    
    var prefix = botConfig.prefix;

    if(message.content.startsWith(prefix)) { // basic command handling

    var messageArray = message.content.split(" ");
    var command = messageArray[0];

    var arguments = messageArray.slice(1);
    var commands = bot.commands.get(command.slice(prefix.length)) || bot.aliasses.get(command.slice(prefix.length));

    if(commands) return commands.run(bot, message, arguments);
    
    }

 });

const express = require("express")
const app = express()
const port = 3000

app.get('/downloads/:file', function(req, res, next){
    var filePath = path.join(__dirname, 'downloads', req.params.file);

    res.attachment(filePath)
    res.download(filePath, req.params.file, function (err) {
        if (!err) {
            try {
            return fs.unlinkSync(filePath);
        } catch (err) {
            return console.log(err)
            }
        }
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})


bot.on('error', console.error);

bot.login(botConfig.token)

const disbut = require('discord-buttons')(bot);