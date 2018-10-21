const Discord = require("discord.js");
const fetch = require('node-fetch');
const cron = require('cron').CronJob;
const opus = require('node-opus');
var ffmpeg = require('ffmpeg')

var config = require('./auth2.json')

class CommBot{

    constructor(stream, voiceChannel){
        const client = new Discord.Client();
        client.login(config.token)
        client.on("ready", () =>{
            voiceChannel.join().then(connection =>{
                connection.playStream(stream);
            })
        })
    }
}
module.exports = CommBot