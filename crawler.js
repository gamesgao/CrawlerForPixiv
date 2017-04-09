var tools = require('./crawlerTools');
// var db = require('./mongoDB')
var userQueue = [];
var illustQueue = [];
var result;
var ID = 8189060;

async function main() {
    while (userQueue.length != 0) {
        ID = userQueue.shift();
        console.log(ID);
        var x = await tools.getmember(ID);
        result = x;

        x = await tools.getBookmark(ID);
        while (x.length != 0) userQueue.push(x.shift());

        x = await tools.getFriends(ID);
        while (x.length != 0) userQueue.push(x.shift());

        x = await tools.getAllIllust(ID);
        while (x.length != 0) illustQueue.push(x.shift());
        // console.log(result);
        // console.log(userQueue);
        // console.log(illustQueue);
    }
}

userQueue.push(ID);
main();