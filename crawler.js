var tools = require('./crawlerTools');
var fs = require('fs');
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

        x = await tools.getAllTag(ID);
        result["tag"] = x;

        x = await tools.getBookmark(ID);
        result["bookmark"] = x.slice(0);
        // while (x.length != 0) userQueue.push(x.shift());

        x = await tools.getFriends(ID);
        result["friends"] = x.slice(0);
        // while (x.length != 0) userQueue.push(x.shift());

        x = await tools.getAllIllust(ID);
        result["Allillust"] = x.slice(0);
        // while (x.length != 0) illustQueue.push(x.shift());

        x = await tools.getIllustBookmark(ID);
        result["illustBookmark"] = x.slice(0);
        // while (x.length != 0) illustQueue.push(x.shift());

        // x = await tools.getIllust(ID);
        fs.writeFile("test.txt", JSON.stringify(result), function(err) {
                if (err) {
                    console.log("Error!");
                }
                console.log('Saved.');
            })
            // console.log(userQueue);
            // console.log(illustQueue);
    }
}

userQueue.push(ID);
main();