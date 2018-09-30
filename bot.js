// Load up the discord.js library
const Discord = require("discord.js");
const fetch = require('node-fetch')

var pool = require('./database')



var worldCheck = [];
var wvwPKills = []
var ybCount = 0;
var linkCount = 0;
var spyCount = 0;

var yaksBendServerID = 1003


var servers = [

    ];
var red;
var blue;
var green;



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
            "\n !kda " +
            "\n !score " +
            "\n !kills " +
            "\n !leaderboard " +
            "\n !check ");
    }

    if (message.content.startsWith("!modCommands")) {
        message.channel.send("Commands currently: " +
            "\n !purge " +
            "\n !update" +
            "\n !spyBlaster");
    }

    if(message.channel.id === "481688120215994378"){

        let userId = message.author.id;
        let userToModify = client.guilds.get("476902310581239810").members.get(userId)

        if(!message.content.startsWith("$key add")) {
            if (userToModify.roles.has("477947826442338324")) {

            } else {
                message.channel.send("Looks like you are not verified, please type this as followed\n$key add [API KEY HERE WITHOUT BRACKETS]")
            }
        }
    }

    if (message.content.startsWith("!users")) {


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

    if (message.content.startsWith("!kda")) {
        //get info
        red = null;
        blue = null;
        green = null;

        let enemyServers = await updateServers();

        let redId = enemyServers.worlds.red
        let blueId = enemyServers.worlds.blue
        let greenId = enemyServers.worlds.green

        if(red === null){
            red = await getNames(redId)
        }
        if(blue === null){
            blue = await getNames(blueId)
        }
        if(green === null){
            green = await getNames(greenId)
        }



        //old crappy code
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

                    message.channel.send(red[0].name +" KDA: " + redKda.toFixed(2))
                    message.channel.send(blue[0].name +" KDA: " + blueKda.toFixed(2))
                    message.channel.send(green[0].name +" KDA: " + greenKda.toFixed(2))
                })
            })
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
            var sql = "INSERT INTO users SET ? ON DUPLICATE KEY UPDATE api_key = VALUES(api_key)"
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

            //TODO THIS NEEDS TO CHANGE ALL THE TIME
            if(worldCheck.world === 1003 || worldCheck.world === 1010){
                await userToModify.addRole(verifiedRole.id)
                message.channel.send("You've been verified!")
            }else{
                message.channel.send("You do not belong to YB or Ebay")
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

        var sql = "SELECT * FROM users WHERE `user_id` = ?"
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


        var sql = "SELECT * FROM users"
        var result;
        try {
            //gets one result back
            result = await pool.query(sql)
        } catch (err) {
            throw new Error(err)
        }


        var roles = message.guild.roles

        // var verifiedRole = roles.find((item) => item.name === "Verified")


        message.channel.send("Purge process beginning... this will take a few minutes")
        for(let i =0; i< result.length; i++){


            await fetchBulk(result[i].api_key)

            //get users from db
            // let userToModify = client.users.get(result[i].user_id)
            let userToModify = client.guilds.get("476902310581239810").members.get(result[i].user_id)
            let verifiedRole = message.guild.roles.find("name", "Verified");
            let spyRole = message.guild.roles.find("name", "Thinks They're Sneaky");



            //numbers will need to be changed for cooresponding servers
                if (worldCheck.world === 1003) {
                    ybCount++
                    try {
                        await userToModify.addRole(verifiedRole.id)

                        //ping sql db
                        let sql = "UPDATE users SET on_yaks = ? WHERE api_key = ?"
                        let nameShame = [
                            on_yaks = 1,
                            api_key = result[i].api_key
                        ]
                        await pool.query(sql, nameShame)

                    }catch(e){
                        console.log(e)
                    }
                } else if (worldCheck.world === 1010) {
                    linkCount++
                    try {
                       await userToModify.addRole(verifiedRole.id)

                        //ping sql db
                        let sql = "UPDATE users SET on_yaks = ? WHERE api_key = ?"
                        let nameShame = [
                            on_yaks = 1,
                            api_key = result[i].api_key
                        ]
                        await pool.query(sql, nameShame)


                    }catch(e){
                        console.log(e)
                    }
                } else {
                    spyCount++
                    try {
                        if(verifiedRole != undefined) {
                            await userToModify.removeRole(verifiedRole.id)
                            await userToModify.addRole(spyRole.id)

                        }

                        //ping sql db
                        let sql = "UPDATE users SET on_yaks = ? WHERE api_key = ?"
                        let nameShame = [
                            on_yaks = 0,
                            api_key = result[i].api_key
                        ]
                        await pool.query(sql, nameShame)



                    }catch(e){
                        console.log(e)
                    }
                }
        }

        message.channel.send("YB Count: " + ybCount)
        message.channel.send("EBay Count: " + linkCount)
        message.channel.send("Spy Count: " + spyCount)

        message.channel.send("Purge process finished!")

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

    if(message.content.startsWith("!score")){
        let wvwScore = await score()

        //get info
        red = null;
        blue = null;
        green = null;

        let enemyServers = await updateServers();

        let redId = enemyServers.worlds.red
        let blueId = enemyServers.worlds.blue
        let greenId = enemyServers.worlds.green

        if(red === null){
            red = await getNames(redId)
        }
        if(blue === null){
            blue = await getNames(blueId)
        }
        if(green === null){
            green = await getNames(greenId)
        }




        //total scores
        let redScore;
        let blueScore;
        let greenScore;
        redScore = wvwScore.scores.red;
        blueScore = wvwScore.scores.blue;
        greenScore = wvwScore.scores.green;


        //total skirm points
        let redSkirm;
        let blueSkirm;
        let greenSkirm;
        redSkirm = wvwScore.victory_points.red;
        blueSkirm = wvwScore.victory_points.blue;
        greenSkirm = wvwScore.victory_points.green;

        //current skirm
        let currentRed;
        let currentBlue;
        let currentGreen;

        let lastSkirm = wvwScore.skirmishes.pop()
        currentRed = lastSkirm.scores.red
        currentBlue = lastSkirm.scores.blue
        currentGreen = lastSkirm.scores.green



        message.channel.send(
            'Total WVW Scores ----> '+ '\n' +
            red[0].name +' Score: ' + redScore + '\n' +
            blue[0].name +' Score: ' + blueScore + '\n' +
            green[0].name + ' Score: ' + greenScore + '\n' +

            'Total Skirmish Point ---->' + '\n' +
            red[0].name +' Skirmish Total: ' + redSkirm + '\n' +
            blue[0].name +' Skirmish Total: ' + blueSkirm + '\n' +
            green[0].name +' Skirmish Total: ' + greenSkirm + '\n' +

            'Current Skirmish Scores ---->' + '\n' +
            red[0].name +' Current Skirmish: ' + currentRed + '\n' +
            blue[0].name +' Current Skirmish: ' + currentBlue + '\n' +
            green[0].name +' Current Skirmish: ' + currentGreen + '\n'
        )
    }

    if(message.content.startsWith("!kills")){
        let userId;

        userId = message.author.id;


        let sql = "SELECT * FROM users where user_id = ?"
        let result;

        try{
            result = await pool.query(sql, [userId])
        } catch(err){
            throw new Error(err)
        }

        try {
            await wvwKills(result[0].api_key)
            let apiHolder = result[0].api_key
            if(wvwPKills.current == undefined){
                message.channel.send('You need to give more API access');
            }else {
                message.channel.send('Your kill total is: ' + wvwPKills.current);

                let sql = "SELECT wvwkills FROM users WHERE user_id = ?"
                let result;


                try{
                    result = await pool.query(sql, [userId])
                    let killDiff = wvwPKills.current - result[0].wvwkills

                    if(result[0].wvwkills !== null) {
                        message.channel.send('Your past kill total is: ' + result[0].wvwkills + '\nYour kill difference is: '+ killDiff);
                    }else{
                        message.channel.send('Since this is your first time running !kills, we\'ve stored your current kill count. Come back later and try again to see your new kill count!');
                    }
                } catch(err){
                }

                let killSql = "UPDATE users SET wvwkills = ? WHERE user_id = ?"

                let killLoad = [
                    wvwkills = wvwPKills.current,
                    user_id = userId
                ]
                await pool.query(killSql, killLoad)

            }
        }catch(e){
            message.channel.send('You need to verify for this.');

        }
    }

    if(message.content.startsWith("!leaderboard")){
        let sql = "SELECT * FROM users WHERE wvwkills is not null AND on_yaks=1 order by wvwkills desc limit 10"
        let result;

        result = await pool.query(sql)
        console.log(result)

        //create leaderboard

        message.channel.send('Processing your request...')

        let storeUserInfo = result.map(({api_key, wvwkills}) => ({api_key, wvwkills}));

        for(let i=0; i<storeUserInfo.length; i++ ) {
            let holder = await fetchAccounts(storeUserInfo[i].api_key)

            storeUserInfo[i]["name"] = holder.name
        }

            message.channel.send(
            {embed: {
                color: 3447003,
                author: {
                  name: client.user.username,
                  icon_url: client.user.avatarURL
                },
                title: "Top 10 Leaderboard",
                description: "The killingest people in Yak's Bend",
                fields: [{
                    name: "#1",
                    value: "Name: " + storeUserInfo[0].name + "Kill Count: " + storeUserInfo[0].wvwkills
                  },
                  {
                    name: "#2",
                    value: "Name: " + storeUserInfo[1].name + "Kill Count: " + storeUserInfo[1].wvwkills
                  },
                  {
                    name: "#3",
                    value: "Name: " + storeUserInfo[2].name + "Kill Count: " + storeUserInfo[2].wvwkills
                  },
                  {
                    name: "#4",
                    value: "Name: " + storeUserInfo[3].name + "Kill Count: " + storeUserInfo[3].wvwkills
                  },
                  {
                    name: "#5",
                    value: "Name: " + storeUserInfo[4].name + "Kill Count: " + storeUserInfo[4].wvwkills
                  },
                  {
                    name: "#6",
                    value: "Name: " + storeUserInfo[5].name + "Kill Count: " + storeUserInfo[5].wvwkills
                  },
                  {
                    name: "#7",
                    value: "Name: " + storeUserInfo[6].name + "Kill Count: " + storeUserInfo[6].wvwkills
                  },
                  {
                    name: "#8",
                    value: "Name: " + storeUserInfo[7].name + "Kill Count: " + storeUserInfo[7].wvwkills
                  },
                  {
                    name: "#9",
                    value: "Name: " + storeUserInfo[8].name + "Kill Count: " + storeUserInfo[8].wvwkills
                  },
                  {
                    name: "#10",
                    value: "Name: " + storeUserInfo[9].name + "Kill Count: " + storeUserInfo[9].wvwkills
                  }
                ]
            }
        }
    ) 
}

    if(message.content.startsWith("!update")){
        // let sql = "select * from users where wvwkills is not null"
        let sql = "select * from users"

        let result;

        result = await pool.query(sql)


        message.channel.send("Beginning update... this may take a few moments")
        let addingAccountName;
        for(let i=0; i<result.length; i++){
            addingAccountName = await fetchAccounts(result[i].api_key)
            let insertSql = "UPDATE users SET account_id = ? WHERE api_key = ?"
            let addAccount = [
                account_id = addingAccountName.name,
                api_key = result[i].api_key
            ]
            await pool.query(insertSql, addAccount)

        }
        message.channel.send("Update completed!")
    }

    if(message.content.startsWith("!spyBlaster")){
        let sql = "SELECT account_id FROM users WHERE on_yaks = 0"

        let result;

        result = await pool.query(sql)

        message.channel.send("Spy blast happening, lets see what we got!")

        let accountNameList =[];
        for(let i=0; i<result.length; i++){
            accountNameList.push(result[i].account_id)
        }
        message.channel.send('Tag and bagged!' +'\n' + accountNameList)
    }

});












