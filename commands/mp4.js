const path = require('path');
const fs = require("fs");

const YoutubeDlWrap = require("youtube-dl-wrap");
const youtubeDlWrap = new YoutubeDlWrap(path.join(__dirname, "..", "yt-dlp"));

const lib = require(path.join(__dirname, "..", "lib.js"))
var botConfig = require(path.join(__dirname, "..", "botconfig.json"));

module.exports.run = async (bot, message, arguments) => {

    if(!arguments[0]) return message.lineReply("You need to include a link.") 
    let id = await lib.makeId(10) // give the file a unique filename as to not have files with the same name
    let fileName;
    let editedEta = false;

    message.channel.send("Started Download!\nThis could take a while.").then(async m => {
        let metadata = await youtubeDlWrap.getVideoInfo(arguments[0]);
        if(metadata.filesize_approx*10 >= 4000000000) { // warn the user if the file is larger than 500MB, and cancel the request
            return m.edit("Cancelled.\nThe video was too large, please make sure your video size does not exceed 500MB.\nIf you still want to download the video, please use a different service or use youtube-dl.")
        }

        let youtubeDlEventEmitter = youtubeDlWrap.exec([arguments[0], 
            "-f", "bestvideo[ext=mp4][vcodec!*=av01] / best",
            "-o", `./downloads/%(title)s-[%(id)s]-[${id}].%(ext)s`, // Give it a unique filename
            "--playlist-items", "1",
            "--no-mtime",
            "--restrict-filenames",
            "-S", "codec:avc,codec:h264" // this makes sure the file can be displayed by discord if you decide to send it to your friends (this is the main reason I use this bot lol)
        ])
            .on("progress", (p) => {
                if(editedEta == false) {
                    try{
                        let minutes = Number(p.eta.substring(0,2))
                        let seconds = Number(p.eta.slice(3))
                        seconds += minutes/60
                        if(seconds >= 5) {
                            m.edit(`Started Download!\nThis could take a while.\n${p.percent}% of ${p.totalSize} at ${p.currentSpeed} | ETA: ${p.eta} (Message Updates every 5 seconds.)`)
                            editedEta = true;
                            setTimeout(() => {
                                editedEta = false;
                            }, 5 * 1000)
                        }
                    } catch (e) {/*I do not care about these errors :)*/}
                }
            })
            .on("youtubeDlEvent", (eventType, eventData) => {
                if(eventType === "download" && eventData.startsWith(' Destination: ')) {
                    // Remove " Destination: " and remove the './' as to have the correct message for the link.
                    fileName = eventData.substring(16)
                }
            })
            
            .on("error", (e) => {
                console.log(e)
                let lines = e.message.split('\n');
                lines.splice(0,1);
                e.message = lines.join('\n')
                if(e.message.length >= 2000 || e.message.length == 0) e.message = "`too long to display`"
                m.edit("Error, couldn't download your video.\n" + e.message)
                return
            })
            .on("close", async () => {
                m.edit(`Done!\n<${botConfig.host}${fileName}>\nThe site might not work yet, but it'll be fixed ASAP.\nFiles will be deleted after download or after 3 hours.`)
                setTimeout(() => {
                    fs.unlinkSync(path.join(__dirname, "..", fileName)) // delete the file as to not take up too much space
                    m.edit("File has been deleted.")
                },  3 * 60 * 60 * 1000)
                })

    })
}

module.exports.help = {
    name: "mp4",
    aliasses: ["video", "anyvideo", "anyvid", "reddit", "redditsave", "ytdl", "youtubedl", "youtube", "youtubedlp", "youtubedlp"],
    description: "Download the video of any site supported by youtube-dlp."
}