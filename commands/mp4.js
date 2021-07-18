const discord = require("discord.js");
const path = require('path');
var botConfig = require(path.join(__dirname, "..", "botconfig.json"));
const fs = require("fs");
const youtubedl = require('youtube-dl-exec')
const lib = require(path.join(__dirname, "..", "lib.js"))
const anonfile = require("anonfile-lib")

module.exports.run = async (bot, message, arguments) => {

    if(!arguments[0]) return message.lineReply("You need to include a youtube link.")
    let id = lib.videoId(arguments[0])
    if(!id) return message.lineReply("You need to include a youtube link.")

    id = id + ".mp4"
    message.channel.send("Started Download!").then(m => {
        youtubedl(arguments[0], {
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
        })
    })
}

module.exports.help = {
    name: "mp4",
    aliasses: ["video"],
    description: "Download the video of a youtube video."
}