//api calls
const fetchAccounts = async (api) =>{
    var url = 'https://api.guildwars2.com/v2/account?access_token='
    try {
        let response = await fetch(url + api)
        response = await response.json()
        return response
    }catch(e){
        return false
    }
}


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

const overView = async () => {
    var url = 'https://api.guildwars2.com/v2/worlds?ids=all'
    try {
        let response = await fetch(url)
        worldCheck = await response.json()
        return worldCheck
    }catch(e){
        return e.message
    }
}

const wvwKills = async (api) => {
    var url = 'https://api.guildwars2.com/v2/account/achievements?access_token='+api+'&id=283'

    try {
        let response = await fetch(url)
        wvwPKills = await response.json()
        return wvwPKills
    }catch(e){
        return e.message
    }
}

const score = async () => {
    var url = 'https://api.guildwars2.com/v2/wvw/matches/scores?world=' + yaksBendServerID
    let wvwScores

    let response = await fetch(url)
    wvwScores = await response.json()
    return wvwScores
}

const updateServers = async () => {
    let url = 'https://api.guildwars2.com/v2/wvw/matches/overview?world=' + yaksBendServerID
    let wvwServers

    let response = await fetch(url)
    wvwServers = await response.json();
    return wvwServers

}

const getNames = async (serverId) => {
    let url = 'https://api.guildwars2.com/v2/worlds?ids=' + serverId
    let server

    let response = await fetch(url)
    server = await response.json();
    return server

}

client.login(config.token);

//issue with DB connetion - its not on... turn on so you can hit.