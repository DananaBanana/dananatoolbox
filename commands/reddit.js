const discord = require("discord.js");
const path = require('path');
var botConfig = require(path.join(__dirname, "..", "botconfig.json"));
const fs = require("fs");
const youtubedl = require('youtube-dl-exec')
const lib = require(path.join(__dirname, "..", "lib.js"))
const anonfile = require("anonfile-lib");

module.exports.run = async (bot, message, arguments) => {

    let url = arguments[0];
    if(!url) return message.lineReply("You need to include a valid link.")
    let id = await lib.makeId(5)
    if(lib.videoId(url)) message.lineReply("You should use `.mp4` for youtube links, but this works too.")

    id = id + ".mp4"
    message.channel.send("Started Download!").then(m => {
        youtubedl(url, {
            noWarnings: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
            o: id
        }).then(async output => {
            m.edit("Getting your files ready...")
            anonfile.upload(id).then(info => {
                console.log(info)
                m.edit("Done, download here: " + info.data.file.url.short)
                fs.unlinkSync(path.join(__dirname, "..", id))
            })
        }).catch(() => {
            m.edit("Error, couldn't download your video.")
            return
        })
    })
}

module.exports.help = {
    name: "reddit",
    aliasses: ["redditsave", "u/savevideo"],
    description: "Download the video of a reddit post."
}