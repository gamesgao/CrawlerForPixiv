var request = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var db = require("mongoDB");
var $;

function getmember(userID) {
    // 个人简介
    var cookie = fs.readFileSync("Cookie.txt", "UTF8");

    request.get("http://www.pixiv.net/member.php?id=" + userID)
        .timeout(3000)
        .set("Cookie", cookie)
        .end(function(err, res) {
            if (err) {
                console.log("Error!");
            }


            // console.log(res.text);

            fs.writeFile('./test.html', res.text, function(err) {
                if (err) {
                    console.log("Error!");
                }
                console.log('Saved.');
            });

            $ = cheerio.load(res.text);
            // 读出前几个发表的作品
            var temp = $("div.works-illust").children("ul").children("li");

            temp.each(function(index, element) {
                // console.log(element);
                console.log(element.children[1].children[0].attribs["title"]);
            }, this);

            // var TrueRoomID = res.text.match(/var ROOMID = (\d*?);/)[1];
        })
}

function getBookmark(userID, index) {
    // 关注
    var cookie = fs.readFileSync("Cookie.txt", "UTF8");

    request.get("http://www.pixiv.net/bookmark.php?type=user&id=" + userID + "&rest=show&p=" + index)
        .timeout(3000)
        .set("Cookie", cookie)
        .end(function(err, res) {
            if (err) {
                console.log("Error!");
            }

            fs.writeFile('./bookmark.html', res.text, function(err) {
                if (err) {
                    console.log("Error!");
                }
                console.log('Saved.');
            });

            $ = cheerio.load(res.text);

            var temp = $("div.members").children("ul").children("li");
            temp.each(function(index, element) {
                // console.log(element);
                console.log(element.children[0].children[0].attribs["data-user_id"]);
            });



        })
}

getBookmark(30959, 10);