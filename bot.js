// Load up the discord.js library
const Discord = require("discord.js");
const fetch = require('node-fetch')

var pool = require('./database')
var worldCheck = [];
var ybCount = 0;
var linkCount = 0;
var spyCount = 0;



// This is your client. Some people call it `bot`, some people call it `self`,
// some might call it `cootchie`. Either way, when you see `client.something`, or `bot.something`,
// this is what we're refering to. Your client.
const client = new Discord.Client();

// Here we load the config.json file that contains our token and our prefix values.
const config = require("./auth.json");
// config.token contains the bot's token
// config.prefix contains the message prefix.

client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
// Example of changing the bot's playing game to something useful. `client.user` is what the
// docs refer to as the "ClientUser".
client.user.setActivity(`Doing stuff`);
});

client.on("ready", () => {
    client.user.verified
})



client.on("message", async (message) => {

    if (message.author.bot) return;


    if (message.content.startsWith("!commands")) {
        message.channel.send("Commands currently: " +
            "\n !users " +
            "\n !serverStatus " +
            "\n !wvw " +
            "\n !serverList");
        message.channel.send("Registered Commands: \n !check");

    }

    var users = client.users;

    if (message.content.startsWith("!users")) {
        // // message.channel.send(client.users.array())
        // message.channel.send('Total users:' + users.size)
        // //show verified role
        // let verifiedMembersCount = message.guild.members
        // let convertMapToArray = [...verifiedMembersCount]
        // let verifiedCount = 0;
        // for (let i = 0; i < convertMapToArray.length; i++) {
        //     if (convertMapToArray[i][1]._roles[i] === "477947826442338324") {
        //         verifiedCount++
        //     }
        // }
        // message.channel.send('Total verified:' + verifiedCount)

        let totalMembers = [...message.guild.members]
        let verifiedMembers = 0;

        for(let i = 0; i< totalMembers.length; i++){
            if(totalMembers[i][1].roles.has("477947826442338324")){
                verifiedMembers++
            }
        }

         message.channel.send(
             'Total Members:' + totalMembers.length + '\n' +
         'Verified Members: ' + verifiedMembers);


    }


    //gets YB warscores
    if (message.content.startsWith("!serverStatus")) {
        var url = 'https://api.guildwars2.com/v2/worlds?ids=1003';
        var info;

        fetch(url)
            .then(response => {
                response.json().then(json => {
                    info = json;
                    message.channel.send("population is currently : " + info[0].population)
                });
            });
    }

    if (message.content.startsWith("!wvw")) {
        var url = 'https://api.guildwars2.com/v2/wvw/matches/stats?world=1003'
        var info
        var redKda;
        var blueKda;
        var greenKda;

        fetch(url)
            .then(response => {
                response.json().then(json => {
                    info = json;

                    redKda = info.kills.red / info.deaths.red
                    blueKda = info.kills.blue / info.deaths.blue
                    greenKda = info.kills.green / info.deaths.green

                    message.channel.send("Green KDA: " + greenKda.toFixed(2))
                    message.channel.send("Red KDA: " + redKda.toFixed(2))
                    message.channel.send("Blue KDA: " + blueKda.toFixed(2))
                })
            })
    }


    if (message.content.startsWith("!register")) {
        message.author.send("Register your API by typing !k API HERE")
    }

    if (message.content.startsWith("$key add")) {
        var storeAPI;
        var editedAPI;
        var userId;
        userId = message.author.id;
        storeAPI = message.content;
        editedAPI = storeAPI.replace('$key add ', '')

        let value = await fetchUsers(editedAPI)

        let result;
        if (value.text !== 'invalid key') {
            var values = {
                user_id: userId,
                api_key: editedAPI
            }
            var sql = "INSERT INTO yaksbenddb SET ? ON DUPLICATE KEY UPDATE api_key = VALUES(api_key)"
            try {
                result = await pool.query(sql, values)
                message.channel.send("You've been added to the DB!")
                message.author.send('Your discord User Id: ' + userId + "\n" + "Your API:" + editedAPI)
            } catch (err){
                message.author.send("Bad API key, try again!")
                throw new Error(err)

            }


            let userToModify = client.guilds.get("476902310581239810").members.get(values.user_id)
            let verifiedRole = message.guild.roles.find("name", "Verified");

            if(worldCheck.world === 1003 || worldCheck.world === 1015){
                await userToModify.addRole(verifiedRole.id)
                message.channel.send("You've been verified!")
            }else{
                message.channel.send("You do not belong to YB or IOJ")
            }
        }
    }

    if (message.content.startsWith("!check")) {
        var userId;
        var info;
        var roles = message.guild.roles
        var verifiedRole = roles.find((item) => item.name === "Verified")
        let userToModify = message.member;


        userId = message.author.id;

        var sql = "SELECT * FROM yaksbenddb WHERE `user_id` = ?"
        var result;
        try {
            //gets one result back
            result = await pool.query(sql, [userId])
        } catch (err) {
            throw new Error(err)
        }

        await fetchUsers(result[0].api_key)

        if(worldCheck.world === 1003){
            message.channel.send("Yb Native")
        }else if(worldCheck.world === 1010){
            message.channel.send("EBay Native")
        }else{
            message.channel.send("Spy")
        }
    }

    if (message.content.startsWith("!purge")) {


        var sql = "SELECT * FROM yaksbenddb"
        var result;
        try {
            //gets one result back
            result = await pool.query(sql)
        } catch (err) {
            throw new Error(err)
        }


        var roles = message.guild.roles

        // var verifiedRole = roles.find((item) => item.name === "Verified")


        for(let i =0; i< result.length; i++){


            await fetchBulk(result[i].api_key)

            //get users from db
            // let userToModify = client.users.get(result[i].user_id)
            let userToModify = client.guilds.get("476902310581239810").members.get(result[i].user_id)
            let verifiedRole = message.guild.roles.find("name", "Verified");


            //numbers will need to be changed for cooresponding servers
                if (worldCheck.world === 1003) {
                    ybCount++
                    try {
                   await userToModify.addRole(verifiedRole.id)
                    }catch(e){
                        console.log(e)
                    }
                } else if (worldCheck.world === 1010) {
                    linkCount++
                    try {
                       await userToModify.addRole(verifiedRole.id)
                    }catch(e){
                        console.log(e)
                    }
                } else {
                    spyCount++
                    try {
                        if(verifiedRole != undefined) {
                            await  userToModify.removeRole(verifiedRole.id)
                        }
                    }catch(e){
                        console.log(e)
                    }
                }
        }

        message.channel.send("YB Count: " + ybCount)
        message.channel.send("EBay Count: " + linkCount)
        message.channel.send("Spy Count: " + spyCount)

        ybCount = 0;
        linkCount = 0;
        spyCount = 0;
    }

    if(message.content.startsWith("!serverList")){
        await overView()

        for(let i = 0; i<worldCheck.length; i++) {
            let serverId = worldCheck[i].id
            let serverName = worldCheck[i].name
            let serverPop = worldCheck[i].population

            if(parseInt(worldCheck[i].id) >= 1001 && parseInt(worldCheck[i].id) <= 1024 ) {
                message.channel.send('Server Id: ' + serverId + '\n Server Name: '
                    + serverName + '\n Server Population: ' + serverPop)
            }

        }
    }


});


const fetchUsers = async (api) =>{
    var url = 'https://api.guildwars2.com/v2/account?access_token='
try {
    let response = await fetch(url + api)
    worldCheck = await response.json()
    return worldCheck
    }catch(e){
        return false
    }
    // worldCheck[i].api_key
}


const fetchBulk = async (api) => {
    var url = 'https://api.guildwars2.com/v2/account?access_token='
    try{
        let response = await fetch(url + api)
        worldCheck = await response.json()
        return worldCheck
    }catch(e){
        return e.message
    }
}

const overView = async (api) => {
    var url = 'https://api.guildwars2.com/v2/worlds?ids=all'
    try {
        let response = await fetch(url)
        worldCheck = await response.json()
        return worldCheck
    }catch(e){
        return e.message
    }
}

client.login(config.token);

