const path = require('path');
const fs = require("fs");
const youtubedl = require('youtube-dl-exec')
const lib = require(path.join(__dirname, "..", "lib.js"))
var botConfig = require(path.join(__dirname, "botconfig.json"));

module.exports.run = async (bot, message, arguments) => {

    if(!arguments[0]) return message.lineReply("You need to include a link.") 
    let id = await lib.makeId(10) // give the file a unique filename as to not have files with the same name

    id += ".mp3"
    message.channel.send("Started Download!\nThis could take a while, there is currently no way to track progress.").then(m => {
        youtubedl(arguments[0], {
            o: `./downloads/${id}`,
            recodeVideo: 'mp3', // use ytdl to download a video, make sure the filename is the id we specified, and force it to be an mp4
            "no-mtime": true
        }).then(async () => {
            m.edit(`Done!\n${botConfig.host}${id}\nThe site might not work yet, but it'll be fixed ASAP.\nFiles will be deleted after download or after 3 hours.`)
            setTimeout(function() {
                fs.unlinkSync(path.join(__dirname, "..", id)) // delete the file as to not take up too much space
            }, 3 * 60 * 60 * 1000)
        })
    })
}

module.exports.help = {
    name: "mp3",
    aliasses: ["audio"],
    description: "Download the audio of any site supported by youtube-dl."
}