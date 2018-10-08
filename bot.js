// Load up the discord.js library
const Discord = require("discord.js");
const fetch = require('node-fetch')
const cron = require('cron').CronJob


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

// new CronJob('0 0 * ? * *', function() {
//     update()
// }, null, true, 'America/Los_Angeles');

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

const wvwScore = async () => {
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

async function serverList(message) {
    await overView()

    for (let i = 0; i < worldCheck.length; i++) {
        let serverId = worldCheck[i].id
        let serverName = worldCheck[i].name
        let serverPop = worldCheck[i].population

        if (parseInt(worldCheck[i].id) >= 1001 && parseInt(worldCheck[i].id) <= 1024) {
            message.channel.send('Server Id: ' + serverId + '\n Server Name: '
                + serverName + '\n Server Population: ' + serverPop)
        }

    }
}

function commands(message) {
    message.channel.send("Commands currently: " +
        "\n !users " +
        "\n !serverStatus " +
        "\n !kda " +
        "\n !score " +
        "\n !kills " +
        "\n !weekly " +
        "\n !leaderboard " +
        "\n !check ");
}

function modCommands(message) {
    message.channel.send("Commands currently: " +
        "\n !purge " +
        "\n !update" +
        "\n !spyBlaster" +
        "\n !resetLeaderboard");
}

function users(message) {
    let totalMembers = [...message.guild.members]
    let verifiedMembers = 0;

    for (let i = 0; i < totalMembers.length; i++) {
        if (totalMembers[i][1].roles.has("477947826442338324")) {
            verifiedMembers++
        }
    }

    message.channel.send(
        'Total Members:' + totalMembers.length + '\n' +
        'Verified Members: ' + verifiedMembers);
}

//gets YB warscores
function serverStatus(message) {
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

async function kda(message) {
//get info
    red = null;
    blue = null;
    green = null;

    let enemyServers = await updateServers();

    let redId = enemyServers.worlds.red
    let blueId = enemyServers.worlds.blue
    let greenId = enemyServers.worlds.green

    if (red === null) {
        red = await getNames(redId)
    }
    if (blue === null) {
        blue = await getNames(blueId)
    }
    if (green === null) {
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

                message.channel.send(red[0].name + " KDA: " + redKda.toFixed(2))
                message.channel.send(blue[0].name + " KDA: " + blueKda.toFixed(2))
                message.channel.send(green[0].name + " KDA: " + greenKda.toFixed(2))
            })
        })
}

async function keyAdd(message) {
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
        } catch (err) {
            message.author.send("Bad API key, try again!")
            throw new Error(err)

        }


        let userToModify = client.guilds.get("476902310581239810").members.get(values.user_id)
        let verifiedRole = message.guild.roles.find("name", "Verified");

        //TODO THIS NEEDS TO CHANGE ALL THE TIME
        if (worldCheck.world === 1003 || worldCheck.world === 1010) {
            await userToModify.addRole(verifiedRole.id)
            message.channel.send("You've been verified!")
        } else {
            message.channel.send("You do not belong to YB or Ebay")
        }
    }
}

async function check(message) {
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

    if (worldCheck.world === 1003) {
        message.channel.send("Yb Native")
    } else if (worldCheck.world === 1010) {
        message.channel.send("EBay Native")
    } else {
        message.channel.send("Spy")
    }
}

