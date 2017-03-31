var request = require('superagent');
var cheerio = require('cheerio');
var fs = require('fs');
var $;

function getTrueRoomID() {
    request.get("http://www.pixiv.net/member.php?id=4364687")
        .timeout(3000)
        .set("Cookie", "p_ab_id=4; p_ab_id_2=5; _ga=GA1.2.245833915.1490266995; device_token=617ae967b7e0942b131ad4ebd4cf544e; login_ever=yes; PHPSESSID=9105635_977291571094684f50a5bd992815c404; a_type=0; module_orders_mypage=%5B%7B%22name%22%3A%22recommended_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22everyone_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22following_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22mypixiv_new_illusts%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22fanbox%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22featured_tags%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22contests%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22sensei_courses%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22spotlight%22%2C%22visible%22%3Atrue%7D%2C%7B%22name%22%3A%22booth_follow_items%22%2C%22visible%22%3Atrue%7D%5D; is_sensei_service_user=1; __utmt=1; __utma=235335808.245833915.1490266995.1490535063.1490955179.6; __utmb=235335808.2.10.1490955179; __utmc=235335808; __utmz=235335808.1490513215.3.2.utmcsr=baidu|utmccn=(organic)|utmcmd=organic; __utmv=235335808.|2=login%20ever=yes=1^3=plan=normal=1^5=gender=male=1^6=user_id=9105635=1^9=p_ab_id=4=1^10=p_ab_id_2=5=1^12=fanbox_subscribe_button=orange=1^13=fanbox_fixed_otodoke_naiyou=yes=1^14=hide_upload_form=yes=1^15=machine_translate_test=no=1")
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
            var temp = $("div.works-illust").children("ul");
            console.log(temp);
            // temp.each(function(index, element) {
            //     console.log(element);
            // }, this);

            // var TrueRoomID = res.text.match(/var ROOMID = (\d*?);/)[1];
        })
}

getTrueRoomID();