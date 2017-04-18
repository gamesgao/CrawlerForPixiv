var request = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');

var cookie = fs.readFileSync("Cookie.txt", "UTF8");

var tools = {};
var threshold = 30000;


tools.timeout = function(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, ms);
    })
}

function getBadge($) {
    return $('span.count-badge').text().match(/[0-9]+/)[0];
}

var member = {};
async function __getmember(userID) {
    // 个人简介
    await request.get("http://www.pixiv.net/member.php?id=" + userID)
        .timeout(threshold)
        .set("Cookie", cookie)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
        .then(function(res) {
            // fs.writeFile('./member.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);
            // 读取用户ID
            var Username = $('h1.user').text();
            console.log("Username:" + Username);
            member["Username"] = Username;

            // 读取用户表格内容
            var infoTable = $('table.ws_table').children('tr');
            var column1 = infoTable.children('td.td1');
            var column2 = infoTable.children('td.td2');
            for (var row = 0; row < column1.length; row++) {
                // console.log(column1.eq(row).text() + ':' + column2.eq(row).text().trim());
                member[column1.eq(row).text()] = column2.eq(row).text().trim();
            }

            // 读取用户头像
            // 保存成文件后将文件名保存到数据库中
            var imgUrl = $('img.user-image').attr("src");
            request.get(imgUrl)
                .timeout(threshold)
                .set("Cookie", cookie)
                .set("Referer", "http://www.pixiv.net/member.php?id=" + userID)
                .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
                .then(function(res) {
                    fs.writeFile(`./header/${userID}.png`, res.body, function(err) {
                        if (err) {
                            console.log("Error!");
                        }
                        console.log('Image Saved.');
                    })
                }, err => console.log(err));
            member["header"] = `./header/${userID}.png`;
        }, err => console.log(err))
}

tools.getmember = async function(userID) {
    member = {};
    await __getmember(userID);
    return member;
}


var Bookmark = [];
async function __getBookmark(userID, index) {
    // 关注
    await request.get("http://www.pixiv.net/bookmark.php?type=user&id=" + userID + "&rest=show&p=" + index)
        .timeout(threshold)
        .set("Cookie", cookie)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
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
                // console.log(element.children[0].children[0].attribs["data-user_id"]);
                Bookmark.push(element.children[0].children[0].attribs["data-user_id"]);
            });

            if (index == 1) {
                for (var page = 2; page <= Math.ceil(getBadge($) / 48); page++) {
                    await __getBookmark(userID, page);
                    await tools.timeout(100);
                }
            }
        }, err => console.log(err))
}

tools.getBookmark = async function(userID) {
    Bookmark = [];
    await __getBookmark(userID, 1);
    return Bookmark;
}


var Friend = [];
async function __getFriends(userID, index) {
    // friends

    await request.get("http://www.pixiv.net/mypixiv_all.php?id=" + userID + '&p=' + index)
        .timeout(threshold)
        .set("Cookie", cookie)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
        .then(async function(res) {


            // fs.writeFile('./mypixiv_all.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);

            var temp = $("ul.member-items").children("li").children("a");
            // .children('h1')
            // for (var ith = 0; ith < temp.length; ith++) {
            //     console.log(temp.eq(ith).text());
            // }
            temp.each(function(index, element) {
                // console.log(element);
                // console.log(element.attribs["data-user_id"]);
                Friend.push(element.attribs["data-user_id"]);
            });

            if (index == 1) {
                for (var page = 2; page <= Math.ceil(getBadge($) / 18); page++) {
                    await __getFriends(userID, page);
                    await tools.timeout(100);
                }
            }

            // var TrueRoomID = res.text.match(/var ROOMID = (\d*?);/)[1];
        }, err => console.log(err))
}
tools.getFriends = async function(userID) {
    Friend = [];
    await __getFriends(userID, 1);
    return Friend;
}

var AllIllust = [];
async function __getAllIllust(userID, index) {
    // 投稿的作品

    await request.get("http://www.pixiv.net/member_illust.php?id=" + userID + '&type=all&p=' + index)
        .timeout(threshold)
        .set("Cookie", cookie)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
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
                // console.log(element.attribs["data-id"]);
                AllIllust.push(element.attribs["data-id"]);
            });
            // //递归获得所有
            // if (index == 1) {
            //     for (var page = 2; page <= Math.ceil(getBadge($) / 20); page++) {
            //         await __getAllIllust(userID, page);
            //         await tools.timeout(100);
            //     }
            // }
        }, err => console.log(err))
}
tools.getAllIllust = async function(userID) {
    AllIllust = [];
    await __getAllIllust(userID, 1);
    return AllIllust;
}


var IllustBookmark = [];
async function __getIllustBookmark(userID, index) {
    // 收藏的作品
    await request.get("http://www.pixiv.net/bookmark.php?id=" + userID + "&rest=show&p=" + index)
        .timeout(threshold)
        .set("Cookie", cookie)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
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
                // console.log(element.attribs["data-id"]);
                IllustBookmark.push(element.attribs["data-id"]);
            });
            // // 递归获得所有
            // if (index == 1) {
            //     for (var page = 2; page <= Math.ceil(getBadge($) / 20); page++) {
            //         await __getIllustBookmark(userID, page);
            //         await tools.timeout(100);
            //     }
            // }
        }, err => console.log(err))
}
tools.getIllustBookmark = async function(userID) {
    IllustBookmark = [];
    await __getIllustBookmark(userID, 1);
    return IllustBookmark;
}



// 现在只是输出了tag，这里还需要改
async function __getIllust(illustID) {
    // 投稿作品
    await request.get("http://www.pixiv.net/member_illust.php?mode=medium&illust_id=" + illustID)
        .timeout(threshold)
        .set("Cookie", cookie)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
        .then(function(res) {
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
        }, err => console.log(err))
}

tools.getIllust = async function(illustID) {
    __getIllust(illustID);
}

var AllTag = {};
async function __getAllTag(userID) {
    // 用户tag
    await request.get("http://www.pixiv.net/member_tag_all.php?id=" + userID)
        .timeout(threshold)
        .set("Cookie", cookie)
        .set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36")
        .then(function(res) {
            // fs.writeFile('./test.html', res.text, function(err) {
            //     if (err) {
            //         console.log("Error!");
            //     }
            //     console.log('Saved.');
            // });

            var $ = cheerio.load(res.text);
            var tagList = $('dl.tag-list').children('dt');
            tagList.each(function(index, element) {
                // console.log(element.children[0].data);
                var temp = [];
                for (var tag = 0; tag < $("a.tag-name", tagList.next("dd").eq(index)).length; tag++) {
                    var tagName = $("a.tag-name", tagList.next("dd").eq(index)).eq(tag).text();
                    // console.log(tagName);
                    temp.push(tagName);
                }
                AllTag[element.children[0].data] = temp.slice(0);
            })

        }, err => console.log(err))
}

tools.getAllTag = async function(userID) {
    AllTag = {};
    await __getAllTag(userID);
    return AllTag;
}

// 8189060
// var myID = 8189060;
// tools.getmember(myID).then((x) => console.log(x));
// getBookmark(myID).then((x) => console.log(x));
// getFriends(myID).then((x) => console.log(x));
// getAllIllust(myID).then((x) => console.log(x));
// getIllustBookmark(myID).then((x) => console.log(x));
// getIllust(61961488);

module.exports = tools;