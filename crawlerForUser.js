var tools = require('./crawlerTools');
var fs = require('fs');
var db = require('./mongoDB');

var userQueue = [];
var illustQueue = [];
var result;
var ID = 8189060;

async function main() {
    console.log(userQueue);
    console.log(illustQueue);
    while (userQueue.length != 0) {
        ID = userQueue.shift();
        console.log(ID);
        result = await tools.getmember(ID);
        var AllTagPromise = tools.getAllTag(ID);
        var BookmarkPromise = tools.getBookmark(ID);
        var FriendsPromise = tools.getFriends(ID);
        var AllillustPromise = tools.getAllIllust(ID);
        var IllustBookmarkPromise = tools.getIllustBookmark(ID);

        result["tag"] = await AllTagPromise;
        var temp = await BookmarkPromise;
        result["bookmark"] = temp.slice(0);
        while (temp.length != 0) userQueue.push(temp.shift());

        temp = await FriendsPromise;
        result["friends"] = temp.slice(0);
        while (temp.length != 0) userQueue.push(temp.shift());

        temp = await AllillustPromise;
        result["allIllust"] = temp.slice(0);
        while (temp.length != 0) illustQueue.push(temp.shift());

        temp = await IllustBookmarkPromise;
        result["illustBookmark"] = temp.slice(0);
        while (temp.length != 0) illustQueue.push(temp.shift());

        // x = await tools.getIllust(ID);
        // fs.writeFile("test.txt", JSON.stringify(result), function(err) {
        //         if (err) {
        //             console.log("Error!");
        //         }
        //         console.log('Saved.');
        //     })

        db.insert(result, 'user');
    }
}


if (process.platform === "win32") {
    var rl = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.on("SIGINT", function() {
        process.emit("SIGINT");
    });
}

process.on("SIGINT", function() {
    //graceful shutdown
    fs.writeFileSync("illustQueue.txt", JSON.stringify(illustQueue), function(err) {
        if (err) {
            console.log("Error!");
        }
        console.log('Saved.');
    });
    fs.writeFileSync("userQueue.txt", JSON.stringify(userQueue), function(err) {
        if (err) {
            console.log("Error!");
        }
        console.log('Saved.');
    });
    process.exit();
});

if (fs.existsSync("illustQueue.txt")) {
    var illJSON = fs.readFileSync("illustQueue.txt", "UTF8");
    illustQueue = JSON.parse(illJSON);
}

if (fs.existsSync("userQueue.txt")) {
    var userJSON = fs.readFileSync("userQueue.txt", "UTF8");
    userQueue = JSON.parse(userJSON);
} else {
    userQueue.push(ID);
}

main();