async function purge(message) {
    if (message.member.roles.find("name", "@mod") || message.member.roles.find("name", "Chris") ||
        message.member.roles.find("name", "@admin")) {
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
        for (let i = 0; i < result.length; i++) {


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

                } catch (e) {
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


                } catch (e) {
                    console.log(e)
                }
            } else {
                spyCount++
                try {
                    if (verifiedRole != undefined) {
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


                } catch (e) {
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
    }else{
        message.channel.send('You do not have access to this!')
    }
}

async function score(message) {
    let wvwScores = await wvwScore()

    //get info
    red = null;
    blue = null;
    green = null;

    let enemyServers = await updateServers();

    let redId = enemyServers.worlds.red
    let blueId = enemyServers.worlds.blue
    let greenId = enemyServers.worlds.green

    if (red === null) {
        red = await getNames(redId)
    }
    if (blue === null) {
        blue = await getNames(blueId)
    }
    if (green === null) {
        green = await getNames(greenId)
    }


    //total scores
    let redScore;
    let blueScore;
    let greenScore;
    redScore = wvwScores.scores.red;
    blueScore = wvwScores.scores.blue;
    greenScore = wvwScores.scores.green;


    //total skirm points
    let redSkirm;
    let blueSkirm;
    let greenSkirm;
    redSkirm = wvwScores.victory_points.red;
    blueSkirm = wvwScores.victory_points.blue;
    greenSkirm = wvwScores.victory_points.green;

    //current skirm
    let currentRed;
    let currentBlue;
    let currentGreen;

    let lastSkirm = wvwScores.skirmishes.pop()
    currentRed = lastSkirm.scores.red
    currentBlue = lastSkirm.scores.blue
    currentGreen = lastSkirm.scores.green


    message.channel.send(
        'Total WVW Scores ----> ' + '\n' +
        red[0].name + ' Score: ' + redScore + '\n' +
        blue[0].name + ' Score: ' + blueScore + '\n' +
        green[0].name + ' Score: ' + greenScore + '\n' +

        'Total Skirmish Point ---->' + '\n' +
        red[0].name + ' Skirmish Total: ' + redSkirm + '\n' +
        blue[0].name + ' Skirmish Total: ' + blueSkirm + '\n' +
        green[0].name + ' Skirmish Total: ' + greenSkirm + '\n' +

        'Current Skirmish Scores ---->' + '\n' +
        red[0].name + ' Current Skirmish: ' + currentRed + '\n' +
        blue[0].name + ' Current Skirmish: ' + currentBlue + '\n' +
        green[0].name + ' Current Skirmish: ' + currentGreen + '\n'
    )
}

async function kills(message) {
    let userId;
    //obtain userId of one who used kill command
    userId = message.author.id;


    let sql = "SELECT * FROM users where user_id = ?"
    let result;

    try {
        //query DB for the user data
        result = await pool.query(sql, [userId])
    } catch (err) {
        throw new Error(err)
    }

    try {
        await wvwKills(result[0].api_key)
        let apiHolder = result[0].api_key
        if (wvwPKills.current == undefined) {
            message.channel.send('You need to give more API access');
        } else {
            message.channel.send('Your kill total is: ' + wvwPKills.current);

            let sql = "SELECT wvwkills FROM users WHERE user_id = ?"
            let result;


            try {
                result = await pool.query(sql, [userId])
                let killDiff = wvwPKills.current - result[0].wvwkills

                if (result[0].wvwkills !== null) {
                    message.channel.send('Your past kill total is: ' + result[0].wvwkills + '\nYour kill difference is: ' + killDiff);
                } else {
                    message.channel.send('Since this is your first time running !kills, we\'ve stored your current kill count. Come back later and try again to see your new kill count!');
                }
            } catch (err) {
            }

            //update user DB with newest kill rank
            let killSql = "UPDATE users SET wvwkills = ? WHERE user_id = ?"

            let killLoad = [
                wvwkills = wvwPKills.current,
                user_id = userId
            ]
            await pool.query(killSql, killLoad)


        }
    } catch (e) {
        message.channel.send('You need to verify for this.');

    }
}

async function leaderboard(message) {
    let sql = "select * from users where wvwkills is not null AND on_yaks=1 order by wvwkills desc limit 10"
    let result;

    result = await pool.query(sql)
    console.log(result)

    //create leaderboard

    message.channel.send('Processing your request...')

    let storeUserInfo = result.map(({api_key, wvwkills}) => ({api_key, wvwkills}));

    for (let i = 0; i < storeUserInfo.length; i++) {
        let holder = await fetchAccounts(storeUserInfo[i].api_key)

        storeUserInfo[i]["name"] = holder.name
    }


    message.channel.send('Current top 10 in WVW Kills!')
    for (let i = 0; i < storeUserInfo.length; i++) {
        message.channel.send('Rank ' + (i + 1) + ' Account Name: ' + storeUserInfo[i].name + ' Kill Count: ' + storeUserInfo[i].wvwkills)
    }
}

async function update(message) {

    if(message.member.roles.find("name", "@mod") || message.member.roles.find("name", "Chris") ||
        message.member.roles.find("name", "@admin") ) {
        let sql = "select * from users"

        let result;

        result = await pool.query(sql)


        message.channel.send("Beginning update... this may take a few moments")
        let addingAccountName;
        for (let i = 0; i < result.length; i++) {
            addingAccountName = await fetchAccounts(result[i].api_key)
            let insertSql = "UPDATE users SET account_id = ? WHERE api_key = ?"
            let addAccount = [
                account_id = addingAccountName.name,
                api_key = result[i].api_key
            ]
            await pool.query(insertSql, addAccount)

        }
        if (message)
            message.channel.send("Update completed!")
        else
            console.log('Job update complete!')
    }else{
        message.channel.send('You do not have access to this!')
    }
}

async function spyBlaster(message) {


    if(message.member.roles.find("name", "@mod") || message.member.roles.find("name", "Chris") ||
        message.member.roles.find("name", "@admin") ) {


        let sql = "SELECT account_id FROM users WHERE on_yaks = 0"

        let result;

        result = await pool.query(sql)

        message.channel.send("Spy blast happening, lets see what we got!")

        let accountNameList = [];
        for (let i = 0; i < result.length; i++) {
            accountNameList.push(result[i].account_id)
        }
        message.channel.send('Tag and bagged!' + '\n' + accountNameList)
    }else{
        message.channel.send('You do not have access to this!')
    }
}

async function weekly(message) {
    let userId;
    //obtain userId of one who used kill command
    userId = message.author.id;


    let sql = "SELECT * FROM users where user_id = ?"
    var grabUserData;

    try {
        //query DB for the user data
        grabUserData = await pool.query(sql, [userId])
    } catch (err) {
        throw new Error(err)
    }

    if(grabUserData[0].account_id === null){
        message.channel.send("Please come back later for server to be updated.")
    }else {
        try {
            await wvwKills(grabUserData[0].api_key)
            if (wvwPKills.current == undefined) {
                message.channel.send('You need to give more API access');
            } else {



                //check to see if user_id is not in weekly tourny DB
                let prev_count = parseInt(grabUserData[0].wvwkills)
                let account_id = grabUserData[0].account_id

                if (grabUserData[0].prev_count === null) {
                    let pushPrevCountSQL = "UPDATE users SET prev_count = ? WHERE account_id = ?"
                    var values = [
                        prev_count,
                        account_id
                    ]
                    await pool.query(pushPrevCountSQL, values)

                }

                let current_count = wvwPKills.current

                let weekly_kill_total;
                if(grabUserData[0].prev_count === null){
                    weekly_kill_total = 0;
                }else {
                    weekly_kill_total = wvwPKills.current - grabUserData[0].prev_count
                }

                let killWeeklySQL = "UPDATE users SET wvwkills = ?, current_count = ?, weekly_kill_total = ? WHERE account_id = ?"
                // let killWeeklySQL = "UPDATE users SET wvwkills = ?, prev_count = ?, current_count = ?, weekly_kill_total = ? WHERE account_id = ?"
                var values = [
                    current_count,
                    current_count,
                    weekly_kill_total,
                    account_id
                ]


                await pool.query(killWeeklySQL, values)

                if (grabUserData[0].prev_count === null) {
                    message.channel.send("You've been entered! Check the leaderboard at: http://thetopyak.com/ - keep typing !weekly to watch it grow!")
                }else {
                    message.channel.send("You're up too: " + weekly_kill_total + " kills this week! Check the leaderboard at: http://thetopyak.com/")
                }
            }
        } catch (e) {
            message.channel.send('You need to verify for this or run !kills prior to using this functionality.');

        }
    }
}

async function resetLeaderboard(message){

    if(message.member.roles.find("name", "@mod") || message.member.roles.find("name", "Chris") ||
        message.member.roles.find("name", "@admin") ){

        message.channel.send('Clearing Weekly contenders....')
        let clearWeeklyTournySQL = "UPDATE users SET prev_count = NULL, current_count = NULL, weekly_kill_total = NULL"

        await pool.query(clearWeeklyTournySQL)

    }else{
        message.channel.send('You do not have access to this!')
    }
}



client.on("message", async (message) => {
    if (message.author.bot) return;

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

    if (message.content.startsWith("!commands")) {
        commands(message);
    } else if (message.content.startsWith("!modCommands")) {
        modCommands(message);
    } else if (message.content.startsWith("!users")) {
        users(message);
    } else if (message.content.startsWith("!serverStatus")) {
        serverStatus(message);
    } else if (message.content.startsWith("!kda")) {
        await kda(message);
    } else if (message.content.startsWith("$key add")) {
        await keyAdd(message);
    } else if (message.content.startsWith("!check")) {
        await check(message);
    } else if (message.content.startsWith("!purge")) {
        await purge(message);
    } else if(message.content.startsWith("!serverList")){
        await serverList(message);
    } else if(message.content.startsWith("!score")){
        await score(message);
    } else if(message.content.startsWith("!kills")) {
        await kills(message);
    } else if(message.content.startsWith("!leaderboard")){
        await leaderboard(message);
    } else if(message.content.startsWith("!update")){
        await update(message);
    } else if(message.content.startsWith("!spyBlaster")){
        await spyBlaster(message);
    } else if(message.content.startsWith("!weekly")){
        await weekly(message);
    } else if(message.content.startsWith("!resetLeaderboard")){
        await resetLeaderboard(message);
    }
});











client.login(config.token);

//issue with DB connetion - its not on... turn on so you can hit.