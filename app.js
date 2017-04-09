var request = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var db = require("mongoDB");
var cookie = fs.readFileSync("Cookie.txt", "UTF8");
// var $;


function timeout(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, ms);
    })
}

async function getmember(userID) {
    // 个人简介
    await request.get("http://www.pixiv.net/member.php?id=" + userID)
        .timeout(3000)
        .set("Cookie", cookie)
        .then(function(res) {
            // fs.writeFile('./member.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);
            // 读出剝几个坑表的作哝
            var infoTable = $('table.ws_table').children('tr');
            var column1 = infoTable.children('td.td1');
            var column2 = infoTable.children('td.td2');
            for (var row = 0; row < column1.length; row++) {
                console.log(column1.eq(row).text() + ':' + column2.eq(row).text().trim());
            }

            // var TrueRoomID = res.text.match(/var ROOMID = (\d*?);/)[1];
        }, err => console.log(err))
}


function getBadge($) {
    return $('span.count-badge').text().match(/[0-9]+/)[0];
}

async function getBookmark(userID, index) {
    // 关注
    await request.get("http://www.pixiv.net/bookmark.php?type=user&id=" + userID + "&rest=show&p=" + index)
        .timeout(3000)
        .set("Cookie", cookie)
        .then(async function(res) {
            // fs.writeFile('./bookmark.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);

            var temp = $("div.members").children("ul").children("li");
            temp.each(function(index, element) {
                // console.log(element);
                console.log(element.children[0].children[0].attribs["data-user_id"]);
            });

            if (index == 1) {
                for (var page = 2; page <= Math.ceil(getBadge($) / 48); page++) {
                    await getBookmark(userID, page);
                    await timeout(100);
                }
            }
        }, err => console.log(err))
}

async function getFriends(userID, index) {
    // friends

    await request.get("http://www.pixiv.net/mypixiv_all.php?id=" + userID + '&p=' + index)
        .timeout(3000)
        .set("Cookie", cookie)
        .then(async function(res) {


            // fs.writeFile('./mypixiv_all.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);

            var temp = $("ul.member-items").children("li").children("a").children('h1');
            for (var ith = 0; ith < temp.length; ith++) {
                console.log(temp.eq(ith).text());
            }
            // temp.each(function(index, element) {
            //     // console.log(element);
            //     console.log(element.attribs["data-user_id"]);
            // });

            if (index == 1) {
                for (var page = 2; page <= Math.ceil(getBadge($) / 18); page++) {
                    await getFriends(userID, page);
                    await timeout(100);
                }
            }

            // var TrueRoomID = res.text.match(/var ROOMID = (\d*?);/)[1];
        }, err => console.log(err))
}


async function getAllIllust(userID, index) {
    // 投稿的作品

    await request.get("http://www.pixiv.net/member_illust.php?id=" + userID + '&type=all&p=' + index)
        .timeout(3000)
        .set("Cookie", cookie)
        .then(async function(res) {
            // fs.writeFile('./member_illust.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);

            var allIllust = $('ul._image-items');
            var illust = $('div[data-id]', allIllust);
            // for (var ith = 0; ith < temp.length; ith++) {
            //     console.log(temp.eq(ith).text());
            // }
            illust.each(function(index, element) {
                // console.log(element);
                console.log(element.attribs["data-id"]);
            });

            if (index == 1) {
                for (var page = 2; page <= Math.ceil(getBadge($) / 20); page++) {
                    await getAllIllust(userID, page);
                    await timeout(100);
                }
            }
        }, err => console.log(err))
}

async function getIllustBookmark(userID, index) {
    // 收藏的作品
    await request.get("http://www.pixiv.net/bookmark.php?id=" + userID + "&rest=show&p=" + index)
        .timeout(3000)
        .set("Cookie", cookie)
        .then(async function(res) {
            console.log(index);

            // fs.writeFile('./bookmarkIllust.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.' + index);
            // });

            var $ = cheerio.load(res.text);

            var allIllust = $('ul._image-items');
            var illust = $('div[data-id]', allIllust);
            illust.each(function(index, element) {
                // console.log(element);
                console.log(element.attribs["data-id"]);
            });

            if (index == 1) {
                for (var page = 2; page <= Math.ceil(getBadge($) / 20); page++) {
                    await getIllustBookmark(userID, page);
                    await timeout(100);
                }
            }
        }, err => console.log(err))
}

function getIllust(illustID) {
    // 杒画
    request.get("http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + illustID)
        .timeout(3000)
        .set("Cookie", cookie)
        .end(function(err, res) {
            if (err) {
                console.log("Error!");
            }

            // fs.writeFile('./illust.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);
            var viewCount = $('dd.view-count').text();
            var ratedCount = $('dd.rated-count').text();
            var scoreCount = $('dd.score-count').text();
            var title = $('h1.title').eq(2).text();
            var tags = $('li.tag');
            var tagText = $('a.text', tags);

            for (var ith = 0; ith < tagText.length; ith++) {
                console.log(tagText.eq(ith).text());
            }
        })
}

// 8189060
var myID = 8189060;
getmember(myID);
// getBookmark(myID, 1);
// getFriends(myID, 1);
// getAllIllust(myID, 1);
// getIllustBookmark(myID, 1);
// getIllust(61961488);