const Discord = require("discord.js");
const fetch = require('node-fetch');
const cron = require('cron').CronJob;
const opus = require('node-opus');
var ffmpeg = require('ffmpeg')

var config = require('./auth2.json')

const client = new Discord.Client();

class CommBot{

    constructor(stream, voice){

        //The bot logs in, and attempts to join the voice channel.
        client.login(config.token)
        
        //Pass the parameters again to the join() method and attempt to join the voice channel
        this.join(stream, voice)
    }
    join(stream, voice){

        //Make sure the client is ready before joining.
        client.on("ready", () => {

            console.log("Bot2 ready...")

            //Check to make sure we actually have the stream and voice channel before we attempt to join
            if(voice != undefined && stream != undefined){
                
                //This is seemingly where I've been getting problems. The join() function is called, and the connection is seemingly
                //formed, but the second bot doesn't actually join the channel in discord. I don't know why it's doing this, but it 
                //could be that the bot is attempting to join the channel before it is fully logged in.
                voice.join().then( connection =>{

                    /*Some logging and debugging stuff. I'll comment it right now, but for reference, the connection
                        doesn't register as authenticated, ready, nor does it throw an error.

                    console.log("connected")

                    connection.on("authenticated", () => {console.log("connection authenticated")})
                    connection.on("error", (error) => {console.log(error)})
                    connection.on("ready", () => {console.log("connection ready")})
                    */

                    //Play the stream over the voice connection.
                    const dispatcher = connection.playStream(stream);
                
                    /*More debugging stuff. The dispatcher never starts nor throws an error. I imagine it's the same reason the
                        connectiong is all wonky.

                    dispatcher.on("start", () =>{
                        console.log("dispatcher has started streaming")
                    })
                    dispatcher.on("error", (error) =>{
                        console.log(error)
                    })
                    */

                }).catch(console.error)
            
            }
            else{
                //Log if either parameter is undefined
                if(stream == undefined){
                    console.log("stream is undefined")
                }
                if(voice == undefined){
                    console.log("voice channel is undefined")
                }
            }
        })
    }
}
module.exports = CommBot