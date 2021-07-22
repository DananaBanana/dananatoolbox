const path = require('path');
const fs = require("fs");
const youtubedl = require('youtube-dl-exec')
const lib = require(path.join(__dirname, "..", "lib.js"))
const anonfile = require("anonfile-lib")

module.exports.run = async (bot, message, arguments) => {

    if(!arguments[0]) return message.lineReply("You need to include a link.")
    let id = await lib.makeId(10) // give the file a unique filename as to not have files with the same name

    id = id + ".mp3"
    message.channel.send("Started Download!").then(m => {
        youtubedl(arguments[0], {
            extractAudio: true,
            audioFormat: "mp3",
            o: id // use ytdl to download an audio file, make sure the filename is the id we specified, and force it to be an mp3
        }).then(async () => {
            m.edit("Getting your files ready...") // upload the file to a 3rd party so the user can download it
            anonfile.upload(id).then(info => {
                m.edit("Done, download here: " + info.data.file.url.short)
                fs.unlinkSync(path.join(__dirname, "..", id)) // delete the file as to not take up too much space
            })
        }).catch((e) => {
            let lines = e.message.split('\n');
            lines.splice(0,1);
            e.message = lines.join('\n')
            if(e.message.length >= 2000 || e.message.length == 0) e.message = "`too long to display`"
            m.edit("Error, couldn't download your video.")
            return
        })
    })
}

module.exports.help = {
    name: "mp3",
    aliasses: ["audio"],
    description: "Download the audio of any site supported by youtube-dl."
}