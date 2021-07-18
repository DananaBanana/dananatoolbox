const discord = require("discord.js");

module.exports.makeId = async function(length) {

    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * 
    charactersLength));
    }
    return result;

}

module.exports.videoId = function(url) {
    var match = url.match(/v=([0-9a-z_-]{1,20})/i);
    return (match ? match['1'] : false);
 };