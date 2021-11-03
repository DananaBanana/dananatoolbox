const path = require('path');
const fs = require("fs");
const youtubedl = require('youtube-dl-exec')
const lib = require(path.join(__dirname, "..", "lib.js"))
var botConfig = require(path.join(__dirname, "..", "botconfig.json"));

module.exports.run = async (bot, message, arguments) => {

    if(!arguments[0]) return message.lineReply("You need to include a link.") 
    let id = await lib.makeId(10) // give the file a unique filename as to not have files with the same name

    id += ".mp4"
    message.channel.send("Started Download!\nThis could take a while, there is currently no way to track progress.").then(m => {
        youtubedl(arguments[0], {
            o: `./downloads/${id}`,
            recodeVideo: 'mp4', // use ytdl to download a video, make sure the filename is the id we specified, and force it to be an mp4
            "no-mtime": true
        }).then(async () => {
            m.edit(`Done!\n${botConfig.host}downloads/${id}\nThe site might not work yet, but it'll be fixed ASAP.\nFiles will be deleted after download or after 3 hours.`)
            setTimeout(function() {
                try{
                    fs.unlinkSync(path.join(__dirname, "..", id)) // delete the file as to not take up too much space
                } catch (err) {
                    return;
                }
            }, 3 * 60 * 60 * 1000)
        })
    })
}

module.exports.help = {
    name: "mp4",
    aliasses: ["video", "anyvideo", "anyvid", "reddit", "redditsave", "ytdl", "youtubedl", "youtube"],
    description: "Download the video of any site supported by youtube-dl."
}